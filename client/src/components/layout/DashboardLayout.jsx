import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AnnouncementBanner from '../ui/AnnouncementBanner';
import MaintenancePage from '../../pages/MaintenancePage';
import { useGetPublicConfigQuery } from '../../app/adminApiSlice';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { data: publicConfig } = useGetPublicConfigQuery();

    // Show maintenance page when admin enables it
    if (publicConfig?.maintenanceMode) {
        return <MaintenancePage />;
    }

    return (
        <div className="flex h-screen bg-bg text-text overflow-hidden transition-colors duration-300">

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                        />
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed top-4 right-4 z-50 p-2 bg-card rounded-full md:hidden shadow-lg"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                    </>
                )}
            </AnimatePresence>

            <Sidebar isOpen={isSidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col md:ml-64 relative min-w-0 overflow-hidden">
                <Navbar setSidebarOpen={setSidebarOpen} />
                {/* Announcement banner — shown above page content */}
                <AnnouncementBanner />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

