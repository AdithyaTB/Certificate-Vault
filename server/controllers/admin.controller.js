const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const Config = require('../models/Config');
const AuditLog = require('../models/AuditLog');

// ── Helper: create audit log entry ───────────────────────────────────────────
const log = async (action, targetType, targetId, targetName, adminEmail, metadata = {}, ip = '') => {
    try {
        await AuditLog.create({ action, targetType, targetId, targetName, adminEmail, metadata, ip });
    } catch (_) { /* non-fatal */ }
};

// ── Helper: get or create global Config singleton ────────────────────────────
const getConfig = async () => {
    let config = await Config.findOne({ key: 'global' });
    if (!config) config = await Config.create({ key: 'global' });
    return config;
};

// ── Helper: convert objects array → CSV string ───────────────────────────────
const toCSV = (rows, fields) => {
    const header = fields.join(',');
    const lines = rows.map(r =>
        fields.map(f => JSON.stringify(String(r[f] ?? ''))).join(',')
    );
    return [header, ...lines].join('\n');
};


// ════════════════════════════════════════════════════════════════════════════
// 1. ADMIN AUTH
// ════════════════════════════════════════════════════════════════════════════

// @route  POST /api/admin/login
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
        { email: ADMIN_EMAIL, isAdmin: true },
        process.env.ADMIN_JWT_SECRET,
        { expiresIn: '8h' }
    );

    await log('ADMIN_LOGIN', 'Admin', '', ADMIN_EMAIL, ADMIN_EMAIL, {}, req.ip);

    res.json({ token, email: ADMIN_EMAIL });
};

// ════════════════════════════════════════════════════════════════════════════
// 2. USERS
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/users
exports.getUsers = async (req, res) => {
    const { q = '', page = 1, limit = 20 } = req.query;
    const filter = q ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] } : {};
    const [users, total] = await Promise.all([
        User.find(filter).select('-password').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
        User.countDocuments(filter),
    ]);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @route  GET /api/admin/users/:id
exports.getUserDetail = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const certs = await Certificate.countDocuments({ user: req.params.id });
    res.json({ user, certCount: certs });
};

// @route  PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await log('UPDATE_ROLE', 'User', user._id, user.email, req.admin.email, { role });
    res.json(user);
};

// @route  PATCH /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
    const { status } = req.body; // 'active' | 'banned' | 'suspended'
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await log('UPDATE_STATUS', 'User', user._id, user.email, req.admin.email, { status });
    res.json(user);
};

// @route  DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Certificate.deleteMany({ user: user._id });
    await user.deleteOne();
    await log('DELETE_USER', 'User', user._id, user.email, req.admin.email, {});
    res.json({ message: 'User and all certificates deleted.' });
};

// ════════════════════════════════════════════════════════════════════════════
// 3. CERTIFICATES (Moderation)
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/certificates
exports.getCertificates = async (req, res) => {
    const { q = '', status = '', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { issuer: { $regex: q, $options: 'i' } }];
    if (status) filter.moderationStatus = status;
    const [certs, total] = await Promise.all([
        Certificate.find(filter).populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
        Certificate.countDocuments(filter),
    ]);
    res.json({ certs, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @route  PATCH /api/admin/certificates/:id/moderate
exports.moderateCertificate = async (req, res) => {
    const { action, reason } = req.body; // action: 'approve' | 'reject' | 'flag'
    const statusMap = { approve: 'approved', reject: 'rejected', flag: 'flagged' };
    const cert = await Certificate.findByIdAndUpdate(
        req.params.id,
        { moderationStatus: statusMap[action], moderationReason: reason || '' },
        { new: true }
    ).populate('user', 'name email');
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    await log(`CERT_${action.toUpperCase()}`, 'Certificate', cert._id, cert.title, req.admin.email, { reason });
    res.json(cert);
};

// @route  DELETE /api/admin/certificates/:id
exports.deleteCertificate = async (req, res) => {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    await cert.deleteOne();
    await log('DELETE_CERT', 'Certificate', cert._id, cert.title, req.admin.email, {});
    res.json({ message: 'Certificate deleted.' });
};

// ════════════════════════════════════════════════════════════════════════════
// 4. PLATFORM ANALYTICS
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/analytics
exports.getPlatformAnalytics = async (req, res) => {
    const [
        totalUsers,
        totalCerts,
        totalStorage,
        newUsersLast30,
        newCertsLast30,
        topUsers,
        categoryBreakdown,
        userGrowth,
        certGrowth,
    ] = await Promise.all([
        User.countDocuments(),
        Certificate.countDocuments(),
        User.aggregate([{ $group: { _id: null, total: { $sum: '$storageUsed' } } }]),
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
        Certificate.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
        // Top 5 users by certificate count
        Certificate.aggregate([
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { name: '$user.name', email: '$user.email', count: 1 } },
        ]),
        // Certificates per category
        Certificate.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
        ]),
        // User signups by month (last 6)
        User.aggregate([
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 },
        ]),
        // Certificate uploads by month (last 6)
        Certificate.aggregate([
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 },
        ]),
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatGrowth = (raw) => raw.map(r => ({ month: months[r._id.month - 1], count: r.count }));

    res.json({
        totals: {
            users: totalUsers,
            certificates: totalCerts,
            storageBytes: totalStorage[0]?.total || 0,
            newUsersLast30,
            newCertsLast30,
        },
        topUsers,
        categoryBreakdown,
        userGrowth: formatGrowth(userGrowth),
        certGrowth: formatGrowth(certGrowth),
    });
};

