import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileBadge, Upload, Users, Settings, LogOut } from 'lucide-react';
import { useGetMeQuery, apiSlice } from '../../app/apiSlice';
import { useDispatch } from 'react-redux';

const Sidebar = ({ isOpen, setOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: user } = useGetMeQuery();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Certificates', icon: FileBadge, path: '/certificates' },
        { label: 'Upload', icon: Upload, path: '/upload' },
        { label: 'Admin', icon: Users, path: '/admin', adminOnly: true },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(apiSlice.util.resetApiState());
        navigate('/login');
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-border">
                <Link to="/" className="text-xl font-bold tracking-tight text-text">
                    CertVault<span className="text-gray-400">.</span>
                </Link>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    if (item.adminOnly && user?.role !== 'admin') return null;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen && setOpen(false)}
                            className={`relative flex items-center px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                    ? 'text-bg bg-text'
                                    : 'text-secondary hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-text rounded-lg"
                                    initial={false}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon className={`w-5 h-5 mr-3 z-10 ${isActive ? 'text-bg' : ''}`} />
                            <span className={`font-medium z-10 ${isActive ? 'text-bg' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
