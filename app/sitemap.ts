
import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const baseUrl = 'https://qlarify.qurtesy.com'; // Replace with your actual domain

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogUrls,
  ];
}
