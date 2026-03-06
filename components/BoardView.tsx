'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ResourceCard from '@/components/ResourceCard';
import { Resource } from '@/lib/types';

// ─── Layout constants ────────────────────────────────────────────────────────
const CARD_W          = 320;
const CARD_EST_H      = 298; // 320 * (9/16) = 180px image + ~118px text/padding
const GAP             = 12;
const NUM_COLS        = 5;
const FRICTION        = 0.88; // momentum decay per frame
const MIN_VELOCITY    = 0.4;  // px/frame — stop threshold

/** Column-first masonry-style positions */
function getCardPositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const col = i % NUM_COLS;
    const row = Math.floor(i / NUM_COLS);
    return {
      x: col * (CARD_W + GAP),
      y: row * (CARD_EST_H + GAP),
    };
  });
}

/** Total canvas dimensions */
function canvasSize(count: number) {
  const rows = Math.ceil(count / NUM_COLS);
  return {
    w: NUM_COLS * (CARD_W + GAP) - GAP,
    h: rows    * (CARD_EST_H + GAP) - GAP,
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface BoardViewProps {
  isOpen: boolean;
  resources: Resource[];
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BoardView({ isOpen, resources, onClose }: BoardViewProps) {
  const [offset,   setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const dragRef     = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const velRef      = useRef({ x: 0, y: 0 });
  const prevMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const rafRef      = useRef<number | null>(null);
  const offsetRef   = useRef({ x: 0, y: 0 }); // mirror for RAF access without stale closure

  // Centre on open
  useEffect(() => {
    if (!isOpen) return;
    const { w } = canvasSize(resources.length);
    const initX = (window.innerWidth  - w) / 2;
    const initY = 56; // below header
    setOffset({ x: initX, y: initY });
    offsetRef.current = { x: initX, y: initY };
    setDragging(false);
    dragRef.current  = null;
    velRef.current   = { x: 0, y: 0 };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [isOpen, resources.length]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  // Cancel inertia on close
  useEffect(() => {
    if (!isOpen && rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [isOpen]);

  // ─── Drag + inertia ────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    velRef.current   = { x: 0, y: 0 };
    prevMoveRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    dragRef.current  = { startX: e.clientX, startY: e.clientY, ox: offsetRef.current.x, oy: offsetRef.current.y };
    setDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const now = Date.now();
    if (prevMoveRef.current) {
      const dt = Math.max(1, now - prevMoveRef.current.t);
      velRef.current = {
        x: ((e.clientX - prevMoveRef.current.x) / dt) * 16,
        y: ((e.clientY - prevMoveRef.current.y) / dt) * 16,
      };
    }
    prevMoveRef.current = { x: e.clientX, y: e.clientY, t: now };
    const nx = dragRef.current.ox + (e.clientX - dragRef.current.startX);
    const ny = dragRef.current.oy + (e.clientY - dragRef.current.startY);
    setOffset({ x: nx, y: ny });
    offsetRef.current = { x: nx, y: ny };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current    = null;
    prevMoveRef.current = null;
    setDragging(false);
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);

    // Kick off inertia
    const animate = () => {
      const vx = velRef.current.x * FRICTION;
      const vy = velRef.current.y * FRICTION;
      velRef.current = { x: vx, y: vy };
      if (Math.abs(vx) < MIN_VELOCITY && Math.abs(vy) < MIN_VELOCITY) {
        rafRef.current = null;
        return;
      }
      const nx = offsetRef.current.x + vx;
      const ny = offsetRef.current.y + vy;
      offsetRef.current = { x: nx, y: ny };
      setOffset({ x: nx, y: ny });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  if (!isOpen) return null;

  const positions = getCardPositions(resources.length);

  const content = (
    <div className="fixed inset-0 z-40 overflow-hidden bg-white dark:bg-[#0f0f0f]">

      {/* ── Header ── */}
      <div className="absolute top-0 left-0 right-0 z-10 h-12 flex items-center justify-between px-5 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-sm border-b border-black/6 dark:border-white/6">
        <div className="flex items-center gap-2">
          {/* Grid icon */}
          <svg className="w-3.5 h-3.5 text-black/35 dark:text-white/35" fill="currentColor" viewBox="0 0 16 16">
            <rect x="1" y="1" width="6" height="6" rx="1.2" />
            <rect x="9" y="1" width="6" height="6" rx="1.2" />
            <rect x="1" y="9" width="6" height="6" rx="1.2" />
            <rect x="9" y="9" width="6" height="6" rx="1.2" />
          </svg>
          <span className="text-sm font-medium text-black/40 dark:text-white/40 tracking-tight">
            Board
          </span>
          <span className="text-black/20 dark:text-white/20 text-sm">·</span>
          <span className="text-sm text-black/30 dark:text-white/30">
            {resources.length} resources
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-black/25 dark:text-white/20">
            Drag to explore &middot; <kbd className="font-mono">⌘B</kbd> to exit
          </span>
          <button
            onClick={onClose}
            aria-label="Close board"
            className="flex items-center justify-center w-7 h-7 rounded-full text-black/35 dark:text-white/35 hover:text-black/70 dark:hover:text-white/70 hover:bg-black/6 dark:hover:bg-white/8 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Pan backdrop ── */}
      <div
        className="absolute inset-0 pt-12"
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', userSelect: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* ── Canvas ── */}
        <div
          style={{
            position: 'absolute',
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            willChange: 'transform',
          }}
        >
          {resources.map((resource, i) => {
            const { x, y } = positions[i];
            return (
              <div
                key={resource.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: CARD_W,
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
            No resources yet — go back and let the page load first.
          </p>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
