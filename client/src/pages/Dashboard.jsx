import { motion } from 'framer-motion';
import { useGetDashboardStatsQuery, useGetMeQuery } from '../app/apiSlice';
import { Link } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { FileText, PieChart as PieChartIcon, HardDrive, FolderOpen } from 'lucide-react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const Dashboard = () => {
    const { data: user } = useGetMeQuery();
    const { data: stats, isLoading, isError } = useGetDashboardStatsQuery();

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader size="lg" /></div>;
    if (isError) return <div className="text-center text-red-500 mt-10">Failed to load dashboard statistics.</div>;

    // Read analytics widget visibility from user settings (default all visible)
    const analyticsSettings = user?.settings?.analytics || {};
    const showUploadTrend = analyticsSettings.showUploadTrend !== false;
    const showSkillsChart = analyticsSettings.showSkillsChart !== false;
    const showFolderChart = analyticsSettings.showFolderChart !== false;
    const visibleCharts = [showUploadTrend, showSkillsChart, showFolderChart].filter(Boolean).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 pb-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="text-secondary mt-1">Here is your professional certificate portfolio insights.</p>
                </div>
                <Link to="/upload" className="inline-flex items-center justify-center bg-text text-bg px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-md">
                    Upload Credential
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Vaulted', value: stats?.totalCertificates || 0, icon: FileText, color: 'blue' },
                    { label: 'Active Folders', value: stats?.folderDistribution?.length || 0, icon: FolderOpen, color: 'orange' },
                    { label: 'Top Skills', value: stats?.skillsAnalytics?.length || 0, icon: PieChartIcon, color: 'green' },
                    { label: 'Storage Used', value: formatBytes(stats?.totalStorageUsed || 0), icon: HardDrive, color: 'purple' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="glass-card p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-secondary font-medium text-sm mb-1">{label}</h3>
                            <p className="text-3xl font-bold">{value}</p>
                        </div>
                        <div className={`p-4 rounded-full bg-${color}-500/10 text-${color}-500`}><Icon className="w-6 h-6" /></div>
                    </div>
                ))}
            </div>

            {/* All charts disabled */}
            {visibleCharts === 0 && (
                <div className="glass-card p-8 text-center text-secondary">
                    <PieChartIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold mb-1">All analytics charts are hidden</p>
                    <p className="text-sm">Re-enable them in <Link to="/settings" className="underline text-text hover:opacity-80">Settings → Analytics</Link></p>
                </div>
            )}

            {/* Charts Grid */}
            {visibleCharts > 0 && (
                <div className={`grid grid-cols-1 ${visibleCharts >= 2 ? 'lg:grid-cols-2' : ''} gap-8`}>

                    {showUploadTrend && (
                        <div className="glass-card p-6 flex flex-col h-[400px]">
                            <h3 className="text-lg font-bold mb-6">Upload Activity (6 Months)</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats?.monthlyStats || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888' }} />
                                        <YAxis stroke="#888" tick={{ fill: '#888' }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {showSkillsChart && (
                        <div className="glass-card p-6 flex flex-col h-[400px]">
                            <h3 className="text-lg font-bold mb-6">Top Acquired Skills</h3>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.skillsAnalytics || []} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                        <XAxis type="number" stroke="#888" tick={{ fill: '#888' }} allowDecimals={false} />
                                        <YAxis dataKey="skill" type="category" stroke="#888" tick={{ fill: '#888' }} width={80} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {showFolderChart && (
                        <div className="glass-card p-6 flex flex-col h-[400px]">
                            <h3 className="text-lg font-bold mb-6">Certificates by Folder</h3>
                            <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                                {stats?.folderDistribution?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={stats.folderDistribution} dataKey="count" nameKey="name"
                                                cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}
                                                label={({ name, percent }) => `${name.substring(0, 12)}${name.length > 12 ? '...' : ''} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {stats.folderDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-secondary italic">No folders created yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recent Uploads — always shown */}
                    <div className="glass-card p-6 flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Recent Uploads</h3>
                            <Link to="/certificates" className="text-sm text-blue-500 hover:underline">View All</Link>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {stats?.recentUploads?.length > 0 ? stats.recentUploads.map((cert) => (
                                <Link key={cert._id} to="/certificates" className="block group">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-black/5 dark:bg-white/5 hover:border-text transition-colors">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-bg flex items-center justify-center border border-border flex-shrink-0">
                                                <FileText className="w-5 h-5 opacity-70" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-sm truncate group-hover:text-blue-500 transition-colors">{cert.title}</h4>
                                                <p className="text-xs text-secondary mt-1 truncate">{cert.issuer || 'Unknown Issuer'} • {new Date(cert.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {cert.folder && <span className="text-[10px] px-2.5 py-1 bg-bg border border-border rounded-full whitespace-nowrap hidden sm:inline-block">📁 {cert.folder.name}</span>}
                                    </div>
                                </Link>
                            )) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-secondary italic">No recent uploads found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {visibleCharts > 0 && visibleCharts < 3 && (
                <p className="text-xs text-secondary text-center">
                    Some charts are hidden. <Link to="/settings" className="underline text-text/60 hover:text-text">Manage Analytics Settings →</Link>
                </p>
            )}
        </motion.div>
    );
};

export default Dashboard;
