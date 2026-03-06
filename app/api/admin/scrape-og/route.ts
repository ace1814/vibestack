import { NextRequest, NextResponse } from 'next/server';
import { scrapeOGMeta } from '@/lib/og-scraper';
import { validateScrapeUrl } from '@/lib/ssrf-guard';
import { rateLimit, getIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Auth check with rate limiting on failures (shared bucket with other admin routes)
  const ip = getIp(req);
  const pass = req.headers.get('x-admin-password');

  if (pass !== process.env.ADMIN_PASS) {
    const { allowed, retryAfterSec } = rateLimit(`admin-auth-fail:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many failed attempts — try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      );
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit scrape calls: 30 per 5 minutes (generous for admin tool, but bounded)
  const { allowed: scrapeAllowed, retryAfterSec } = rateLimit(`scrape-og:${ip}`, 30, 5 * 60 * 1000);
  if (!scrapeAllowed) {
    return NextResponse.json(
      { error: 'Too many scrape requests — please wait.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    );
  }

  let rawUrl: string;
  try {
    const body = await req.json();
    rawUrl = body.url;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // SSRF guard — validate URL before fetching
  const check = validateScrapeUrl(rawUrl);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  const { previewImageUrl, domain } = await scrapeOGMeta(rawUrl);
  return NextResponse.json({ previewImageUrl, domain });
}
