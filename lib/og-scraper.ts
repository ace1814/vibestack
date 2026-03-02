import * as cheerio from 'cheerio';
import './dns-fix';

export interface ScrapedMeta {
  previewImageUrl: string | null;
  domain: string;
}

// Multiple User-Agents to try — rotate to avoid simple bot detection
const USER_AGENTS = [
  'Mozilla/5.0 (compatible; Twitterbot/1.0)',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'LinkedInBot/1.0 (compatible; Mozilla/5.0; Jakarta Commons-HttpClient/3.1 +http://www.linkedin.com)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function toAbsoluteUrl(src: string, baseUrl: string): string | null {
  if (!src || src.startsWith('data:')) return null;
  try {
    return new URL(src, baseUrl).toString();
  } catch {
    return null;
  }
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  userAgent: string
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
}

function extractOGFromHTML(html: string, baseUrl: string): string | null {
  try {
    const $ = cheerio.load(html);

    // 1. og:image
    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content');
    if (ogImage) {
      const abs = toAbsoluteUrl(ogImage, baseUrl);
      if (abs) return abs;
    }

    // 2. twitter:image
    const twitterImage =
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      $('meta[property="twitter:image"]').attr('content');
    if (twitterImage) {
      const abs = toAbsoluteUrl(twitterImage, baseUrl);
      if (abs) return abs;
    }

    // 3. Apple touch icon (good quality, usually 180x180)
    const appleIcon =
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="apple-touch-icon-precomposed"]').attr('href');
    if (appleIcon) {
      const abs = toAbsoluteUrl(appleIcon, baseUrl);
      if (abs) return abs;
    }

    // 4. Favicon (last resort)
    const favicon =
      $('link[rel="icon"][type="image/png"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href');
    if (favicon) {
      const abs = toAbsoluteUrl(favicon, baseUrl);
      if (abs) return abs;
    }

    return null;
  } catch {
    return null;
  }
}

export async function scrapeOGMeta(url: string): Promise<ScrapedMeta> {
  let domain = 'unknown';
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return { previewImageUrl: null, domain: 'unknown' };
  }

  // Try each User-Agent until one works
  for (const ua of USER_AGENTS) {
    let html = '';
    try {
      const res = await fetchWithTimeout(url, 8_000, ua);
      // Accept 200, 206, and even some error pages that might still have OG tags
      if (res.status < 500) {
        const text = await res.text();
        if (text && text.includes('<')) {
          html = text;
        }
      }
    } catch {
      // Timeout or network error — try next UA
      continue;
    }

    if (!html) continue;

    const imageUrl = extractOGFromHTML(html, url);
    if (imageUrl) {
      return { previewImageUrl: imageUrl, domain };
    }
  }

  // All UAs failed — fall back to Google favicon as a reasonable placeholder
  const faviconFallback = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  return { previewImageUrl: faviconFallback, domain };
}
