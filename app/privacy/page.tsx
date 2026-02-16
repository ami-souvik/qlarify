import Link from 'next/link';
import QlarifyLogo from '@/components/QlarifyLogo';
import { Box } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | Qlarify',
    description: 'Privacy Policy for Qlarify - Use of Google Data and User Information',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-ivory font-sans text-charcoal selection:bg-orange-100 relative overflow-x-hidden">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] bg-dot-grid"></div>

            {/* Navigation */}
            <nav className="sticky top-0 w-full z-40 bg-ivory/80 backdrop-blur-md border-b border-[#EEE9E2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <QlarifyLogo />
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-terracotta transition-colors">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <h1 className="text-5xl font-black text-charcoal mb-4 tracking-tighter">Privacy Policy</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-12">Last Updated: January 29, 2026</p>

                <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-charcoal prose-p:text-slate-600 prose-a:text-terracotta space-y-12">
                    <p className='text-lg leading-relaxed text-slate-600'>
                        Qlarify ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services, particularly in relation to Google user data.
                    </p>

                    <div>
                        <h2 className='text-2xl font-black text-charcoal tracking-tight mb-4'>1. Information We Collect</h2>
                        <ul className='space-y-4'>
                            <li className='text-slate-600 flex gap-3'>
                                <span className="bg-orange-100 text-terracotta h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">1</span>
                                <div><strong>Account Information:</strong> When you sign up using Google, we collect your name, email address, and profile picture provided by Google.</div>
                            </li>
                            <li className='text-slate-600 flex gap-3'>
                                <span className="bg-orange-100 text-terracotta h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">2</span>
                                <div><strong>User Content:</strong> Text descriptions and diagrams you create using our service.</div>
                            </li>
                            <li className='text-slate-600 flex gap-3'>
                                <span className="bg-orange-100 text-terracotta h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">3</span>
                                <div><strong>Usage Data:</strong> Information about how you interact with our service, including logs and device information.</div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='text-2xl font-black text-charcoal tracking-tight mb-4'>2. How We Use Information</h2>
                        <ul className='space-y-4'>
                            <li className='text-slate-600 flex gap-3'>
                                <span className="bg-slate-100 text-charcoal h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">A</span>
                                <div>To provide and improve our diagram generation services.</div>
                            </li>
                            <li className='text-slate-600 flex gap-3'>
                                <span className="bg-slate-100 text-charcoal h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">B</span>
                                <div>To authenticate your identity and secure your account.</div>
                            </li>
                            <li className='text-slate-600 flex gap-3'>
                                <span className="bg-slate-100 text-charcoal h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">C</span>
                                <div>To communicate with you about updates, support, or service-related notices.</div>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className='text-2xl font-black text-charcoal tracking-tight mb-4'>3. Google User Data</h2>
                        <div className="bg-white/50 border border-[#EEE9E2] p-8 rounded-[2rem]">
                            <p className='text-slate-600 mb-4'>
                                Our use of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-terracotta/30 hover:decoration-terracotta transition-all">Google API Services User Data Policy</a>, including the Limited Use requirements.
                            </p>
                            <p className='text-slate-600'>
                                We <span className="text-charcoal font-black">DO NOT</span> share your Google user data with third-party AI models for training purposes without your explicit consent. Your data is processed solely to provide the services you have requested.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className='text-2xl font-black text-charcoal tracking-tight mb-4'>4. Data Sharing and Disclosure</h2>
                        <p className='text-slate-600 mb-6'>
                            We do not sell your personal data. We may share your information only in the following circumstances:
                        </p>
                        <ul className='space-y-4'>
                            <li className='text-slate-600'><strong>Service Providers:</strong> With trusted third-party vendors who assist us in operating our service (e.g., hosting, analytics), subject to strict confidentiality obligations.</li>
                            <li className='text-slate-600'><strong>Legal Requirements:</strong> If required by law or to protect our rights and safety.</li>
                        </ul>
                    </div>

                    <div className="bg-charcoal text-white p-10 rounded-[3rem] shadow-2xl shadow-orange-900/10">
                        <h2 className='text-2xl font-black text-white tracking-tight mb-6'>6. Contact Us</h2>
                        <p className='text-slate-300 mb-8'>
                            If you have any questions about this Privacy Policy, please reach out to our team.
                        </p>
                        <a href="mailto:dsouvik141@gmail.com" className="inline-block px-8 py-4 bg-terracotta text-white font-black rounded-2xl hover:bg-white hover:text-charcoal transition-all">
                            dsouvik141@gmail.com
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-charcoal py-20 text-slate-400 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-terracotta p-2 rounded-xl text-white">
                            <Box size={24} />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-white">Qlarify</span>
                    </div>
                    <div className="flex gap-10 text-xs font-black uppercase tracking-widest">
                        <Link href="/privacy" className="hover:text-terracotta transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-terracotta transition-colors">Terms</Link>
                        <Link href="/blog" className="hover:text-terracotta transition-colors">Blog</Link>
                        <Link href="https://discord.gg/852AQe22" target="_blank" className="hover:text-terracotta transition-colors">Discord</Link>
                    </div>
                    <div className="text-xs font-bold opacity-50">
                        © 2026 Qlarify AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
