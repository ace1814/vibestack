import type { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAllPosts } from '@/lib/blog';
import { TYPE_SLUGS } from '@/lib/data/get-resources-by-type';

export const revalidate = 3600;

const BASE = 'https://www.vibestack.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();

  const [{ data: resources }, { data: tags }] = await Promise.all([
    supabase.from('resources').select('id, created_at'),
    supabase.from('tags').select('slug'),
  ]);

  const posts = getAllPosts();

  const resourceUrls: MetadataRoute.Sitemap = (resources ?? []).map((r) => ({
    url: `${BASE}/resources/${r.id}`,
    lastModified: new Date(r.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const tagUrls: MetadataRoute.Sitemap = (tags ?? []).map((t) => ({
    url: `${BASE}/tags/${t.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const typeUrls: MetadataRoute.Sitemap = TYPE_SLUGS.map((type) => ({
    url: `${BASE}/${type}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1.0 },
    ...typeUrls,
    ...resourceUrls,
    ...tagUrls,
    ...blogUrls,
  ];
}
