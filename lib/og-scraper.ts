import * as cheerio from 'cheerio';

export interface ScrapedMeta {
  previewImageUrl: string | null;
  domain: string;
}

function toAbsoluteUrl(src: string, baseUrl: string): string | null {
  if (!src) return null;
  try {
    return new URL(src, baseUrl).toString();
  } catch {
    return null;
  }
}

/** Fetch with a manual timeout that works across all Node versions */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; VibeStackBot/1.0; +https://vibestack.dev)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function scrapeOGMeta(url: string): Promise<ScrapedMeta> {
  let domain = 'unknown';
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return { previewImageUrl: null, domain: 'unknown' };
  }

  let html = '';
  try {
    const res = await fetchWithTimeout(url, 8_000);
    if (res.ok) {
      html = await res.text();
    }
  } catch {
    // Network error or timeout — continue with empty html (will return null image)
    return { previewImageUrl: null, domain };
  }

  if (!html) return { previewImageUrl: null, domain };

  let $: ReturnType<typeof cheerio.load>;
  try {
    $ = cheerio.load(html);
  } catch {
    return { previewImageUrl: null, domain };
  }

  // 1. og:image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) {
    const abs = toAbsoluteUrl(ogImage, url);
    if (abs) return { previewImageUrl: abs, domain };
  }

  // 2. twitter:image
  const twitterImage =
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[name="twitter:image:src"]').attr('content');
  if (twitterImage) {
    const abs = toAbsoluteUrl(twitterImage, url);
    if (abs) return { previewImageUrl: abs, domain };
  }

  // 3. favicon
  const favicon =
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    '/favicon.ico';
  const faviconAbs = toAbsoluteUrl(favicon, url);
  if (faviconAbs) return { previewImageUrl: faviconAbs, domain };

  return { previewImageUrl: null, domain };
}
