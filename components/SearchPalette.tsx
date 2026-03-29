'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const PLACEHOLDERS = [
  'I want to build a portfolio site...',
  'Find a free Claude alternative...',
  'Best tools for designers...',
  'How to run AI locally...',
];

interface SearchPaletteProps {
  isOpen: boolean;
  searchQuery: string;
  activeSearch: string;
  onSearchChange: (q: string) => void;
  onSearchCommit: (q: string) => void;
  onSearchClear: () => void;
  onClose: () => void;
  onTypeChange: (type: string) => void;
  onTagChange: (tag: string) => void;
}

export default function SearchPalette({
  isOpen,
  searchQuery,
  activeSearch,
  onSearchChange,
  onSearchCommit,
  onSearchClear,
  onClose,
  onTypeChange,
  onTagChange,
}: SearchPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
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

  // Rotate placeholder every 3s while open
  useEffect(() => {
    if (!isOpen) return;
    const iv = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 200);
    }, 3000);
    return () => clearInterval(iv);
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

  const quickFilters = [
    { label: '🛠 Tools',       action: () => { onTypeChange('tool');     onClose(); } },
    { label: '📚 Learning',    action: () => { onTypeChange('learning'); onClose(); } },
    { label: '⚡ MCP Servers', action: () => { onTypeChange('mcp');      onClose(); } },
    { label: '🆓 Free',        action: () => { onTagChange('free');      onClose(); } },
  ];

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      {/* Palette card */}
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/8 dark:border-white/8 overflow-hidden"
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

          {/* Input + animated placeholder */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="w-full text-base bg-transparent text-black dark:text-white focus:outline-none"
            />
            {!searchQuery && (
              <span
                aria-hidden="true"
                style={{ opacity: placeholderVisible ? 1 : 0, transition: 'opacity 0.2s ease' }}
                className="absolute inset-0 flex items-center text-base text-black/30 dark:text-white/30 pointer-events-none select-none"
              >
                {PLACEHOLDERS[placeholderIdx]}
              </span>
            )}
          </div>

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

        {/* Quick-filter chips — shown when input is empty */}
        {!searchQuery && (
          <div className="px-4 py-3 flex flex-col gap-2.5">
            <p className="text-[11px] font-semibold text-black/30 dark:text-white/30 uppercase tracking-widest">
              Browse by
            </p>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-white/20 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Active search hint when input is empty */}
            {activeSearch && (
              <div className="flex items-center gap-2 text-xs text-black/40 dark:text-white/40 pt-1">
                <span>
                  Active search:{' '}
                  <span className="font-medium text-black/60 dark:text-white/60">&ldquo;{activeSearch}&rdquo;</span>
                </span>
                <button
                  onClick={() => { onSearchClear(); onClose(); }}
                  className="underline underline-offset-2 text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer hint — shown when user is typing */}
        {searchQuery && (
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
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
