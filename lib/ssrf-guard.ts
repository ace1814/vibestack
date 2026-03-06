/**
 * SSRF guard — validates a URL before the server fetches it.
 *
 * Blocks:
 *  • Non-http/https protocols  (file://, ftp://, javascript:, data:, …)
 *  • Loopback                  127.x.x.x, ::1, localhost
 *  • Private IPv4 ranges       10.x, 172.16-31.x, 192.168.x
 *  • Link-local / cloud meta   169.254.x.x (AWS IMDSv1 lives here)
 *  • Unspecified               0.0.0.0
 *  • Internal hostnames        *.local, *.internal, *.localhost
 *  • Google Cloud metadata     metadata.google.internal
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

// Private / reserved IPv4 ranges expressed as RegExp patterns
const PRIVATE_IP_RE = [
  /^127\./,          // loopback
  /^10\./,           // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./, // Class B private (172.16–31)
  /^192\.168\./,     // Class C private
  /^169\.254\./,     // link-local / AWS metadata
  /^0\.0\.0\.0$/,   // unspecified
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  '169.254.169.254', // AWS IMDSv1
]);

// IPv6 loopback and private ranges (basic patterns)
const BLOCKED_IPV6_RE = [
  /^\[?::1\]?$/,        // loopback
  /^\[?fc[0-9a-f]{2}:/i, // unique local
  /^\[?fe[89ab][0-9a-f]:/i, // link-local
];

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(h)) return true;

  // *.local / *.internal / *.localhost
  if (/\.(local|internal|localhost)$/i.test(h)) return true;

  // IPv4 private ranges
  for (const re of PRIVATE_IP_RE) {
    if (re.test(h)) return true;
  }

  // IPv6 private/loopback
  for (const re of BLOCKED_IPV6_RE) {
    if (re.test(h)) return true;
  }

  return false;
}

export type SsrfCheckResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

/**
 * Validate that `raw` is a safe, public HTTP/HTTPS URL.
 *
 * @example
 * const result = validateScrapeUrl(userInput);
 * if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });
 * // safe to fetch result.url
 */
export function validateScrapeUrl(raw: string): SsrfCheckResult {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, reason: 'URL is required' };
  }

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: 'Invalid URL format' };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return { ok: false, reason: `Protocol "${url.protocol}" is not allowed` };
  }

  if (isPrivateHostname(url.hostname)) {
    return { ok: false, reason: 'URL resolves to a blocked or private address' };
  }

  return { ok: true, url };
}