// ════════════════════════════════════════════════════════════════════════════
// 5. FEATURE FLAGS
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/config
exports.getConfig = async (req, res) => {
    const config = await getConfig();
    res.json(config);
};

// @route  PATCH /api/admin/config/features
exports.updateFeatures = async (req, res) => {
    const config = await getConfig();
    config.features = { ...config.features.toObject(), ...req.body };
    await config.save();
    await log('UPDATE_FEATURES', 'Config', config._id, 'features', req.admin.email, req.body);
    res.json(config.features);
};

// ════════════════════════════════════════════════════════════════════════════
// 6. ANNOUNCEMENTS / BROADCASTS
// ════════════════════════════════════════════════════════════════════════════

// @route  PATCH /api/admin/config/announcement
exports.updateAnnouncement = async (req, res) => {
    const config = await getConfig();
    config.announcement = { ...config.announcement.toObject(), ...req.body };
    await config.save();
    await log('UPDATE_ANNOUNCEMENT', 'Config', config._id, 'announcement', req.admin.email, req.body);
    res.json(config.announcement);
};

// ════════════════════════════════════════════════════════════════════════════
// 7. VERIFIED ISSUERS
// ════════════════════════════════════════════════════════════════════════════

// @route  POST /api/admin/issuers
exports.addIssuer = async (req, res) => {
    const config = await getConfig();
    const { name, website, logo } = req.body;
    config.verifiedIssuers.push({ name, website, logo });
    await config.save();
    await log('ADD_ISSUER', 'Config', config._id, name, req.admin.email, {});
    res.json(config.verifiedIssuers);
};

// @route  DELETE /api/admin/issuers/:issuerId
exports.deleteIssuer = async (req, res) => {
    const config = await getConfig();
    const issuer = config.verifiedIssuers.id(req.params.issuerId);
    if (!issuer) return res.status(404).json({ message: 'Issuer not found' });
    const name = issuer.name;
    issuer.deleteOne();
    await config.save();
    await log('DELETE_ISSUER', 'Config', config._id, name, req.admin.email, {});
    res.json(config.verifiedIssuers);
};

// ════════════════════════════════════════════════════════════════════════════
// 8. AUDIT LOGS
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/logs
exports.getAuditLogs = async (req, res) => {
    const { action = '', page = 1, limit = 30 } = req.query;
    const filter = action ? { action: { $regex: action, $options: 'i' } } : {};
    const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
        AuditLog.countDocuments(filter),
    ]);
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// ════════════════════════════════════════════════════════════════════════════
// 9. STORAGE STATS
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/storage
exports.getStorageStats = async (req, res) => {
    const users = await User.aggregate([
        { $project: { name: 1, email: 1, storageUsed: 1 } },
        { $sort: { storageUsed: -1 } },
        { $limit: 20 },
    ]);
    const total = await User.aggregate([{ $group: { _id: null, total: { $sum: '$storageUsed' } } }]);
    res.json({ topUsers: users, totalBytes: total[0]?.total || 0 });
};

