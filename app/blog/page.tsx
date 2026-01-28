import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import { Asterisk, ArrowLeft, Calendar, User } from 'lucide-react';
import { Metadata } from 'next';

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
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-indigo-600 p-0.5 rounded-lg text-white">
                            <Asterisk size={24} fill="currentColor" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">Qlarify</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                            Log in
                        </Link>
                        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                            Back to Tool
                        </Link>
                    </div>
                </div>
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
                                        <div className="text-indigo-200 opacity-20">
                                            <Asterisk size={120} />
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
            <footer className="border-t border-slate-200 bg-white mt-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                        <div className="bg-indigo-600 p-0.5 rounded-lg text-white">
                            <Asterisk size={16} fill="currentColor" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-900">Qlarify</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Qlarify. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
