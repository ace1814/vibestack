'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import ResourceCard from '@/components/ResourceCard';
import ResourceListRow from '@/components/ResourceListRow';
import FilterBar from '@/components/FilterBar';
import ThemeToggle from '@/components/ThemeToggle';
import SearchPalette from '@/components/SearchPalette';
import SubscribeModal from '@/components/SubscribeModal';
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  // searchInput: what's typed in the palette (controlled)
  // activeSearch: committed query that drives the SWR key — cleared on refresh
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Email subscription state
  const [subEmail, setSubEmail]     = useState('');
  const [subStatus, setSubStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subError, setSubError]     = useState('');

  // Extra items loaded via "Load more" (cursor-based pagination)
  const [extraItems, setExtraItems] = useState<Resource[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Build the API key for the current filter + search combo
  // Only activeSearch (committed) drives the key — never raw searchInput
  const resourceParams = new URLSearchParams();
  if (selectedType) resourceParams.set('type', selectedType);
  if (selectedTag) resourceParams.set('tag', selectedTag);
  if (activeSearch.length >= 2) resourceParams.set('q', activeSearch);
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
        setExtraItems([]);
        setNextCursor(data.nextCursor ?? null);
      },
    }
  );

  const resources = [...(resourceData?.items ?? []), ...extraItems];
  const error = swrError ? 'Failed to load resources.' : null;

  const mounted = typeof window !== 'undefined';
  const isMounted = useRef(true);

  // ⌘K / Ctrl+K — search palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) { params.set('type', type); } else { params.delete('type'); }
    params.delete('tag');
    router.push(`/?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) { params.set('tag', tag); } else { params.delete('tag'); }
    router.push(`/?${params.toString()}`);
  };

  // Commits the search: updates in-memory state only (no URL sync — clears on refresh)
  const handleSearchCommit = (value: string) => {
    const trimmed = value.trim();
    setActiveSearch(trimmed);
    setIsPaletteOpen(false);
  };

  // Clears both the input and the active search
  const handleSearchClear = () => {
    setSearchInput('');
    setActiveSearch('');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subStatus === 'loading' || subStatus === 'success') return;
    setSubStatus('loading');
    setSubError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubStatus('success');
      } else {
        setSubError(data.error || 'Something went wrong.');
        setSubStatus('error');
      }
    } catch {
      setSubError('Network error — please try again.');
      setSubStatus('error');
    }
  };

  const handleSubscribeClose = () => {
    setIsSubscribeOpen(false);
    // Reset error so re-opening the modal gives a clean form; keep 'success' state for the session
    if (subStatus === 'error') {
      setSubStatus('idle');
      setSubError('');
    }
  };

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('type', selectedType);
      if (selectedTag) params.set('tag', selectedTag);
      if (activeSearch.length >= 2) params.set('q', activeSearch);
      params.set('cursor', nextCursor);
      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      if (isMounted.current) {
        setExtraItems((prev) => [...prev, ...(data.items || [])]);
        setNextCursor(data.nextCursor || null);
      }
    } catch { /* silent */ } finally {
      if (isMounted.current) setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, selectedType, selectedTag, activeSearch]);

  // Sentinel ref for auto-loading when user scrolls near the bottom
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) handleLoadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-200">

      {/* Hero */}
      <header className="h-[min(50vh,500px)] flex flex-col px-4 sm:px-14 pt-8 pb-10 bg-white dark:bg-zinc-950 overflow-hidden">

        {/* Nav row */}
        <div className="flex items-center justify-between flex-shrink-0">
          <p className="font-sans font-light text-[clamp(16px,1.5vw,26px)] tracking-[-0.04em] text-black dark:text-white leading-none">
            vibestack
          </p>

          <div className="flex items-center gap-2">
            {mounted && !loading && resources.length > 0 && (
              <span className="hidden sm:inline text-xs text-black/40 dark:text-white/40 whitespace-nowrap">
                Last updated · {timeAgo(resources[0].created_at)}
              </span>
            )}

            {/* Search trigger — fake search bar */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Search (⌘K)"
              className="hidden sm:flex items-center gap-2.5 pl-3.5 pr-3 py-2 rounded-full bg-black/5 hover:bg-black/8 dark:bg-white/6 dark:hover:bg-white/10 text-black/35 dark:text-white/35 text-sm transition-colors w-56 lg:w-72"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
              <span className="flex-1 text-left text-sm">Search resources…</span>
              <kbd className="flex-shrink-0 text-[11px] font-medium bg-black/8 dark:bg-white/10 text-black/35 dark:text-white/35 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
            </button>
            {/* Mobile — icon only */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Search (⌘K)"
              className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black/40 dark:text-white/40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {/* Dark mode toggle */}
            <ThemeToggle />

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSd7aHdgM1mEpaHS3zQNRw6_JN3T5GNYYvbn9QuX2YvNz-8-WA/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100 active:scale-95 transition-all whitespace-nowrap"
            >
              Share Suggestions
            </a>
          </div>
        </div>

        {/* Headline */}
        <div className="flex flex-col justify-center flex-1 min-h-0">
          <h1 className="font-serif font-normal text-[clamp(24px,3.8vw,62px)] leading-[1.1] tracking-[-0.04em] text-black dark:text-white">
            A curated library for
            <br />
            <em>non-coders who want to build.</em>
          </h1>
          <p className="font-sans font-normal text-[clamp(13px,1vw,17px)] leading-[1.6] text-black/60 dark:text-white/50 mt-3 max-w-[800px]">
            Handpicked tools, resources and real projects so you don&apos;t waste time.
          </p>

          {/* Intent chips */}
          <div className="flex flex-wrap gap-2 mt-5">
            {([
              { label: 'Build something',    emoji: '🛠', type: 'tool'     },
              { label: 'Learn vibe coding',  emoji: '📚', type: 'learning' },
              { label: 'Find an MCP server', emoji: '⚡', type: 'mcp'      },
            ] as const).map(({ label, emoji, type }) => (
              <button
                key={type}
                onClick={() => {
                  handleTypeChange(selectedType === type ? '' : type);
                  document.getElementById('resource-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedType === type
                    ? 'bg-black/8 dark:bg-white/10 text-black dark:text-white ring-1 ring-black/15 dark:ring-white/15'
                    : 'bg-black/4 dark:bg-white/6 text-black/55 dark:text-white/55 hover:bg-black/7 dark:hover:bg-white/9 hover:text-black/80 dark:hover:text-white/80'
                }`}
              >
                <span>{emoji}</span>
                {label}
                <span className="opacity-40 text-[10px]">→</span>
              </button>
            ))}
          </div>

          {/* Subscribe trigger */}
          <div className="mt-4">
            <button
              onClick={() => setIsSubscribeOpen(true)}
              className="h-9 px-5 rounded-full text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-95 transition-all"
            >
              Subscribe now
            </button>
          </div>
        </div>
      </header>

      {/* Sticky filter bar */}
      <FilterBar
        tags={tags}
        selectedType={selectedType}
        selectedTag={selectedTag}
        onTypeChange={handleTypeChange}
        onTagChange={handleTagChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeSearch={activeSearch}
        onSearchClear={handleSearchClear}
      />

      {/* ⌘K Search palette */}
      <SearchPalette
        isOpen={isPaletteOpen}
        searchQuery={searchInput}
        activeSearch={activeSearch}
        onSearchChange={setSearchInput}
        onSearchCommit={handleSearchCommit}
        onSearchClear={handleSearchClear}
        onClose={() => setIsPaletteOpen(false)}
        onTypeChange={handleTypeChange}
        onTagChange={handleTagChange}
      />

      {/* Subscribe modal */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        subEmail={subEmail}
        subStatus={subStatus}
        subError={subError}
        onEmailChange={(v) => { setSubEmail(v); if (subStatus === 'error') setSubStatus('idle'); }}
        onSubmit={handleSubscribe}
        onClose={handleSubscribeClose}
      />

      {/* Main content */}
      <main id="resource-grid" className="px-4 sm:px-14 py-8 bg-white dark:bg-zinc-950">
        {loading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm animate-pulse">
                  <div className="aspect-[16/9] bg-slate-100 dark:bg-zinc-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-full" />
                    <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b border-black/6 dark:border-white/6 animate-pulse">
                  <div className="flex-shrink-0 w-[100px] sm:w-[160px] aspect-[16/9] rounded-xl bg-slate-100 dark:bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-full" />
                    <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : error ? (
          <div className="text-center py-20 text-slate-500 dark:text-zinc-400">
            <p className="text-lg">{error}</p>
            <button
              onClick={() => revalidateResources()}
              className="mt-4 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-500 dark:text-zinc-400 text-lg">
              {activeSearch ? `No matches for "${activeSearch}".` : 'No resources found.'}
            </p>
            <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
              {activeSearch ? 'Try a different keyword or clear the search.' : 'Try removing a filter or check back later.'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <div>
                {resources.map((resource) => (
                  <ResourceListRow key={resource.id} resource={resource} />
                ))}
              </div>
            )}

            {/* Sentinel: triggers auto-load when scrolled into view (200px before bottom) */}
            <div ref={sentinelRef} className="mt-10 flex justify-center h-8">
              {loadingMore && (
                <span className="text-sm text-neutral-400 dark:text-neutral-500">Loading…</span>
              )}
            </div>
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
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center text-slate-400">
          Loading…
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
