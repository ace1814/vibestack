import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — VibeStack',
  description: 'Guides, comparisons, and tutorials on vibe coding, AI tools, and building apps without code.',
  alternates: { canonical: '/blog' },
};

export const revalidate = 86400;

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const typeLabel: Record<string, string> = {
    guide: 'Guide',
    roundup: 'Roundup',
    comparison: 'Comparison',
    category: 'Category',
  };

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
      <header className="border-b border-black/8 dark:border-white/8 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-black dark:text-white hover:opacity-70 transition-opacity"
        >
          vibestack
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-black/50 dark:text-white/50 mb-10">
          Guides and resources on vibe coding, AI tools, and building without code.
        </p>

        <div className="divide-y divide-black/8 dark:divide-white/8">
          {posts.map((post) => (
            <article key={post.slug} className="py-6 group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="flex items-center gap-3 mb-2 text-xs text-black/40 dark:text-white/40">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/6 dark:bg-white/8 font-medium capitalize">
                    {typeLabel[post.type] ?? post.type}
                  </span>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <h2 className="text-lg font-semibold leading-snug mb-1 group-hover:opacity-70 transition-opacity">
                  {post.title}
                </h2>
                <p className="text-sm text-black/55 dark:text-white/55 leading-relaxed">
                  {post.description}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>

      <footer className="border-t border-black/8 dark:border-white/8 px-6 py-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-5 py-2.5 rounded-full text-sm hover:opacity-80 transition-opacity"
        >
          Browse VibeStack →
        </Link>
      </footer>
    </main>
  );
}
