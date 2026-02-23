"use client";

import Link from 'next/link';
import { Mail, Lock, Loader2, Box } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import QlarifyLogo from './QlarifyLogo';

export default function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                // In a real app, parse "NotAuthorizedException" vs "UserNotFoundException"
                console.error("Login failed", res.error);
                toast('Invalid username or password'); // Or use toast if available
            } else {
                router.push('/app');
                router.refresh();
            }
        } catch (error) {
            console.error("Login error", error);
            toast('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-charcoal selection:bg-orange-100 relative overflow-hidden">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] bg-dot-grid"></div>

            {/* Header */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="flex justify-center mb-8">
                    <QlarifyLogo />
                </div>
                <h2 className="text-center text-4xl font-black text-charcoal tracking-tighter">
                    Welcome back.
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500 font-medium">
                    Or{' '}
                    <Link href="/signup" className="font-bold text-terracotta hover:opacity-80 transition-opacity">
                        start your 14-day free trial
                    </Link>
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white p-6 shadow-2xl shadow-orange-900/5 sm:rounded-3xl border border-[#EEE9E2]">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-300" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="appearance-none block w-full pl-12 pr-3 py-3 bg-slate-50 border border-[#EEE9E2] rounded-xl shadow-inner placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white sm:text-sm transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-300" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="appearance-none block w-full pl-12 pr-3 py-3 bg-slate-50 border border-[#EEE9E2] rounded-xl shadow-inner placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white sm:text-sm transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-terracotta focus:ring-orange-100 border-[#EEE9E2] rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-500 font-medium cursor-pointer">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-bold text-charcoal hover:text-terracotta transition-colors">
                                    Forgot?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center p-4 border border-transparent rounded-2xl text-lg font-black text-white bg-charcoal hover:bg-terracotta focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed items-center gap-3"
                        >
                            {isLoading && <Loader2 size={24} className="animate-spin" />}
                            {isLoading ? 'Verifying...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#EEE9E2]" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-[0.2em]">Social login</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => signIn('cognito', { callbackUrl: '/app' }, { identity_provider: 'Google' })}
                        className="w-full inline-flex justify-center p-4 border border-[#EEE9E2] rounded-2xl shadow-sm bg-white text-sm font-black text-charcoal hover:bg-ivory transition-all items-center gap-3 active:scale-95"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
