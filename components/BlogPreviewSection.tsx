"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Asterisk, ArrowRight, User } from 'lucide-react';
import axios from 'axios';
import QlarifySvg from './QlarifySvg';

interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    coverImage?: string;
    tags?: string[];
}

export default function BlogPreviewSection() {
    const [posts, setPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('/api/blog/latest');
                if (Array.isArray(res.data)) {
                    setPosts(res.data);
                }
            } catch (e) {
                console.error("Failed to fetch blog posts", e);
            }
        };
        fetchPosts();
    }, []);

    if (posts.length === 0) return null;

    return (
        <section className="py-24 bg-[#F8FAFC] border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Latest from the Blog</h2>
                        <p className="mt-2 text-slate-500">Insights on engineering, design, and better documentation.</p>
                    </div>
                    <Link href="/blog" className="hidden md:flex items-center gap-1 text-indigo-600 font-semibold hover:gap-2 transition-all">
                        View all articles <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full">
                            <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 h-full flex flex-col">
                                {post.coverImage ? (
                                    <div className="h-48 overflow-hidden">
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ) : (
                                    <div className="h-48 bg-indigo-50/50 flex items-center justify-center border-b border-indigo-50 group-hover:bg-indigo-50 transition-colors">
                                        <QlarifySvg bgColor="indigo-600" className="w-16 h-16 p-0.5 opacity-20 rounded-lg text-white" />
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <span>{post.date}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{post.tags?.[0] || 'Article'}</span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                        <User size={12} />
                                        {post.author}
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/blog" className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                        View all articles <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
