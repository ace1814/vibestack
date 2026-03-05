'use client';

import { useRef } from 'react';
import { Tag, ResourceType } from '@/lib/types';

const TYPES: { label: string; value: ResourceType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Tools', value: 'tool' },
  { label: 'Learning', value: 'learning' },
  { label: 'Projects', value: 'project' },
  { label: 'MCP Servers', value: 'mcp' },
];

interface FilterBarProps {
  tags: Tag[];
  selectedType: string;
  selectedTag: string;
  onTypeChange: (type: string) => void;
  onTagChange: (tag: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  // Search
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchCommit: (q: string) => void;
  onSearchClear: () => void;
}

export default function FilterBar({
  tags,
  selectedType,
  selectedTag,
  onTypeChange,
  onTagChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onSearchCommit,
  onSearchClear,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="sticky top-0 z-10 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-black/8 dark:border-white/8">
      <div className="px-4 sm:px-14 py-2.5 flex items-center gap-2">

        {/* Scrollable filter pills — flex-1 so search + toggle never shrink */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-widest flex-shrink-0">
            Type
          </span>

          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedType === t.value
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}

          {tags.length > 0 && (
            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1 flex-shrink-0" />
          )}

          {tags.length > 0 && (
            <span className="text-[11px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-widest flex-shrink-0">
              Tag
            </span>
          )}

          {tags.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => onTagChange(selectedTag === tag.slug ? '' : tag.slug)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedTag === tag.slug
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-black/5 text-black/60 hover:bg-black/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Compact inline search — same height as pills, never scrolls */}
        <div className="flex-shrink-0 relative flex items-center">
          {/* Search icon */}
          <svg
            onClick={() => inputRef.current?.focus()}
            className="absolute left-2.5 w-3.5 h-3.5 text-black/35 dark:text-white/35 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchCommit(searchQuery);
              if (e.key === 'Escape') { onSearchClear(); inputRef.current?.blur(); }
            }}
            placeholder="Search… ↵"
            className={`
              h-[34px] pl-8 text-sm bg-black/5 dark:bg-white/6
              text-black dark:text-white
              placeholder:text-black/30 dark:placeholder:text-white/30
              rounded-full border border-transparent
              focus:border-black/12 dark:focus:border-white/12 focus:outline-none
              transition-all duration-200
              ${searchQuery ? 'w-44 sm:w-52 pr-7' : 'w-32 sm:w-40 pr-3'}
            `}
          />

          {/* Clear button — only when there's a query */}
          {searchQuery && (
            <button
              onClick={() => { onSearchClear(); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className="absolute right-2 flex items-center justify-center w-4 h-4 rounded-full text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex-shrink-0 flex items-center gap-1 pl-2 border-l border-black/10 dark:border-white/10">
          <button
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-black/30 hover:text-black/60 hover:bg-black/5 dark:text-white/30 dark:hover:text-white/60 dark:hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
          </button>

          <button
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-black/30 hover:text-black/60 hover:bg-black/5 dark:text-white/30 dark:hover:text-white/60 dark:hover:bg-white/5'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.75">
              <line x1="1" y1="4" x2="15" y2="4" strokeLinecap="round" />
              <line x1="1" y1="8" x2="15" y2="8" strokeLinecap="round" />
              <line x1="1" y1="12" x2="15" y2="12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
