import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { rateLimit, getIp } from '@/lib/rate-limit';

// RFC 5321 max email length
const EMAIL_MAX_LEN = 254;

export async function POST(req: NextRequest) {
  // Rate limit: 10 requests per 60 minutes per IP
  const ip = getIp(req);
  const { allowed, retryAfterSec } = rateLimit(`subscribe:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests — please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email;
  const website = body.website; // honeypot field — humans leave this empty

  // Honeypot: bots fill in the hidden 'website' field; silently accept to avoid fingerprinting
  if (website) {
    return NextResponse.json({ ok: true });
  }

  // Basic format + length validation
  const trimmed = (typeof email === 'string' ? email : '').trim().toLowerCase();
  if (!trimmed) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 422 });
  }
  if (trimmed.length > EMAIL_MAX_LEN) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 422 });
  }

  const db = getSupabaseAdmin();
  const { error } = await db.from('subscribers').insert({ email: trimmed });

  if (error) {
    // Unique violation — email already subscribed; treat as success (don't leak info)
    if (error.code === '23505') {
      return NextResponse.json({ ok: true });
    }
    console.error('[subscribe]', error.message);
    return NextResponse.json({ error: 'Something went wrong, try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
