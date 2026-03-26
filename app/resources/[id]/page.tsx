import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResource, getAllResourceIds } from '@/lib/data/get-resource';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await getAllResourceIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) return {};

  const title = `${resource.name} — VibeStack`;
  const description =
    resource.description ??
    `Discover ${resource.name} on VibeStack — a curated library for non-coder builders.`;
  const ogImage = resource.preview_image_url ?? '/og-image.png';

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    alternates: { canonical: `/resources/${id}` },
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': resource.type === 'learning' ? 'LearningResource' : 'SoftwareApplication',
    name: resource.name,
    description: resource.description ?? undefined,
    url: resource.url,
    applicationCategory: 'DeveloperApplication',
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

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-black/40 dark:text-white/40">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span>{resource.name}</span>
          </nav>

          {/* Preview image */}
          {resource.preview_image_url && (
            <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resource.preview_image_url}
                alt={resource.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Type badge */}
          <div className="mb-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/8 dark:bg-white/10 text-black/60 dark:text-white/60">
              {resource.type}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4 leading-tight">{resource.name}</h1>

          {/* Description */}
          {resource.description && (
            <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed mb-8">
              {resource.description}
            </p>
          )}

          {/* CTA */}
          <a
            href={`${resource.url}${resource.url.includes('?') ? '&' : '?'}ref=vibestack`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-6 py-3 rounded-full text-sm hover:opacity-80 transition-opacity mb-10"
          >
            Visit {resource.domain}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {/* Tags */}
          {resource.tagObjects.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-medium text-black/40 dark:text-white/40 uppercase tracking-wider mb-3">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {resource.tagObjects.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="text-sm px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Creator */}
          {resource.created_by && (
            <div className="pt-6 border-t border-black/8 dark:border-white/8 text-sm text-black/40 dark:text-white/40">
              Added by{' '}
              {resource.created_by_url ? (
                <a
                  href={resource.created_by_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
                >
                  {resource.created_by}
                </a>
              ) : (
                resource.created_by
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-black/8 dark:border-white/8 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
            ← Back to VibeStack — curated tools for non-coder builders
          </Link>
        </footer>
      </main>
    </>
  );
}
