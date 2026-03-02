'use client';

import { Tag, ResourceType } from '@/lib/types';

const TYPES: { label: string; value: ResourceType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Tools', value: 'tool' },
  { label: 'Learning', value: 'learning' },
  { label: 'Projects', value: 'project' },
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
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-1">
              Type
            </span>
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => onTypeChange(t.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedType === t.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          {tags.length > 0 && (
            <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1 flex-shrink-0" />
          )}

          {/* Tag filter */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-1">
                Tag
              </span>
              {tags.map((tag) => (
                <button
                  key={tag.slug}
                  onClick={() =>
                    onTagChange(selectedTag === tag.slug ? '' : tag.slug)
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag.slug
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
