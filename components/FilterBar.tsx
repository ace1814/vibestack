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
}

export default function FilterBar({
  tags,
  selectedType,
  selectedTag,
  onTypeChange,
  onTagChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-black/8">
      <div className="px-4 sm:px-14 py-3">
        {/* Single scrollable row on all screen sizes */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
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
      </div>
    </div>
  );
}
