import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../app/apiSlice';
import { FileBadge } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, { isLoading, error }] = useLoginMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await login({ email, password }).unwrap();
            localStorage.setItem('token', userData.token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to log in', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg text-text transition-colors">
            <div className="glass-card max-w-md w-full p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-text text-bg rounded-xl flex items-center justify-center mb-4">
                        <FileBadge className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Welcome back</h2>
                    <p className="text-secondary mt-1">Sign in to your account</p>
                </div>

                {error && (
                    <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                        {error.data?.message || 'Login failed. Please try again.'}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                    />

                    <div>
                        <div className="flex justify-between mb-1.5">
                            <label className="block text-sm font-medium text-text">Password</label>
                            <Link to="/forgot-password" className="text-sm text-secondary hover:text-text hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        isLoading={isLoading}
                    >
                        Sign In
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-text font-medium hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
