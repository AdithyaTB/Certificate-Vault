import { useGetPublicConfigQuery } from '../../app/adminApiSlice';

import { X, Megaphone } from 'lucide-react';
import { useState } from 'react';

/**
 * AnnouncementBanner — displayed at the top of DashboardLayout when the admin
 * has enabled an announcement. Automatically hidden if the user dismisses it,
 * or if maintenance mode is on (in which case the app redirects instead).
 */
const AnnouncementBanner = () => {
    const { data } = useGetPublicConfigQuery();
    const [dismissed, setDismissed] = useState(false);

    const ann = data?.announcement;
    if (!ann?.enabled || !ann?.message || dismissed) return null;

    // Check expiry
    if (ann.expiresAt && new Date(ann.expiresAt) < new Date()) return null;

    const styles = {
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        warning: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-2.5 border-b text-sm ${styles[ann.type] || styles.info}`}>
            <Megaphone className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{ann.message}</span>
            <button onClick={() => setDismissed(true)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default AnnouncementBanner;
