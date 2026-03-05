'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SearchPaletteProps {
  isOpen: boolean;
  searchQuery: string;
  activeSearch: string;
  onSearchChange: (q: string) => void;
  onSearchCommit: (q: string) => void;
  onSearchClear: () => void;
  onClose: () => void;
}

export default function SearchPalette({
  isOpen,
  searchQuery,
  activeSearch,
  onSearchChange,
  onSearchCommit,
  onSearchClear,
  onClose,
}: SearchPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      // Small delay lets the opacity transition start before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchCommit(searchQuery);
    } else if (e.key === 'Escape') {
      if (searchQuery) {
        onSearchChange('');
      } else {
        onClose();
      }
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      {/* Palette card */}
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/8 dark:border-white/8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 h-14">
          {/* Search icon */}
          <svg
            className="w-4 h-4 text-black/35 dark:text-white/35 flex-shrink-0"
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
            onKeyDown={handleKeyDown}
            placeholder="Search tools, projects, MCP servers…"
            className="flex-1 text-base bg-transparent text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none"
          />

          {/* ⌘K badge — hidden once user starts typing */}
          {!searchQuery && (
            <span className="hidden sm:flex flex-shrink-0 items-center gap-1 text-[11px] font-medium text-black/25 dark:text-white/25 bg-black/5 dark:bg-white/6 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          )}

          {/* Clear button — only when query non-empty */}
          {searchQuery && (
            <button
              onClick={() => { onSearchChange(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-black/6 dark:border-white/6" />

        {/* Footer / active search hint */}
        <div className="px-4 py-3 flex items-center justify-between">
          {activeSearch ? (
            <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40">
              <span>
                Showing results for{' '}
                <span className="font-medium text-black/60 dark:text-white/60">
                  &ldquo;{activeSearch}&rdquo;
                </span>
              </span>
              <button
                onClick={() => { onSearchClear(); onClose(); }}
                className="text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition-colors underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="text-xs text-black/25 dark:text-white/25">
              Press <kbd className="font-mono">↵</kbd> to search &middot; <kbd className="font-mono">Esc</kbd> to close
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
