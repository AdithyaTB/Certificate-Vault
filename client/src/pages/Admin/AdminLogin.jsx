import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdminLoginMutation } from '../../app/adminApiSlice';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [adminLogin, { isLoading }] = useAdminLoginMutation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await adminLogin({ email, password }).unwrap();
            localStorage.setItem('adminToken', res.token);
            navigate('/admin');
        } catch (err) {
            setError(err?.data?.message || 'Invalid admin credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-text text-bg mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Access</h1>
                    <p className="text-secondary mt-2 text-sm">CertVault Control Center — Authorized Personnel Only</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8 space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="admin@certify.com"
                                className="w-full px-4 py-2.5 border border-border rounded-lg bg-transparent text-text placeholder:text-secondary focus:outline-none focus:border-text transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-transparent text-text placeholder:text-secondary focus:outline-none focus:border-text transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(v => !v)}
                                className="absolute right-3 top-9 text-secondary hover:text-text"
                            >
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-text text-bg py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><Shield className="w-4 h-4" /> Enter Admin Panel</>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-secondary mt-6">
                    Access restricted. Unauthorized attempts are logged.
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
