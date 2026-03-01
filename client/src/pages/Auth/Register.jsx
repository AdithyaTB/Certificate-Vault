import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../app/apiSlice';
import { FileBadge } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [registerUser, { isLoading, error }] = useRegisterMutation();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await registerUser(formData).unwrap();
            localStorage.setItem('token', userData.token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to register', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg text-text transition-colors">
            <div className="glass-card max-w-md w-full p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-text text-bg rounded-xl flex items-center justify-center mb-4">
                        <FileBadge className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold">Create an account</h2>
                    <p className="text-secondary mt-1">Start organizing your certificates today</p>
                </div>

                {error && (
                    <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                        {error.data?.message || 'Registration failed. Please try again.'}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Email address"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@company.com"
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                    />

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        isLoading={isLoading}
                    >
                        Create Account
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-text font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
