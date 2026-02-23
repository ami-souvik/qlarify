"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Loader2, CheckCircle, ArrowRight, User, Box } from 'lucide-react';
import QlarifyLogo from './QlarifyLogo';

export default function SignupForm() {
    const router = useRouter();
    const [step, setStep] = useState<'signup' | 'verify'>('signup');
    const [isLoading, setIsLoading] = useState(false);

    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('/api/auth/signup', {
                action: 'signup',
                username,
                firstName,
                lastName,
                email,
                password
            });
            setStep('verify');
            toast.success(response.data.message || "Account created! Please check your email for the verification code.");
        } catch (error: any) {
            console.error("Signup error", error);
            const msg = error.response?.data?.error || "Failed to sign up";
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post('/api/auth/signup', {
                action: 'verify',
                username, // Pass username for verification
                email,
                code
            });
            toast.success("Email verified! Logging you in...");
            router.push('/login');
        } catch (error: any) {
            console.error("Verification error", error);
            const msg = error.response?.data?.error || "Failed to verify code";
            toast.error(msg);
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
                <div className="flex justify-center mb-2">
                    <QlarifyLogo />
                </div>
                <h2 className="text-center text-4xl font-black text-charcoal tracking-tighter">
                    {step === 'signup' ? 'Create your account' : 'Verify your email'}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500 font-medium">
                    {step === 'signup' ? (
                        <>
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-terracotta hover:opacity-80 transition-opacity">
                                Sign in
                            </Link>
                        </>
                    ) : (
                        <>
                            We sent a code to <span className="font-black text-charcoal">{email}</span>
                        </>
                    )}
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="bg-white p-6 shadow-2xl shadow-orange-900/5 sm:rounded-3xl border border-[#EEE9E2]">

                    {step === 'signup' ? (
                        <>
                            <form className="space-y-4" onSubmit={handleSignup}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                                            First Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User size={18} className="text-slate-300" />
                                            </div>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                autoComplete="given-name"
                                                required
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="John"
                                                className="appearance-none block w-full pl-12 pr-3 py-3 bg-slate-50 border border-[#EEE9E2] rounded-xl shadow-inner placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white sm:text-sm transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                                            Last Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User size={18} className="text-slate-300" />
                                            </div>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                autoComplete="family-name"
                                                required
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Doe"
                                                className="appearance-none block w-full pl-12 pr-3 py-3 bg-slate-50 border border-[#EEE9E2] rounded-xl shadow-inner placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white sm:text-sm transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User size={18} className="text-slate-300" />
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="johndoe"
                                            className="appearance-none block w-full pl-12 pr-3 py-3 bg-slate-50 border border-[#EEE9E2] rounded-xl shadow-inner placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white sm:text-sm transition-all font-medium"
                                        />
                                    </div>
                                </div>

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
                                            autoComplete="new-password"
                                            required
                                            minLength={8}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="appearance-none block w-full pl-12 pr-3 py-3 bg-slate-50 border border-[#EEE9E2] rounded-xl shadow-inner placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white sm:text-sm transition-all font-medium"
                                        />
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">
                                        Must be at least 8 characters.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center p-4 border border-transparent rounded-2xl shadow-xl text-lg font-black text-white bg-charcoal hover:bg-terracotta focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed items-center gap-3"
                                >
                                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                                    {isLoading ? 'Creating account...' : 'Sign up'}
                                </button>
                            </form>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#EEE9E2]" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-[0.2em]">Or continue with</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => signIn('cognito', { callbackUrl: '/app' }, { identity_provider: 'Google' })}
                                className="w-full inline-flex justify-center p-4 border border-[#EEE9E2] rounded-2xl shadow-sm bg-white text-sm font-black text-charcoal hover:bg-ivory transition-all items-center gap-3 active:scale-95"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Sign up with Google</span>
                            </button>
                        </>
                    ) : (
                        <form className="space-y-8" onSubmit={handleVerify}>
                            <div>
                                <label htmlFor="code" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                                    Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CheckCircle size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="123456"
                                        className="appearance-none block w-full pl-12 pr-4 py-4 bg-slate-50 border border-[#EEE9E2] rounded-2xl shadow-inner placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:bg-white sm:text-sm transition-all tracking-widest font-black"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center p-4 border border-transparent rounded-[1.5rem] shadow-xl text-lg font-black text-white bg-charcoal hover:bg-terracotta focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed items-center gap-3"
                            >
                                {isLoading && <Loader2 size={18} className="animate-spin" />}
                                {isLoading ? 'Verifying...' : 'Verify Email'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep('signup')}
                                    className="text-xs text-slate-400 font-bold hover:text-charcoal transition-colors uppercase tracking-widest"
                                >
                                    Change email address
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
