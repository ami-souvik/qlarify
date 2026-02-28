import Link from 'next/link';
import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { Calendar, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import LoggedInBadge from '@/components/LoggedInBadge';
import QlarifyLogo from '@/components/QlarifyLogo';

export async function generateStaticParams() {
    const posts = getBlogPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPost(slug);
    if (!post) return { title: 'Not Found' };

    return {
        title: `${post.title} - Qlarify Blog`,
        description: post.excerpt,
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = getBlogPost(slug);

    if (!post) {
        notFound();
    }

    // Calculate read time roughly
    const words = post.content.split(/\s+/).length;
    const readTime = Math.ceil(words / 200);

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
                <Link href="/blog" className="hover:text-charcoal transition-colors">
                    Blog
                </Link>
                <span className="text-slate-200">/</span>
                <span className="text-terracotta line-clamp-1">{post.title}</span>
            </nav>

            {/* Article Header */}
            <header className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
                <div className="w-full flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 justify-center flex-wrap">
                    <span className="flex items-center gap-2 bg-white/50 border border-[#EEE9E2] px-4 py-2 rounded-full">
                        <Calendar size={14} className="text-terracotta" />
                        {post.date}
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2">
                        <Clock size={14} className="text-terracotta" />
                        {readTime} min read
                    </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-charcoal mb-10 leading-tight">
                    {post.title}
                </h1>
                <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-charcoal rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-orange-900/10">
                        {post.author.charAt(0)}
                    </div>
                    <div className="text-left">
                        <div className="font-black text-charcoal tracking-tight">{post.author}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Author</div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-10">
                {post.coverImage && (
                    <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-orange-900/10 border border-[#EEE9E2]">
                        <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
                    </div>
                )}

                <div className="prose prose-slate prose-lg md:prose-xl mx-auto prose-headings:font-black prose-headings:text-charcoal prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-terracotta prose-a:no-underline hover:prose-a:underline prose-img:rounded-[2rem]">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-4xl font-black mt-16 mb-8 tracking-tighter" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-3xl font-black mt-12 mb-6 tracking-tight text-charcoal" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-2xl font-black mt-10 mb-5 tracking-tight text-charcoal" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-8 leading-relaxed text-slate-600 font-medium" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-8 mb-8 space-y-3 text-slate-600 font-medium" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-8 mb-8 space-y-3 text-slate-600 font-medium" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-8 border-terracotta pl-8 py-4 my-12 bg-orange-50/50 italic text-charcoal font-bold rounded-r-[2rem] text-2xl tracking-tight" {...props} />,
                            code: ({ node, ...props }) => {
                                const { className, children } = props as any;
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !String(children).includes('\n');

                                return isInline
                                    ? <code className="bg-orange-50 text-terracotta px-2 py-1 rounded-lg text-sm font-mono font-black" {...props} />
                                    : <pre className="bg-charcoal text-slate-50 p-8 rounded-[2rem] shadow-2xl overflow-x-auto text-sm my-10 font-mono leading-relaxed border border-white/5"><code {...props} /></pre>;
                            },
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Share / Tags Footer within article */}
                <div className="mt-20 pt-10 border-t border-[#EEE9E2] flex flex-wrap gap-3">
                    {post.tags?.map(tag => (
                        <span key={tag} className="text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-4 py-2 rounded-xl hover:bg-orange-100 hover:text-terracotta transition-colors cursor-pointer">#{tag}</span>
                    ))}
                </div>
            </article>

            {/* CTA */}
            <section className="py-32 px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-charcoal p-16 md:p-24 rounded-[4rem] text-center text-white shadow-[0_40px_100px_-20px_rgba(26,26,26,0.5)] relative overflow-hidden group">
                        {/* Dot Grid Background for CTA */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.1] bg-dot-grid"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">Ready to optimize your <br /><span className="text-terracotta">architecture?</span></h2>
                            <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto font-medium leading-relaxed">Build your first diagram with Qlarify in seconds using just natural language.</p>
                            <Link href="/login" className="inline-block bg-white text-charcoal font-black px-12 py-5 rounded-2xl hover:bg-terracotta hover:text-white transition-all transform hover:scale-105 active:scale-95 text-lg">
                                Try Qlarify Free
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
