'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ResourceCard from '@/components/ResourceCard';
import { Resource } from '@/lib/types';

// ─── Layout constants ────────────────────────────────────────────────────────
const CARD_W  = 280;
const CARD_H  = 280; // slot height (card + gap)
const GAP_X   = 48;
const GAP_Y   = 48;
const COLS    = 5;

/** Deterministic card position — no Math.random(), purely index-based */
function cardPosition(i: number): { x: number; y: number } {
  const col     = i % COLS;
  const row     = Math.floor(i / COLS);
  const stagger = row % 2 === 1 ? (CARD_W + GAP_X) / 2 : 0;
  const microX  = ((i * 13) % 21) - 10; // −10…+10 px
  const microY  = ((i * 7)  % 19) - 9;  // −9…+9 px
  return {
    x: col * (CARD_W + GAP_X) + stagger + microX,
    y: row * (CARD_H + GAP_Y) + microY,
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface BoardViewProps {
  isOpen: boolean;
  resources: Resource[];
  onClose: () => void;
}

interface DragRef {
  startX: number;
  startY: number;
  ox: number;
  oy: number;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BoardView({ isOpen, resources, onClose }: BoardViewProps) {
  const [offset, setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef  = useRef<DragRef | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Centre the cluster when the board opens
  useEffect(() => {
    if (isOpen) {
      const totalW = COLS * (CARD_W + GAP_X);
      setOffset({
        x: (window.innerWidth - totalW) / 2,
        y: 80,
      });
      setDragging(false);
      dragRef.current = null;
    }
  }, [isOpen]);

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

  // ─── Drag handlers ─────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only pan on primary button; ignore if clicking on a card link
    if (e.button !== 0) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    setDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, [offset]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setDragging(false);
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
  }, []);

  if (!isOpen) return null;

  // Dark mode: read from document.documentElement class
  const isDark = typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const dotColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.10)';
  const bgColor  = isDark ? '#111111' : '#f5f5f5';

  const content = (
    <div
      className="fixed inset-0 z-40 overflow-hidden"
      style={{
        backgroundColor: bgColor,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: '28px 28px',
      }}
    >
      {/* ── Header bar ── */}
      <div className="absolute top-0 left-0 right-0 z-10 h-12 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-black/8 dark:border-white/8">
        <div className="flex items-center gap-2.5">
          {/* Grid icon */}
          <svg className="w-4 h-4 text-black/40 dark:text-white/40" fill="currentColor" viewBox="0 0 16 16">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
          <span className="text-sm font-medium text-black/55 dark:text-white/55">
            Board View
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-xs text-black/30 dark:text-white/30">
            Drag to explore &middot; <kbd className="font-mono">⌘B</kbd> to exit
          </span>
          <button
            onClick={onClose}
            aria-label="Close board"
            className="flex items-center justify-center w-8 h-8 rounded-full text-black/35 dark:text-white/35 hover:text-black/60 dark:hover:text-white/60 bg-black/5 dark:bg-white/6 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Pan-able backdrop ── */}
      <div
        ref={backdropRef}
        className="absolute inset-0 pt-12"
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* ── Canvas (transforms on pan) ── */}
        <div
          style={{
            position: 'absolute',
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            willChange: 'transform',
          }}
        >
          {resources.map((resource, i) => {
            const { x, y } = cardPosition(i);
            return (
              <div
                key={resource.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: CARD_W,
                  // Disable pointer events during drag to prevent accidental navigation
                  pointerEvents: dragging ? 'none' : 'auto',
                }}
              >
                <ResourceCard resource={resource} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Empty state ── */}
      {resources.length === 0 && (
        <div className="absolute inset-0 pt-12 flex items-center justify-center">
          <p className="text-sm text-black/30 dark:text-white/30">
            No resources loaded yet — go back and let the page load first.
          </p>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
