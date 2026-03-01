import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/**
 * Shown when admin toggles "Maintenance Mode" on.
 * Displayed via the PrivateRoute / DashboardLayout when publicConfig.maintenanceMode is true.
 */
const MaintenancePage = () => (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center px-4">
        <div className="max-w-md text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/10 rounded-full mb-6">
                <AlertTriangle className="w-10 h-10 text-orange-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Under Maintenance</h1>
            <p className="text-secondary mb-8 leading-relaxed">
                CertVault is currently undergoing scheduled maintenance. We'll be back shortly. Thank you for your patience!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-text text-bg rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                    Try Again
                </button>
                <Link to="/" className="px-6 py-2.5 border border-border rounded-lg text-secondary hover:text-text hover:border-text transition-colors font-semibold">
                    Go Home
                </Link>
            </div>
        </div>
    </div>
);

export default MaintenancePage;
