import { NextRequest, NextResponse } from 'next/server';
import { scrapeOGMeta } from '@/lib/og-scraper';

export async function POST(req: NextRequest) {
  const pass = req.headers.get('x-admin-password');
  if (pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let url: string;
  try {
    const body = await req.json();
    url = body.url;
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const { previewImageUrl, domain } = await scrapeOGMeta(url);
  return NextResponse.json({ previewImageUrl, domain });
}
