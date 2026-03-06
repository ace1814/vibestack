'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SubscribeModalProps {
  isOpen: boolean;
  subEmail: string;
  subStatus: 'idle' | 'loading' | 'success' | 'error';
  subError: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function SubscribeModal({
  isOpen,
  subEmail,
  subStatus,
  subError,
  onEmailChange,
  onSubmit,
  onClose,
}: SubscribeModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens (skip on success state)
  useEffect(() => {
    if (isOpen && subStatus !== 'success') {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, subStatus]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/8 dark:border-white/8 px-8 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 bg-black/5 dark:bg-white/6 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {subStatus === 'success' ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center py-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 mb-4">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">
              You&apos;re in!
            </h2>
            <p className="mt-2 text-sm text-black/50 dark:text-white/45 leading-relaxed">
              We&apos;ll keep you posted with the best resources every week.
            </p>
            <button
              onClick={onClose}
              className="mt-6 h-9 px-6 rounded-full text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-95 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white pr-8">
              Get the Vibestack Weekly Drop
            </h2>
            <p className="mt-2 text-sm text-black/55 dark:text-white/50 leading-relaxed">
              Get a weekly roundup of the top resources in your inbox.
            </p>

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
              <input
                ref={inputRef}
                type="email"
                required
                placeholder="your@email.com"
                value={subEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full h-10 px-4 rounded-full text-sm bg-black/5 dark:bg-white/8 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 border border-transparent focus:outline-none focus:border-black/15 dark:focus:border-white/15 transition-colors"
              />
              <button
                type="submit"
                disabled={subStatus === 'loading'}
                className="w-full h-10 rounded-full text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {subStatus === 'loading' ? 'Subscribing…' : 'Subscribe now'}
              </button>
            </form>

            {subError && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400 text-center">{subError}</p>
            )}

            <p className="mt-4 text-xs text-black/30 dark:text-white/25 text-center">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
