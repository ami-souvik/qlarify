import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import { Asterisk, ArrowLeft, Calendar, User, Box } from 'lucide-react';
import { Metadata } from 'next';
import QlarifyLogo from '@/components/QlarifyLogo';
import LoggedInBadge from '@/components/LoggedInBadge';

export const metadata: Metadata = {
    title: 'Blog - Qlarify',
    description: 'Latest updates, diagrams tips, and engineering insights from the Qlarify team.',
};

export default function BlogIndex() {
    const posts = getBlogPosts();

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-indigo-100">
            {/* Navigation */}
            <nav className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
                    <QlarifyLogo />
                    <LoggedInBadge />
                </div>
            </nav>
            <nav className='w-full py-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 text-sm font-medium text-stone-500'>
                <Link href="/" className="hover:text-stone-900 transition-colors">
                    Home
                </Link>
                <span className="text-stone-300">/</span>
                <span className="text-stone-900">Blog</span>
            </nav>

            {/* Hero */}
            <header className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
                    Engineering & Design <span className="text-indigo-600">Blog</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Thoughts on system architecture, diagramming, and building AI-powered tools.
                </p>
            </header>

            {/* Post Grid */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid gap-8 md:grid-cols-2">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
                            <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col hover:-translate-y-1 duration-200">
                                {/* Cover Image Placeholder (or use actual if added later) */}
                                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                    {post.coverImage ? (
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-20 h-20 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600/20">
                                            <Box size={48} />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                                        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                            <Calendar size={12} />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <User size={12} />
                                            {post.author}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                                        {post.excerpt}
                                    </p>

                                    <div className="inline-flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all">
                                        Read Article <ArrowLeft size={16} className="rotate-180 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-24 text-slate-400">
                        <p>No posts found yet. Check back soon!</p>
                    </div>
                )}
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
