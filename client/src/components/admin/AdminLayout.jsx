import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminApiSlice } from '../../app/adminApiSlice';
import { useDispatch } from 'react-redux';
import {
    LayoutDashboard, Users, FileBadge, ToggleLeft,
    Megaphone, HardDrive, ScrollText, CheckCircle,
    LogOut, Shield, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'certificates', icon: FileBadge, label: 'Certificates' },
    { id: 'flags', icon: ToggleLeft, label: 'Feature Flags' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'storage', icon: HardDrive, label: 'Storage' },
    { id: 'logs', icon: ScrollText, label: 'Audit Logs' },
    { id: 'issuers', icon: CheckCircle, label: 'Issuers' },
];

const AdminLayout = ({ activeTab, setActiveTab, children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        dispatch(adminApiSlice.util.resetApiState());
        navigate('/admin/login');
    };

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-border">
                <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-text" />
                    <span className="font-bold text-lg tracking-tight">Admin Panel</span>
                </div>
                <button className="md:hidden text-secondary" onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive ? 'bg-text text-bg' : 'text-secondary hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-bg text-text flex">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-60 flex-col fixed inset-y-0 left-0 bg-card border-r border-border z-50">
                <SidebarContent />
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative w-60 flex flex-col h-full bg-card border-r border-border">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
                {/* Top bar */}
                <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-4 sm:px-6 gap-4">
                    <button
                        className="md:hidden text-secondary hover:text-text"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-semibold text-sm text-secondary">
                            {NAV_ITEMS.find(i => i.id === activeTab)?.label}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-secondary hidden sm:inline">admin@certify.com</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
