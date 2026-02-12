import Link from 'next/link';
import QlarifyLogo from '@/components/QlarifyLogo';
import { Box } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | Qlarify',
    description: 'Privacy Policy for Qlarify - Use of Google Data and User Information',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-indigo-100">
            {/* Navigation */}
            <nav className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
                    <QlarifyLogo />
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                <p className="text-slate-500 mb-8">Last Updated: January 29, 2026</p>

                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-indigo-600 space-y-6">
                    <p className='text-slate-600'>
                        Qlarify ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services, particularly in relation to Google user data.
                    </p>

                    <h2 className='text-2xl font-bold text-slate-800'>1. Information We Collect</h2>
                    <p className='text-slate-600'>
                        When you use Qlarify, we may collect the following types of information:
                    </p>
                    <ul className='space-y-2'>
                        <li className='text-slate-600'><strong>Account Information:</strong> When you sign up using Google, we collect your name, email address, and profile picture provided by Google.</li>
                        <li className='text-slate-600'><strong>User Content:</strong> Text descriptions and diagrams you create using our service.</li>
                        <li className='text-slate-600'><strong>Usage Data:</strong> Information about how you interact with our service, including logs and device information.</li>
                    </ul>

                    <h2 className='text-2xl font-bold text-slate-800'>2. How We Use Your Information</h2>
                    <p className='text-slate-600'>
                        We use the information we collect for the following purposes:
                    </p>
                    <ul className='space-y-2'>
                        <li className='text-slate-600'>To provide and improve our diagram generation services.</li>
                        <li className='text-slate-600'>To authenticate your identity and secure your account.</li>
                        <li className='text-slate-600'>To communicate with you about updates, support, or service-related notices.</li>
                    </ul>

                    <h2 className='text-2xl font-bold text-slate-800'>3. Google User Data</h2>
                    <p className='text-slate-600'>
                        Our use of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
                    </p>
                    <p className='text-slate-600'>
                        We DO NOT share your Google user data with third-party AI models for training purposes without your explicit consent. Your data is processed solely to provide the services you have requested.
                    </p>

                    <h2 className='text-2xl font-bold text-slate-800'>4. Data Sharing and Disclosure</h2>
                    <p className='text-slate-600'>
                        We do not sell your personal data. We may share your information only in the following circumstances:
                    </p>
                    <ul className='space-y-2'>
                        <li className='text-slate-600'><strong>Service Providers:</strong> With trusted third-party vendors who assist us in operating our service (e.g., hosting, analytics), subject to strict confidentiality obligations.</li>
                        <li className='text-slate-600'><strong>Legal Requirements:</strong> If required by law or to protect our rights and safety.</li>
                    </ul>

                    <h2 className='text-2xl font-bold text-slate-800'>5. Data Security</h2>
                    <p className='text-slate-600'>
                        We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                    </p>

                    <h2 className='text-2xl font-bold text-slate-800'>6. Contact Us</h2>
                    <p className='text-slate-600'>
                        If you have any questions about this Privacy Policy, please contact us at dsouvik141@gmail.com.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 text-white">
                        <Box size={24} className="text-indigo-500" />
                        <span className="font-bold text-xl tracking-tight">Qlarify</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <Link href="https://discord.gg/852AQe22" target="_blank" className="hover:text-white transition-colors">Discord</Link>
                    </div>
                    <div className="text-sm">
                        © 2026 Qlarify AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
