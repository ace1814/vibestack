import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResourcesByType, TYPE_SLUGS } from '@/lib/data/get-resources-by-type';
import ResourceCard from '@/components/ResourceCard';

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return TYPE_SLUGS.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const result = await getResourcesByType(type);
  if (!result) return {};

  const { meta } = result;
  return {
    title: `${meta.title} — VibeStack`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} — VibeStack`,
      description: meta.description,
      images: [{ url: '/og-image.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} — VibeStack`,
      description: meta.description,
    },
    alternates: { canonical: `https://www.vibestack.in/${type}` },
  };
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const result = await getResourcesByType(type);
  if (!result) notFound();

  const { meta, resources } = result;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${meta.title} — VibeStack`,
    description: meta.description,
    url: `https://www.vibestack.in/${type}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-black dark:text-white">
        <header className="border-b border-black/8 dark:border-white/8 px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            vibestack
          </Link>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <nav className="mb-8 text-sm text-black/40 dark:text-white/40">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span>{meta.title}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-3">{meta.title}</h1>
          <p className="text-black/50 dark:text-white/50 mb-10 max-w-2xl">{meta.description}</p>

          {resources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <p className="text-black/40 dark:text-white/40">No resources found yet.</p>
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
