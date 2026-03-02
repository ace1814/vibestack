'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ResourceCard from '@/components/ResourceCard';
import FilterBar from '@/components/FilterBar';
import { Resource, Tag } from '@/lib/types';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedType = searchParams.get('type') || '';
  const selectedTag = searchParams.get('tag') || '';

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch tags once
  useEffect(() => {
    fetch('/api/tags')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted.current) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  // Fetch resources when filters change
  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('type', selectedType);
      if (selectedTag) params.set('tag', selectedTag);

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();

      if (isMounted.current) {
        setResources(data.items || []);
        setNextCursor(data.nextCursor || null);
      }
    } catch {
      if (isMounted.current) setError('Failed to load resources.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [selectedType, selectedTag]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

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

  const handleLoadMore = async () => {
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
        setResources((prev) => [...prev, ...(data.items || [])]);
        setNextCursor(data.nextCursor || null);
      }
    } catch {
      // silent fail on load more
    } finally {
      if (isMounted.current) setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — capped at min(50vh, 500px) */}
      <header className="h-[min(50vh,500px)] flex flex-col px-4 sm:px-14 pt-8 pb-10 bg-white overflow-hidden">
        {/* Nav row: wordmark + submit */}
        <div className="flex items-center justify-between flex-shrink-0">
          <p className="font-sans font-light text-2xl sm:text-[32px] tracking-[-0.04em] text-black leading-none">
            vibestack
          </p>
          <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-neutral-800 active:scale-95 transition-all">
            Submit
          </button>
        </div>

        {/* Headline — fills remaining height, vertically centered */}
        <div className="flex flex-col justify-center flex-1 min-h-0">
          <h1 className="font-serif font-normal text-[clamp(32px,5.83vw,84px)] leading-[1.1] tracking-[-0.04em] text-black">
            Stop overthinking it.
            <br />
            <em>Just start building.</em>
          </h1>
          <p className="font-sans font-normal text-[clamp(14px,1.5vw,22px)] leading-[1.6] text-black/60 mt-3 max-w-[800px]">
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
              onClick={fetchResources}
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
