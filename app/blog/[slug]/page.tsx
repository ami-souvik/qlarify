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
                <Link href="/blog" className="hover:text-stone-900 transition-colors">
                    Blog
                </Link>
                <span className="text-stone-300">/</span>
                <span className="text-stone-900 line-clamp-1">{post.title}</span>
            </nav>

            {/* Article Header */}
            <header className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
                <div className="w-full flex items-center gap-4 text-sm font-medium text-slate-500 mb-6 justify-center flex-wrap">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                        <Calendar size={14} />
                        {post.date}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1">
                        <Clock size={14} />
                        {readTime} min read
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                    {post.title}
                </h1>
                <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {post.author.charAt(0)}
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-slate-900">{post.author}</div>
                        <div className="text-xs text-slate-500">Author</div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {post.coverImage && (
                    <div className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                        <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
                    </div>
                )}

                <div className="prose prose-slate prose-lg md:prose-xl mx-auto prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-12 mb-6" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-10 mb-5 text-slate-800" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-8 mb-4 text-slate-800" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-6 leading-relaxed text-slate-700" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-700" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-slate-700" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-1.5 my-8 bg-slate-50 italic text-slate-700 rounded-r-lg" {...props} />,
                            code: ({ node, ...props }) => {
                                const { className, children } = props as any;
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !String(children).includes('\n');

                                return isInline
                                    ? <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-mono font-medium" {...props} />
                                    : <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm my-6"><code className="font-mono" {...props} /></pre>;
                            },
                            img: ({ node, ...props }) => <img className="rounded-xl border border-slate-200 shadow-sm my-8 w-full" {...props} />,
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Share / Tags Footer within article */}
                <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap gap-2">
                    {post.tags?.map(tag => (
                        <span key={tag} className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">#{tag}</span>
                    ))}
                </div>
            </article>

            {/* CTA */}
            <section className="bg-indigo-900 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to optimize your architecture?</h2>
                    <p className="text-indigo-200 mb-8 max-w-xl mx-auto">Build your first diagram with Qlarify in seconds using just natural language.</p>
                    <Link href="/" className="inline-block bg-white text-indigo-900 font-bold px-8 py-3 rounded-full hover:bg-slate-100 transition-colors">
                        Try Qlarify Free
                    </Link>
                </div>
            </section>
        </div>
    );
}
