import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPost } from '@/lib/blog';

export const revalidate = 86400;
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const ogImage = post.ogImage ?? '/og-image.png';
  return {
    title: `${post.title} — VibeStack`,
    description: post.description,
    openGraph: {
      title: `${post.title} — VibeStack`,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — VibeStack`,
      description: post.description,
      images: [ogImage],
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'VibeStack',
      url: 'https://www.vibestack.in',
    },
    image: post.ogImage ?? 'https://www.vibestack.in/og-image.png',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
        {/* Minimal header */}
        <header className="border-b border-black/8 dark:border-white/8 px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            vibestack
          </Link>
        </header>

        <article className="max-w-2xl mx-auto px-6 py-12">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6 text-sm text-black/40 dark:text-white/40">
            <span className="px-2.5 py-0.5 rounded-full bg-black/6 dark:bg-white/8 text-xs font-medium capitalize">
              {post.type}
            </span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-black/55 dark:text-white/55 mb-10 leading-relaxed">
            {post.description}
          </p>

          {/* MDX content */}
          <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-black dark:prose-a:text-white prose-a:underline-offset-2 prose-img:rounded-xl">
            <MDXRemote source={post.content} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-black/8 dark:border-white/8">
              <p className="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-wider mb-3">
                Related
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="text-sm px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        <footer className="border-t border-black/8 dark:border-white/8 px-6 py-8 text-center">
          <p className="text-sm text-black/40 dark:text-white/40 mb-3">
            Discover the tools mentioned in this article
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-5 py-2.5 rounded-full text-sm hover:opacity-80 transition-opacity"
          >
            Browse VibeStack →
          </Link>
        </footer>
      </main>
    </>
  );
}
