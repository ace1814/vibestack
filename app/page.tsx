'use client';

import { useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import ResourceCard from '@/components/ResourceCard';
import FilterBar from '@/components/FilterBar';
import { Resource, Tag } from '@/lib/types';

/** Returns a human-readable relative time string using the browser's local timezone */
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: days > 365 ? 'numeric' : undefined,
  });
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedType = searchParams.get('type') || '';
  const selectedTag = searchParams.get('tag') || '';

  // Extra items loaded via "Load more" (cursor-based pagination)
  const [extraItems, setExtraItems] = useState<Resource[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Build the API key for the current filter combo
  const resourceParams = new URLSearchParams();
  if (selectedType) resourceParams.set('type', selectedType);
  if (selectedTag) resourceParams.set('tag', selectedTag);
  const resourceKey = `/api/resources?${resourceParams.toString()}`;

  // SWR: tags (long cache — rarely change)
  const { data: tagsData } = useSWR<Tag[]>('/api/tags', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
  const tags = tagsData ?? [];

  // SWR: resources (revalidate on focus to keep fresh)
  const {
    data: resourceData,
    isLoading: loading,
    error: swrError,
    mutate: revalidateResources,
  } = useSWR<{ items: Resource[]; nextCursor: string | null }>(
    resourceKey,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
      onSuccess: (data) => {
        // Reset extra items whenever the primary query changes
        setExtraItems([]);
        setNextCursor(data.nextCursor ?? null);
      },
    }
  );

  const resources = [...(resourceData?.items ?? []), ...extraItems];
  const error = swrError ? 'Failed to load resources.' : null;

  // Track whether component has mounted (avoids SSR hydration mismatch on timeAgo)
  const mounted = typeof window !== 'undefined';

  const isMounted = useRef(true);

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    params.delete('tag');
    router.push(`/?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    router.push(`/?${params.toString()}`);
  };

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('type', selectedType);
      if (selectedTag) params.set('tag', selectedTag);
      params.set('cursor', nextCursor);

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();

      if (isMounted.current) {
        setExtraItems((prev) => [...prev, ...(data.items || [])]);
        setNextCursor(data.nextCursor || null);
      }
    } catch {
      // silent fail on load more
    } finally {
      if (isMounted.current) setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, selectedType, selectedTag]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — capped at min(50vh, 500px) */}
      <header className="h-[min(50vh,500px)] flex flex-col px-4 sm:px-14 pt-8 pb-10 bg-white overflow-hidden">
        {/* Nav row: wordmark + CTA */}
        <div className="flex items-center justify-between flex-shrink-0">
          <p className="font-sans font-light text-[clamp(16px,1.5vw,26px)] tracking-[-0.04em] text-black leading-none">
            vibestack
          </p>

          {/* CTA + last-updated timestamp — side by side */}
          <div className="flex items-center gap-3">
            {mounted && !loading && resources.length > 0 && (
              <span className="hidden sm:inline text-xs text-black/40 whitespace-nowrap">
                Last updated · {timeAgo(resources[0].created_at)}
              </span>
            )}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd7aHdgM1mEpaHS3zQNRw6_JN3T5GNYYvbn9QuX2YvNz-8-WA/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-neutral-800 active:scale-95 transition-all whitespace-nowrap"
            >
              Share Suggestions
            </a>
          </div>
        </div>

        {/* Headline — fills remaining height, vertically centered */}
        <div className="flex flex-col justify-center flex-1 min-h-0">
          <h1 className="font-serif font-normal text-[clamp(24px,3.8vw,62px)] leading-[1.1] tracking-[-0.04em] text-black">
            Stop overthinking it.
            <br />
            <em>Just start building.</em>
          </h1>
          <p className="font-sans font-normal text-[clamp(13px,1vw,17px)] leading-[1.6] text-black/60 mt-3 max-w-[800px]">
            Handpicked tools and real examples from non-coders who figured it out.
          </p>
        </div>
      </header>

      {/* Sticky filter bar */}
      <FilterBar
        tags={tags}
        selectedType={selectedType}
        selectedTag={selectedTag}
        onTypeChange={handleTypeChange}
        onTagChange={handleTagChange}
      />

      {/* Main content — left-aligned with hero */}
      <main className="px-4 sm:px-14 py-8 bg-white">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm animate-pulse"
              >
                <div className="aspect-[16/9] bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">{error}</p>
            <button
              onClick={() => revalidateResources()}
              className="mt-4 px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-neutral-800 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-500 text-lg">No resources found.</p>
            <p className="text-slate-400 text-sm mt-1">
              Try removing a filter or check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            {/* Load more */}
            {nextCursor && (
              <div className="flex justify-start mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-black text-white rounded-full font-medium text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-slate-400">
          Loading…
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