// ════════════════════════════════════════════════════════════════════════════
// 10. USER CERTIFICATES (detail modal)
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/users/:id/certificates
exports.getUserCertificates = async (req, res) => {
    const certs = await Certificate.find({ user: req.params.id })
        .sort('-createdAt')
        .select('title issuer category moderationStatus fileUrl thumbnailUrl createdAt');
    res.json(certs);
};

// ════════════════════════════════════════════════════════════════════════════
// 11. BULK OPERATIONS
// ════════════════════════════════════════════════════════════════════════════

// @route  DELETE /api/admin/users/bulk
exports.bulkDeleteUsers = async (req, res) => {
    const { ids } = req.body; // array of user IDs
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No IDs provided' });
    await Certificate.deleteMany({ user: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    await log('BULK_DELETE_USERS', 'User', '', `${ids.length} users`, req.admin.email, { ids });
    res.json({ message: `${ids.length} users deleted.` });
};

// @route  DELETE /api/admin/certificates/bulk
exports.bulkDeleteCerts = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No IDs provided' });
    await Certificate.deleteMany({ _id: { $in: ids } });
    await log('BULK_DELETE_CERTS', 'Certificate', '', `${ids.length} certs`, req.admin.email, { ids });
    res.json({ message: `${ids.length} certificates deleted.` });
};

// @route  PATCH /api/admin/certificates/bulk-moderate
exports.bulkModerateCerts = async (req, res) => {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No IDs provided' });
    const statusMap = { approve: 'approved', reject: 'rejected', flag: 'flagged' };
    await Certificate.updateMany({ _id: { $in: ids } }, { moderationStatus: statusMap[action] });
    await log(`BULK_${action.toUpperCase()}_CERTS`, 'Certificate', '', `${ids.length} certs`, req.admin.email, { ids });
    res.json({ message: `${ids.length} certificates ${action}d.` });
};

// ════════════════════════════════════════════════════════════════════════════
// 12. CSV / JSON EXPORT
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/export/users
exports.exportUsers = async (req, res) => {
    const users = await User.find({}).select('-password').lean();
    const plain = users.map(u => ({
        id: u._id, name: u.name, email: u.email,
        role: u.role, status: u.status || 'active',
        storageUsed: u.storageUsed, createdAt: u.createdAt,
    }));
    const fmt = req.query.format || 'csv';
    if (fmt === 'json') {
        res.setHeader('Content-Disposition', 'attachment; filename="users.json"');
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(plain, null, 2));
    }
    const csv = toCSV(plain, ['id', 'name', 'email', 'role', 'status', 'storageUsed', 'createdAt']);
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
};

// @route  GET /api/admin/export/certificates
exports.exportCertificates = async (req, res) => {
    const certs = await Certificate.find({}).populate('user', 'name email').lean();
    const plain = certs.map(c => ({
        id: c._id, title: c.title, issuer: c.issuer || '',
        userName: c.user?.name || '', userEmail: c.user?.email || '',
        moderationStatus: c.moderationStatus || 'pending',
        createdAt: c.createdAt,
    }));
    const fmt = req.query.format || 'csv';
    if (fmt === 'json') {
        res.setHeader('Content-Disposition', 'attachment; filename="certificates.json"');
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(plain, null, 2));
    }
    const csv = toCSV(plain, ['id', 'title', 'issuer', 'userName', 'userEmail', 'moderationStatus', 'createdAt']);
    res.setHeader('Content-Disposition', 'attachment; filename="certificates.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
};

// ════════════════════════════════════════════════════════════════════════════
// 13. PUBLIC CONFIG (no auth needed — for announcement banner in user UI)
// ════════════════════════════════════════════════════════════════════════════

// @route  GET /api/admin/public/config
exports.getPublicConfig = async (req, res) => {
    const config = await getConfig();
    // Only expose safe public data
    res.json({
        announcement: config.announcement,
        maintenanceMode: config.features?.maintenanceMode || false,
        verifiedIssuers: config.verifiedIssuers,
    });
};

