'use client';

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
}

export default function FilterBar({
  tags,
  selectedType,
  selectedTag,
  onTypeChange,
  onTagChange,
  viewMode,
  onViewModeChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-black/8">
      <div className="px-4 sm:px-14 py-3">
        <div className="flex items-center gap-2">

          {/* Scrollable pills — type + tag filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 flex-1 min-w-0">
            {/* Type label */}
            <span className="text-[11px] font-semibold text-black/30 uppercase tracking-widest flex-shrink-0">
              Type
            </span>

            {/* Type buttons */}
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => onTypeChange(t.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedType === t.value
                    ? 'bg-black text-white'
                    : 'bg-black/5 text-black/60 hover:bg-black/10'
                }`}
              >
                {t.label}
              </button>
            ))}

            {/* Divider */}
            {tags.length > 0 && (
              <div className="h-4 w-px bg-black/10 mx-1 flex-shrink-0" />
            )}

            {/* Tag label */}
            {tags.length > 0 && (
              <span className="text-[11px] font-semibold text-black/30 uppercase tracking-widest flex-shrink-0">
                Tag
              </span>
            )}

            {/* Tag buttons */}
            {tags.map((tag) => (
              <button
                key={tag.slug}
                onClick={() => onTagChange(selectedTag === tag.slug ? '' : tag.slug)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedTag === tag.slug
                    ? 'bg-black text-white'
                    : 'bg-black/5 text-black/60 hover:bg-black/10'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* View mode toggle — pinned to the right, never scrolls away */}
          <div className="flex-shrink-0 flex items-center gap-1 pl-3 border-l border-black/10">
            {/* Grid view */}
            <button
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-black text-white'
                  : 'text-black/30 hover:text-black/60 hover:bg-black/5'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>

            {/* List view */}
            <button
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-black text-white'
                  : 'text-black/30 hover:text-black/60 hover:bg-black/5'
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
    </div>
  );
}
