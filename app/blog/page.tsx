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
        <div className="min-h-screen bg-ivory font-sans text-charcoal selection:bg-orange-100 relative overflow-x-hidden">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] bg-dot-grid"></div>

            {/* Navigation */}
            <nav className="sticky top-0 w-full z-40 bg-ivory/80 backdrop-blur-md border-b border-[#EEE9E2]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <QlarifyLogo />
                    <LoggedInBadge />
                </div>
            </nav>
            <nav className='w-full py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-400 relative z-10'>
                <Link href="/" className="hover:text-charcoal transition-colors">
                    Home
                </Link>
                <span className="text-slate-200">/</span>
                <span className="text-terracotta">Blog</span>
            </nav>

            {/* Hero */}
            <header className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-charcoal mb-8 leading-tight">
                    Engineering & <br /><span className="text-terracotta">Design Blog</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                    Thoughts on system architecture, diagramming, and <br />building AI-powered tools for the modern web.
                </p>
            </header>

            {/* Post Grid */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-10">
                <div className="grid gap-12 md:grid-cols-2">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
                            <article className="bg-white rounded-[2.5rem] border border-[#EEE9E2] shadow-2xl shadow-orange-900/5 overflow-hidden hover:shadow-orange-900/10 transition-all h-full flex flex-col hover:-translate-y-2 duration-300">
                                {/* Cover Image Placeholder */}
                                <div className="h-64 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-[#EEE9E2]">
                                    {post.coverImage ? (
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-24 h-24 bg-orange-100/50 rounded-3xl flex items-center justify-center text-terracotta/20 group-hover:rotate-12 transition-all">
                                            <Box size={56} />
                                        </div>
                                    )}
                                </div>

                                <div className="p-10 flex-1 flex flex-col">
                                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                                        <span className="flex items-center gap-2">
                                            <Calendar size={14} className="text-terracotta" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <User size={14} className="text-terracotta" />
                                            {post.author}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-black text-charcoal mb-4 group-hover:text-terracotta transition-colors leading-tight tracking-tight">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 font-medium">
                                        {post.excerpt}
                                    </p>

                                    <div className="inline-flex items-center text-charcoal font-black text-xs uppercase tracking-widest group/btn">
                                        Read Article
                                        <div className="ml-3 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover/btn:bg-terracotta group-hover/btn:text-white transition-all">
                                            <ArrowLeft size={16} className="rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-32 text-slate-400">
                        <p className="font-black text-xl tracking-tighter">No posts found yet. Check back soon!</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-charcoal py-24 text-slate-400">
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
