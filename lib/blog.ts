import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  type: 'roundup' | 'guide' | 'comparison' | 'category';
  tags: string[];
  ogImage: string | null;
  content: string; // raw MDX without frontmatter
}

function parseBlogPost(filename: string): BlogPost | null {
  if (!filename.endsWith('.mdx')) return null;

  const slug = filename.replace(/\.mdx$/, '');
  const fullPath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const { data, content } = matter(raw);

  if (!data.title || !data.description) return null;

  return {
    slug: data.slug ?? slug,
    title: data.title,
    description: data.description,
    publishedAt: data.publishedAt ?? new Date().toISOString().slice(0, 10),
    type: data.type ?? 'guide',
    tags: Array.isArray(data.tags) ? data.tags : [],
    ogImage: data.ogImage ?? null,
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(parseBlogPost)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPost(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  // Try exact filename match first, then match by slug in frontmatter
  const exactFile = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(exactFile)) {
    return parseBlogPost(`${slug}.mdx`);
  }

  // Fallback: scan all posts for matching slug in frontmatter
  const all = getAllPosts();
  return all.find((p) => p.slug === slug) ?? null;
}
