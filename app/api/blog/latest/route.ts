
import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/blog';

export async function GET() {
  try {
    const posts = getBlogPosts();
    // Sort and slice
    const latest = posts.slice(0, 3);
    return NextResponse.json(latest);
  } catch (error: any) {
    console.error("Failed to fetch blog posts at API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
