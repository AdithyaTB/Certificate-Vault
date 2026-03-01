const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminAuth.middleware');
const {
    adminLogin,
    getUsers, getUserDetail, updateUserRole, updateUserStatus, deleteUser,
    getUserCertificates,
    bulkDeleteUsers,
    getCertificates, moderateCertificate, deleteCertificate,
    bulkDeleteCerts, bulkModerateCerts,
    getPlatformAnalytics,
    getConfig, updateFeatures, updateAnnouncement,
    addIssuer, deleteIssuer,
    getAuditLogs,
    getStorageStats,
    exportUsers, exportCertificates,
    getPublicConfig,
} = require('../controllers/admin.controller');

// ── Fully Public ──────────────────────────────────────────────────────────────
router.post('/login', adminLogin);
router.get('/public/config', getPublicConfig);   // announcement banner for all users

// ── Protected (all routes below require valid admin JWT) ────────────────────
router.use(adminProtect);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.get('/users/:id/certificates', getUserCertificates);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/bulk', bulkDeleteUsers);   // must be before /:id
router.delete('/users/:id', deleteUser);

// Certificates
router.get('/certificates', getCertificates);
router.patch('/certificates/:id/moderate', moderateCertificate);
router.delete('/certificates/bulk', bulkDeleteCerts);       // before /:id
router.patch('/certificates/bulk-moderate', bulkModerateCerts);
router.delete('/certificates/:id', deleteCertificate);

// Analytics & Storage
router.get('/analytics', getPlatformAnalytics);
router.get('/storage', getStorageStats);

// Config (feature flags + announcement)
router.get('/config', getConfig);
router.patch('/config/features', updateFeatures);
router.patch('/config/announcement', updateAnnouncement);

// Verified issuers
router.post('/issuers', addIssuer);
router.delete('/issuers/:issuerId', deleteIssuer);

// Audit logs
router.get('/logs', getAuditLogs);

// Export
router.get('/export/users', exportUsers);
router.get('/export/certificates', exportCertificates);

module.exports = router;
