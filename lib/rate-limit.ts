import { NextRequest } from 'next/server';

interface Entry {
  count: number;
  resetAt: number;
}

// Module-level store — persists across requests within a single serverless instance
const store = new Map<string, Entry>();

// Clean up expired entries every 60 s to prevent unbounded growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 60_000);
}

/**
 * Sliding-window in-memory rate limiter.
 *
 * @param key       Unique string identifying the caller (e.g. `ip:endpoint`)
 * @param limit     Max requests allowed per window
 * @param windowMs  Window duration in milliseconds
 * @returns         `allowed: true` if the request is within the limit,
 *                  `retryAfterSec: N` seconds until the window resets
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // First request in this window (or window expired)
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= limit) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Extract the client IP from common proxy headers.
 * Falls back to 'unknown' if no header is present.
 */
export function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}
