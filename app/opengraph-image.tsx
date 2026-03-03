import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VibeStack — Handpicked tools, learning resources & projects from vibe-coders';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** Fetch the Google Fonts CSS and return the woff2 URL for the latin subset of each variant. */
async function loadFonts(): Promise<{
  serifNormal: ArrayBuffer;
  serifItalic: ArrayBuffer;
  inter: ArrayBuffer;
}> {
  const [serifCss, interCss] = await Promise.all([
    fetch(
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;1,400&display=swap',
      { headers: { 'User-Agent': UA } }
    ).then((r) => r.text()),
    fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@300&display=swap',
      { headers: { 'User-Agent': UA } }
    ).then((r) => r.text()),
  ]);

  // Helper: parse all @font-face blocks and pick the last URL for a given style
  // (Google Fonts orders subsets latin-last, so last = the plain Latin range we need)
  function pickUrl(css: string, italic: boolean): string {
    const blocks = css.split('@font-face').slice(1);
    const filtered = blocks.filter((b) =>
      italic ? b.includes('font-style: italic') : !b.includes('font-style: italic')
    );
    const last = filtered[filtered.length - 1] ?? '';
    const match = last.match(/src:\s*url\(([^)]+\.woff2)\)/);
    if (!match) throw new Error(`No woff2 for italic=${italic}`);
    return match[1];
  }

  const [serifNormal, serifItalic, inter] = await Promise.all([
    fetch(pickUrl(serifCss, false)).then((r) => r.arrayBuffer()),
    fetch(pickUrl(serifCss, true)).then((r) => r.arrayBuffer()),
    fetch(pickUrl(interCss, false)).then((r) => r.arrayBuffer()),
  ]);

  return { serifNormal, serifItalic, inter };
}

export default async function OGImage() {
  const { serifNormal, serifItalic, inter } = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
        }}
      >
        {/* Wordmark */}
        <p
          style={{
            fontFamily: 'Inter',
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '-1px',
            color: '#000000',
            margin: '0 0 48px 0',
          }}
        >
          vibestack
        </p>

        {/* Headline — two lines matching the screenshot */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'IBM Plex Serif',
              fontSize: 74,
              fontWeight: 400,
              fontStyle: 'normal',
              lineHeight: 1.12,
              letterSpacing: '-3px',
              color: '#000000',
              textAlign: 'center',
            }}
          >
            Handpicked tools, learning resources
          </span>
          <span
            style={{
              fontFamily: 'IBM Plex Serif',
              fontSize: 74,
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.12,
              letterSpacing: '-3px',
              color: '#000000',
              textAlign: 'center',
            }}
          >
            {'& projects from vibe-coders'}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'IBM Plex Serif', data: serifNormal, weight: 400, style: 'normal' },
        { name: 'IBM Plex Serif', data: serifItalic, weight: 400, style: 'italic' },
        { name: 'Inter', data: inter, weight: 300, style: 'normal' },
      ],
    }
  );
}
