import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, FileText, HardDrive, TrendingUp, CheckCircle,
    XCircle, AlertTriangle, Trash2, Eye, RefreshCw,
    Plus, Search, Megaphone, Download, X,
    ChevronLeft, ChevronRight, UserCheck,
    Mail, Globe, Linkedin, Github, Twitter, Calendar, Database
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    useGetPlatformAnalyticsQuery,
    useGetAdminUsersQuery, useGetAdminUserDetailQuery, useGetUserCertificatesQuery,
    useUpdateUserRoleMutation, useUpdateUserStatusMutation,
    useDeleteAdminUserMutation, useBulkDeleteUsersMutation,
    useGetAdminCertificatesQuery, useModerateCertificateMutation,
    useDeleteAdminCertificateMutation, useBulkDeleteCertsMutation, useBulkModerateCertsMutation,
    useGetAdminConfigQuery, useUpdateFeatureFlagsMutation, useUpdateAnnouncementMutation,
    useAddVerifiedIssuerMutation, useDeleteVerifiedIssuerMutation,
    useGetAuditLogsQuery, useGetStorageStatsQuery,
} from '../../app/adminApiSlice';

// ── Helpers ───────────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api/admin';
const adminToken = () => localStorage.getItem('adminToken');

const formatBytes = (b, d = 1) => {
    if (!+b) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(d))} ${s[i]}`;
};

const downloadFile = (url) => {
    const a = document.createElement('a');
    a.href = `${API}${url}`;
    // Append token as query param for file downloads (since headers can't be set for direct links)
    a.href += `?adminToken=${adminToken()}`;
    a.download = '';
    // Better: use fetch + blob so we can send the Authorization header
    fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${adminToken()}` } })
        .then(r => r.blob())
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = url.includes('user') ? 'users.csv' : 'certificates.csv';
            link.click();
        });
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, icon: Icon }) => (
    <div className="glass-card p-5 flex items-start gap-4">
        {Icon && <div className="p-2.5 bg-text/5 rounded-xl"><Icon className="w-5 h-5 text-text" /></div>}
        <div>
            <p className="text-secondary text-xs mb-0.5">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-secondary mt-0.5">{sub}</p>}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const map = {
        active: 'bg-green-500/10 text-green-400', banned: 'bg-red-500/10 text-red-400',
        suspended: 'bg-orange-500/10 text-orange-400', approved: 'bg-green-500/10 text-green-400',
        rejected: 'bg-red-500/10 text-red-400', flagged: 'bg-orange-500/10 text-orange-400',
        pending: 'bg-secondary/20 text-secondary',
    };
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] || map.pending}`}>{status || 'active'}</span>;
};

const Paginator = ({ page, pages, onPage }) => (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-secondary">
        <span>Page {page} of {pages || 1}</span>
        <div className="flex gap-1">
            <button onClick={() => onPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded border border-border disabled:opacity-30 hover:border-text transition-colors">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onPage(p => Math.min(pages || 1, p + 1))} disabled={page >= (pages || 1)}
                className="p-1.5 rounded border border-border disabled:opacity-30 hover:border-text transition-colors">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    </div>
);

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide = false }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative bg-card border border-border rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[85vh] flex flex-col`}
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <h3 className="font-bold text-base">{title}</h3>
                <button onClick={onClose} className="text-secondary hover:text-text"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">{children}</div>
        </motion.div>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const OverviewTab = () => {
    const { data, isLoading, refetch } = useGetPlatformAnalyticsQuery();
    if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-text border-t-transparent rounded-full animate-spin" /></div>;
    const d = data || {};

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button onClick={refetch} className="flex items-center gap-1.5 text-xs text-secondary hover:text-text border border-border rounded-lg px-3 py-1.5 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Users" value={d.totals?.users || 0} sub={`+${d.totals?.newUsersLast30 || 0} this month`} icon={Users} />
                <KPICard label="Total Certificates" value={d.totals?.certificates || 0} sub={`+${d.totals?.newCertsLast30 || 0} this month`} icon={FileText} />
                <KPICard label="Platform Storage" value={formatBytes(d.totals?.storageBytes || 0)} icon={HardDrive} />
                <KPICard label="Categories" value={d.categoryBreakdown?.length || 0} icon={TrendingUp} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 h-72">
                    <h3 className="font-semibold text-sm mb-4">User Sign-ups (6 Months)</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={d.userGrowth || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6 h-72">
                    <h3 className="font-semibold text-sm mb-4">Certificate Uploads (6 Months)</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={d.certGrowth || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
                            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 11 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} />
                            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Users */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="font-semibold text-sm mb-4">Top Users by Certificate Count</h3>
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-secondary text-xs border-b border-border">
                            <th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Email</th><th className="pb-2">Certs</th>
                        </tr></thead>
                        <tbody>
                            {(d.topUsers || []).map((u, i) => (
                                <tr key={i} className="border-b border-border/40 last:border-0">
                                    <td className="py-2.5 pr-4 font-medium">{u.name}</td>
                                    <td className="py-2.5 pr-4 text-secondary text-xs">{u.email}</td>
                                    <td className="py-2.5 font-bold">{u.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Category Pie */}
                {(d.categoryBreakdown || []).length > 0 && (
                    <div className="glass-card p-6 h-64">
                        <h3 className="font-semibold text-sm mb-2">By Category</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie data={d.categoryBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70}>
                                    {d.categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// TAB: USERS (with pagination, bulk select, user detail modal)
// ════════════════════════════════════════════════════════════════════════════
const UserDetailModal = ({ userId, onClose }) => {
    const { data: userDetail } = useGetAdminUserDetailQuery(userId);
    const { data: certs } = useGetUserCertificatesQuery(userId);
    const user = userDetail?.user;

    const dicebearAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundType=gradientLinear`;

    return (
        <Modal title="User Profile" onClose={onClose} wide>
            {!user ? <div className="text-secondary text-sm text-center py-6">Loading…</div> : (
                <div className="space-y-6">

                    {/* ── Profile Header ────────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 pb-5 border-b border-border">
                        {/* Avatar */}
                        <img
                            src={user.avatar || dicebearAvatar}
                            alt={user.name}
                            className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-border"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h3 className="text-xl font-bold">{user.name}</h3>
                                <StatusBadge status={user.status || 'active'} />
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-secondary/20 text-secondary'
                                    }`}>{user.role}</span>
                            </div>
                            <p className="text-secondary text-sm mt-1 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> {user.email}
                            </p>
                            {user.bio && <p className="text-secondary text-sm mt-2 leading-relaxed">{user.bio}</p>}
                        </div>
                    </div>

                    {/* ── Stats Row ─────────────────────────────────────── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-card border border-border rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold">{userDetail?.certCount || 0}</p>
                            <p className="text-xs text-secondary mt-0.5">Certificates</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold">{formatBytes(user.storageUsed || 0)}</p>
                            <p className="text-xs text-secondary mt-0.5">Storage</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-3 text-center">
                            <p className="text-sm font-semibold capitalize">{user.settings?.previewMode || 'grid'}</p>
                            <p className="text-xs text-secondary mt-0.5">View Mode</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-3 text-center">
                            <p className="text-sm font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-secondary mt-0.5">Joined</p>
                        </div>
                    </div>

                    {/* ── Links ─────────────────────────────────────────── */}
                    {(user.website || user.social?.linkedin || user.social?.github || user.social?.twitter) && (
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            {user.website && (
                                <a href={user.website} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-secondary hover:text-text transition-colors">
                                    <Globe className="w-3.5 h-3.5" /> {user.website.replace(/https?:\/\//, '')}
                                </a>
                            )}
                            {user.social?.linkedin && (
                                <a href={user.social.linkedin} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-secondary hover:text-blue-400 transition-colors">
                                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                                </a>
                            )}
                            {user.social?.github && (
                                <a href={user.social.github} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-secondary hover:text-text transition-colors">
                                    <Github className="w-3.5 h-3.5" /> GitHub
                                </a>
                            )}
                            {user.social?.twitter && (
                                <a href={user.social.twitter} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-secondary hover:text-sky-400 transition-colors">
                                    <Twitter className="w-3.5 h-3.5" /> Twitter
                                </a>
                            )}
                        </div>
                    )}

                    {/* ── Certificates ──────────────────────────────────── */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-secondary" />
                            Certificates
                            <span className="text-xs text-secondary font-normal">({certs?.length || 0})</span>
                        </h4>
                        {!certs ? (
                            <p className="text-secondary text-sm text-center py-4">Loading…</p>
                        ) : certs.length === 0 ? (
                            <p className="text-secondary text-sm text-center py-6 border border-dashed border-border rounded-xl">No certificates uploaded yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                {certs.map(c => (
                                    <div key={c._id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        {c.thumbnailUrl
                                            ? <img src={c.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0 border border-border" />
                                            : <div className="w-10 h-10 rounded bg-text/10 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-secondary" /></div>
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{c.title}</p>
                                            <p className="text-xs text-secondary">{c.issuer || '—'} · {new Date(c.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <StatusBadge status={c.moderationStatus || 'pending'} />
                                        {c.fileUrl && (
                                            <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-secondary hover:text-text flex-shrink-0">
                                                <Eye className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </Modal>
    );
};

const UsersTab = () => {
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState([]);
    const [detailUserId, setDetailUserId] = useState(null);
    const { data, isLoading, refetch } = useGetAdminUsersQuery(`q=${q}&page=${page}&limit=15`);
    const [updateRole] = useUpdateUserRoleMutation();
    const [updateStatus] = useUpdateUserStatusMutation();
    const [deleteUser] = useDeleteAdminUserMutation();
    const [bulkDelete] = useBulkDeleteUsersMutation();

    const users = data?.users || [];
    const allSelected = users.length > 0 && selected.length === users.length;

    const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll = () => setSelected(allSelected ? [] : users.map(u => u._id));

    const handleBulkDelete = async () => {
        if (!selected.length) return;
        if (!window.confirm(`Delete ${selected.length} selected users and all their certificates?`)) return;
        await bulkDelete(selected);
        setSelected([]);
    };

    return (
        <div className="space-y-4">
            {detailUserId && <UserDetailModal userId={detailUserId} onClose={() => setDetailUserId(null)} />}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search by name or email…"
                        className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text" />
                </div>
                <button onClick={refetch} className="p-2 border border-border rounded-lg text-secondary hover:text-text"><RefreshCw className="w-4 h-4" /></button>
                <button onClick={() => downloadFile('/export/users')} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-secondary hover:text-text text-sm transition-colors">
                    <Download className="w-4 h-4" /> CSV
                </button>
                {selected.length > 0 && (
                    <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4" /> Delete {selected.length}
                    </button>
                )}
            </div>

            {isLoading ? <div className="text-center py-12 text-secondary">Loading users…</div> : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-secondary text-xs border-b border-border">
                                    <th className="px-4 py-3 w-8">
                                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded" />
                                    </th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Joined</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} className={`border-b border-border/40 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 ${selected.includes(user._id) ? 'bg-text/5' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.includes(user._id)} onChange={() => toggleSelect(user._id)} className="w-3.5 h-3.5 rounded" />
                                        </td>
                                        <td className="px-4 py-3 font-medium max-w-[120px] truncate">{user.name}</td>
                                        <td className="px-4 py-3 text-secondary text-xs">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <select value={user.role} onChange={e => updateRole({ id: user._id, role: e.target.value })}
                                                className="text-xs bg-card border border-border rounded px-2 py-1 focus:outline-none capitalize">
                                                <option value="user">user</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge status={user.status || 'active'} /></td>
                                        <td className="px-4 py-3 text-secondary text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setDetailUserId(user._id)} className="p-1.5 text-secondary hover:text-text rounded" title="View certs">
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                </button>
                                                {(!user.status || user.status === 'active') ? (
                                                    <button onClick={() => updateStatus({ id: user._id, status: 'banned' })} className="p-1.5 text-orange-400 hover:bg-orange-500/10 rounded" title="Ban">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => updateStatus({ id: user._id, status: 'active' })} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded" title="Restore">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button onClick={() => window.confirm(`Delete "${user.name}" and all their certs?`) && deleteUser(user._id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Delete">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Paginator page={page} pages={data?.pages} onPage={setPage} />
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// TAB: CERTIFICATES (with reject reason modal + bulk ops)
// ════════════════════════════════════════════════════════════════════════════
const RejectModal = ({ certId, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    return (
        <Modal title="Reject Certificate" onClose={onClose}>
            <div className="space-y-4">
                <p className="text-secondary text-sm">Provide a reason for rejection (optional):</p>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
                    placeholder="e.g. Fake or unverifiable credential, missing information…"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text resize-none" />
                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg text-secondary hover:text-text">Cancel</button>
                    <button onClick={() => onConfirm(reason)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">Confirm Reject</button>
                </div>
            </div>
        </Modal>
    );
};

const CertificatesTab = () => {
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState([]);
    const [rejectCertId, setRejectCertId] = useState(null);
    const { data, isLoading } = useGetAdminCertificatesQuery(`q=${q}&status=${statusFilter}&page=${page}&limit=15`);
    const [moderate] = useModerateCertificateMutation();
    const [deleteCert] = useDeleteAdminCertificateMutation();
    const [bulkDelete] = useBulkDeleteCertsMutation();
    const [bulkModerate] = useBulkModerateCertsMutation();

    const certs = data?.certs || [];
    const allSelected = certs.length > 0 && selected.length === certs.length;
    const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll = () => setSelected(allSelected ? [] : certs.map(c => c._id));

    return (
        <div className="space-y-4">
            {rejectCertId && (
                <RejectModal
                    certId={rejectCertId}
                    onClose={() => setRejectCertId(null)}
                    onConfirm={async (reason) => {
                        await moderate({ id: rejectCertId, action: 'reject', reason });
                        setRejectCertId(null);
                    }}
                />
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                    <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search title or issuer…"
                        className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text" />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-border rounded-lg bg-bg px-3 py-2 text-sm focus:outline-none focus:border-text">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="flagged">Flagged</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => downloadFile('/export/certificates')} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-secondary hover:text-text text-sm transition-colors">
                    <Download className="w-4 h-4" /> CSV
                </button>
                {selected.length > 0 && (
                    <div className="flex gap-2">
                        <button onClick={() => bulkModerate({ ids: selected, action: 'approve' }).then(() => setSelected([]))}
                            className="px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/20">
                            ✓ Approve {selected.length}
                        </button>
                        <button onClick={() => bulkDelete(selected).then(() => setSelected([]))}
                            className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20">
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete {selected.length}
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? <div className="text-center py-12 text-secondary">Loading…</div> : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-secondary text-xs border-b border-border">
                                    <th className="px-4 py-3 w-8">
                                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded" />
                                    </th>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Issuer</th>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certs.map(cert => (
                                    <tr key={cert._id} className={`border-b border-border/40 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 ${selected.includes(cert._id) ? 'bg-text/5' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.includes(cert._id)} onChange={() => toggleSelect(cert._id)} className="w-3.5 h-3.5 rounded" />
                                        </td>
                                        <td className="px-4 py-3 font-medium max-w-[140px] truncate">{cert.title}</td>
                                        <td className="px-4 py-3 text-secondary text-xs">{cert.issuer || '—'}</td>
                                        <td className="px-4 py-3 text-secondary text-xs max-w-[120px] truncate">{cert.user?.email || '—'}</td>
                                        <td className="px-4 py-3"><StatusBadge status={cert.moderationStatus || 'pending'} /></td>
                                        <td className="px-4 py-3 text-secondary text-xs">{new Date(cert.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {cert.fileUrl && (
                                                    <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-secondary hover:text-text rounded" title="View">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                <button onClick={() => moderate({ id: cert._id, action: 'approve' })} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded" title="Approve">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => moderate({ id: cert._id, action: 'flag' })} className="p-1.5 text-orange-400 hover:bg-orange-500/10 rounded" title="Flag">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => setRejectCertId(cert._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Reject">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => window.confirm('Delete this certificate?') && deleteCert(cert._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded" title="Delete">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Paginator page={page} pages={data?.pages} onPage={setPage} />
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// TAB: FEATURE FLAGS
// ════════════════════════════════════════════════════════════════════════════
const FLAG_LABELS = {
    aiAutoTagging: { label: 'AI Auto-Tagging', desc: 'Automatically tag certificates using AI' },
    publicSharing: { label: 'Public Certificate Sharing', desc: 'Allow users to share certificates via link' },
    bulkUpload: { label: 'Bulk Upload', desc: 'Allow uploading multiple certificates at once' },
    certificateModeration: { label: 'Certificate Moderation', desc: 'All uploads need admin approval before showing' },
    maintenanceMode: { label: '🚨 Maintenance Mode', desc: 'Replaces the user app with a maintenance notice immediately' },
};

const FeatureFlagsTab = () => {
    const { data: config, isLoading } = useGetAdminConfigQuery();
    const [updateFlags] = useUpdateFeatureFlagsMutation();
    const [saved, setSaved] = useState(false);

    const toggle = async (key, val) => {
        if (key === 'maintenanceMode' && val && !window.confirm('Enable maintenance mode? This will block all users from accessing the app immediately.')) return;
        await updateFlags({ [key]: val });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (isLoading) return <div className="text-center py-12 text-secondary">Loading…</div>;
    const features = config?.features || {};

    return (
        <div className="space-y-4 max-w-2xl">
            {saved && <div className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">✓ Feature flag updated</div>}
            <div className="glass-card divide-y divide-border/40">
                {Object.entries(FLAG_LABELS).map(([key, { label, desc }]) => {
                    const isOn = features[key] === true;
                    return (
                        <div key={key} className={`flex items-center justify-between gap-4 px-6 py-4 ${key === 'maintenanceMode' && isOn ? 'bg-red-500/5 border-l-2 border-red-500' : ''}`}>
                            <div>
                                <p className="font-medium text-sm">{label}</p>
                                <p className="text-xs text-secondary mt-0.5">{desc}</p>
                            </div>
                            <button onClick={() => toggle(key, !isOn)}
                                className={`flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOn ? key === 'maintenanceMode' ? 'bg-red-500' : 'bg-text' : 'bg-border'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// TAB: ANNOUNCEMENTS
// ════════════════════════════════════════════════════════════════════════════
const AnnouncementsTab = () => {
    const { data: config, isLoading } = useGetAdminConfigQuery();
    const [update, { isLoading: isSaving }] = useUpdateAnnouncementMutation();

    const [msg, setMsg] = useState('');
    const [type, setType] = useState('info');
    const [enabled, setEnabled] = useState(false);
    const [expiry, setExpiry] = useState('');

    // Populate form from DB (runs once when config loads)
    useEffect(() => {
        if (!config?.announcement) return;
        const a = config.announcement;
        setMsg(a.message || '');
        setType(a.type || 'info');
        setEnabled(a.enabled || false);
        if (a.expiresAt) {
            // Convert ISO to local datetime-local value
            const d = new Date(a.expiresAt);
            const pad = n => String(n).padStart(2, '0');
            setExpiry(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        }
    }, [config]);



    const handleSave = async () => {
        try {
            await update({
                message: msg,
                type,
                enabled,
                expiresAt: expiry ? new Date(expiry).toISOString() : null,
            }).unwrap();
            toast.success('Announcement saved — users will see this immediately');
        } catch {
            toast.error('Failed to save. Please try again.');
        }
    };

    const handleDisable = async () => {
        try {
            await update({ message: '', type: 'info', enabled: false, expiresAt: null }).unwrap();
            setMsg(''); setType('info'); setEnabled(false); setExpiry('');
            toast.success('Announcement cleared and hidden from users');
        } catch {
            toast.error('Failed to clear announcement.');
        }
    };

    if (isLoading) return <div className="text-center py-12 text-secondary">Loading…</div>;

    const liveAnn = config?.announcement;
    const isLive = liveAnn?.enabled && liveAnn?.message;
    const isExpired = liveAnn?.expiresAt && new Date(liveAnn.expiresAt) < new Date();

    const typeConfig = {
        info: { emoji: '🔵', label: 'Info', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        warning: { emoji: '🟠', label: 'Warning', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
        success: { emoji: '🟢', label: 'Success', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    };

    return (
        <div className="space-y-5 max-w-2xl">

            {/* ── Current Live Status Card ────────────────────────────────── */}
            <div className={`glass-card p-5 border-l-4 ${isLive && !isExpired ? 'border-l-green-500' : 'border-l-border'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">Current Status</p>
                        {isLive && !isExpired ? (
                            <>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-sm font-semibold text-green-400">Live — visible to all users</span>
                                </div>
                                <p className="text-sm text-secondary italic">"{liveAnn.message}"</p>
                                {liveAnn.expiresAt && (
                                    <p className="text-xs text-secondary mt-1">Expires: {new Date(liveAnn.expiresAt).toLocaleString()}</p>
                                )}
                            </>
                        ) : isExpired ? (
                            <p className="text-sm text-orange-400 font-medium">⏰ Announcement expired</p>
                        ) : (
                            <p className="text-sm text-secondary">No active announcement — banner is hidden.</p>
                        )}
                    </div>
                    {isLive && !isExpired && (
                        <button
                            onClick={handleDisable}
                            className="flex-shrink-0 px-3 py-1.5 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/10 transition-colors"
                        >
                            Clear & Hide
                        </button>
                    )}
                </div>
            </div>

            {/* ── Edit Form ──────────────────────────────────────────────── */}
            <div className="glass-card p-6 space-y-5">
                <div>
                    <h3 className="font-semibold">Platform Announcement Banner</h3>
                    <p className="text-secondary text-sm mt-0.5">Shown at the top of every user's dashboard. Users can dismiss it.</p>
                </div>

                {/* Show Banner toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-y border-border gap-3 sm:gap-0">
                    <div>
                        <p className="text-sm font-medium">Show Banner</p>
                        <p className="text-xs text-secondary">{enabled ? 'Banner will be visible once saved' : 'Banner is currently hidden'}</p>
                    </div>
                    <button
                        onClick={() => setEnabled(v => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-border'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Banner Type */}
                <div>
                    <label className="text-sm font-medium block mb-2">Banner Type</label>
                    <div className="flex gap-2">
                        {Object.entries(typeConfig).map(([t, { emoji, label, cls }]) => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${type === t
                                    ? `${cls} border-current font-semibold`
                                    : 'border-border text-secondary hover:border-text/30'
                                    }`}
                            >
                                {emoji} {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label className="text-sm font-medium block mb-1.5">Message</label>
                    <textarea
                        value={msg}
                        onChange={e => setMsg(e.target.value.slice(0, 500))}
                        rows={4}
                        placeholder="e.g. 🚀 We're rolling out a new feature next week! Stay tuned."
                        className="w-full px-4 py-2.5 border border-border rounded-xl bg-transparent text-sm focus:outline-none focus:border-text resize-none transition-colors"
                    />
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-secondary">{msg.length}/500 characters</span>
                        {msg && (
                            <button onClick={() => setMsg('')} className="text-xs text-secondary hover:text-text transition-colors">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Expiry date */}
                <div>
                    <label className="text-sm font-medium block mb-1.5">
                        Auto-Expire At <span className="text-secondary font-normal">(optional)</span>
                    </label>
                    <input
                        type="datetime-local"
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-xl bg-transparent text-sm focus:outline-none focus:border-text"
                    />
                    <p className="text-xs text-secondary mt-1">Banner will automatically stop showing after this date/time.</p>
                </div>

                {/* Live Preview */}
                {msg && (
                    <div>
                        <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-2">Preview</p>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${typeConfig[type]?.cls}`}>
                            <Megaphone className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 text-sm">{msg}</span>
                            {!enabled && <span className="text-[10px] opacity-50 flex-shrink-0">(hidden)</span>}
                            <button className="text-current opacity-40 hover:opacity-100 flex-shrink-0">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-xs text-secondary mt-1.5">↑ This is exactly how users will see the banner.</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !msg.trim()}
                        className="flex-1 bg-text text-bg py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm disabled:opacity-40"
                    >
                        {isSaving ? 'Saving…' : enabled ? '📣 Publish Announcement' : '💾 Save (Hidden)'}
                    </button>
                    {(msg || enabled) && (
                        <button
                            onClick={handleDisable}
                            className="px-4 py-2.5 border border-border text-secondary rounded-xl text-sm hover:border-red-500/40 hover:text-red-400 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// ════════════════════════════════════════════════════════════════════════════
// TAB: STORAGE
// ════════════════════════════════════════════════════════════════════════════
const StorageTab = () => {
    const { data, isLoading } = useGetStorageStatsQuery();
    if (isLoading) return <div className="text-center py-12 text-secondary">Loading…</div>;
    const maxStorage = data?.topUsers?.[0]?.storageUsed || 1;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPICard label="Total Platform Storage" value={formatBytes(data?.totalBytes || 0)} icon={HardDrive} />
                <KPICard label="Heavy Users (>1MB)" value={(data?.topUsers || []).filter(u => u.storageUsed > 1024 * 1024).length} icon={AlertTriangle} />
            </div>
            <div className="glass-card p-6">
                <h3 className="font-semibold text-sm mb-4">Top 20 Users by Storage Used</h3>
                <div className="space-y-3">
                    {(data?.topUsers || []).map(u => (
                        <div key={u._id} className="flex items-center gap-3">
                            <div className="w-28 text-xs text-secondary truncate flex-shrink-0">{u.name}</div>
                            <div className="flex-1 bg-border rounded-full h-2">
                                <div
                                    className={`rounded-full h-2 transition-all ${u.storageUsed > 50 * 1024 * 1024 ? 'bg-red-500' : u.storageUsed > 10 * 1024 * 1024 ? 'bg-orange-400' : 'bg-text'}`}
                                    style={{ width: `${Math.min((u.storageUsed / maxStorage) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="text-xs text-secondary w-16 text-right flex-shrink-0">{formatBytes(u.storageUsed)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// TAB: AUDIT LOGS
// ════════════════════════════════════════════════════════════════════════════
const AuditLogsTab = () => {
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState('');
    const { data, isLoading } = useGetAuditLogsQuery(`page=${page}&limit=30&action=${actionFilter}`);

    const actionColor = (action) => {
        if (action.includes('DELETE') || action.includes('BULK_DELETE')) return 'text-red-400 bg-red-500/10';
        if (action.includes('BAN') || action.includes('SUSPEND') || action.includes('REJECT')) return 'text-orange-400 bg-orange-500/10';
        if (action.includes('LOGIN')) return 'text-blue-400 bg-blue-500/10';
        if (action.includes('APPROVE')) return 'text-green-400 bg-green-500/10';
        return 'text-secondary bg-border';
    };

    const FILTERS = ['', 'DELETE', 'LOGIN', 'APPROVE', 'REJECT', 'FLAG', 'UPDATE', 'BULK'];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <button key={f} onClick={() => { setActionFilter(f); setPage(1); }}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${actionFilter === f ? 'border-text bg-text text-bg font-semibold' : 'border-border text-secondary hover:border-text/40'}`}>
                        {f || 'All'}
                    </button>
                ))}
            </div>

            {isLoading ? <div className="text-center py-12 text-secondary">Loading…</div> : (
                <>
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-secondary text-xs border-b border-border">
                                        <th className="px-4 py-3">Action</th>
                                        <th className="px-4 py-3">Target</th>
                                        <th className="px-4 py-3">Admin</th>
                                        <th className="px-4 py-3">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(data?.logs || []).map(log => (
                                        <tr key={log._id} className="border-b border-border/40 last:border-0 hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${actionColor(log.action)}`}>{log.action}</span>
                                            </td>
                                            <td className="px-4 py-3 text-secondary text-xs max-w-[160px] truncate">{log.targetName || log.targetId || '—'}</td>
                                            <td className="px-4 py-3 text-secondary text-xs">{log.adminEmail}</td>
                                            <td className="px-4 py-3 text-secondary text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Paginator page={page} pages={data?.pages} onPage={setPage} />
                    </div>
                    <p className="text-xs text-secondary text-right">{data?.total || 0} total log entries</p>
                </>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// TAB: VERIFIED ISSUERS
// ════════════════════════════════════════════════════════════════════════════
const PRESET_ISSUERS = ['Google', 'Coursera', 'Microsoft', 'AWS', 'Udemy', 'LinkedIn Learning', 'edX', 'Cisco', 'IBM', 'Oracle'];

const IssuersTab = () => {
    const { data: config, isLoading } = useGetAdminConfigQuery();
    const [addIssuer] = useAddVerifiedIssuerMutation();
    const [deleteIssuer] = useDeleteVerifiedIssuerMutation();
    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');

    const handleAdd = async (n = name, w = website) => {
        if (!n.trim()) return;
        await addIssuer({ name: n.trim(), website: w.trim() });
        if (n === name) { setName(''); setWebsite(''); }
    };

    if (isLoading) return <div className="text-center py-12 text-secondary">Loading…</div>;
    const existingNames = (config?.verifiedIssuers || []).map(i => i.name.toLowerCase());

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Quick add from presets */}
            <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-sm">Quick Add Known Issuers</h3>
                <div className="flex flex-wrap gap-2">
                    {PRESET_ISSUERS.map(p => {
                        const exists = existingNames.includes(p.toLowerCase());
                        return (
                            <button key={p} disabled={exists} onClick={() => handleAdd(p, '')}
                                className={`px-3 py-1.5 rounded-full border text-xs transition-all ${exists ? 'border-green-500/20 text-green-400 bg-green-500/10 cursor-default' : 'border-border text-secondary hover:border-text hover:text-text'}`}>
                                {exists ? '✓ ' : '+ '}{p}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom add */}
            <div className="glass-card p-6 space-y-4">
                <h3 className="font-semibold text-sm">Add Custom Issuer</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Issuer name"
                        className="flex-1 px-4 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text" />
                    <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="Website (optional)"
                        className="flex-1 px-4 py-2 border border-border rounded-lg bg-transparent text-sm focus:outline-none focus:border-text" />
                    <button onClick={() => handleAdd()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-text text-bg rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="glass-card divide-y divide-border/40">
                <div className="px-6 py-3 flex items-center justify-between">
                    <p className="text-xs text-secondary font-medium uppercase tracking-wider">Verified Issuers ({(config?.verifiedIssuers || []).length})</p>
                </div>
                {(config?.verifiedIssuers || []).length === 0 ? (
                    <div className="px-6 py-8 text-center text-secondary text-sm">No verified issuers yet. Add some above.</div>
                ) : (
                    (config?.verifiedIssuers || []).map(issuer => (
                        <div key={issuer._id} className="flex items-center justify-between px-6 py-3.5 gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">{issuer.name}</p>
                                    {issuer.website && <a href={issuer.website} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:text-text">{issuer.website}</a>}
                                </div>
                            </div>
                            <button onClick={() => deleteIssuer(issuer._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN AdminPanel
// ════════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabComponents = {
        overview: <OverviewTab />,
        users: <UsersTab />,
        certificates: <CertificatesTab />,
        flags: <FeatureFlagsTab />,
        announcements: <AnnouncementsTab />,
        storage: <StorageTab />,
        logs: <AuditLogsTab />,
        issuers: <IssuersTab />,
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {tabComponents[activeTab]}
        </AdminLayout>
    );
};

export default AdminPanel;
