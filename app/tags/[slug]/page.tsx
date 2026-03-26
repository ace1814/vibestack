import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResourcesByTag, getAllTagSlugs } from '@/lib/data/get-resources-by-tag';
import ResourceCard from '@/components/ResourceCard';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllTagSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getResourcesByTag(slug);
  if (!result) return {};

  const { tag } = result;
  const title = `${tag.label} Tools & Resources — VibeStack`;
  const description = `A curated collection of ${tag.label} tools and resources for non-coder builders. Handpicked by the VibeStack team.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: '/og-image.png' }] },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `/tags/${slug}` },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getResourcesByTag(slug);
  if (!result) notFound();

  const { tag, resources } = result;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag.label} Tools & Resources — VibeStack`,
    description: `A curated collection of ${tag.label} tools and resources for non-coder builders.`,
    url: `https://www.vibestack.in/tags/${slug}`,
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
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-black/40 dark:text-white/40">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span>{tag.label}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-3">{tag.label}</h1>
          <p className="text-black/50 dark:text-white/50 mb-10">
            {resources.length} curated resource{resources.length !== 1 ? 's' : ''} for non-coder builders
          </p>

          {resources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <p className="text-black/40 dark:text-white/40">No resources found for this tag yet.</p>
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
