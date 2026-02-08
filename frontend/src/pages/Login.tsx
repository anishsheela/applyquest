import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { User, Lock, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAppContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = await userService.login(email, password);
            await login(token);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Invalid email or password');
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <div className="mx-auto bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <User size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">ApplyQuest</h2>
                    <p className="text-blue-100 mt-2">Sign in to continue your journey</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.98] duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Use demo credentials:</p>
                        <div className="mt-2 inline-block bg-gray-100 px-4 py-2 rounded text-xs font-mono text-gray-700">
                            email: demo@demo.com / pass: demo
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
