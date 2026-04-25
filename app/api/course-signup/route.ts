import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { rateLimit, getIp } from '@/lib/rate-limit';

const EMAIL_MAX_LEN = 254;

export async function POST(req: NextRequest) {
  // Rate limit: 10 requests per 60 minutes per IP
  const ip = getIp(req);
  const { allowed, retryAfterSec } = rateLimit(`course-signup:${ip}`, 10, 60 * 60 * 1000);
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
  const alsoSubscribe = body.also_subscribe;
  const website = body.website; // honeypot — humans leave this empty

  // Honeypot: silently accept bots to avoid fingerprinting
  if (website) {
    return NextResponse.json({ ok: true });
  }

  // Validate email
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

  // Insert into course_signups (duplicate email returns 201 silently)
  const { error: signupError } = await db
    .from('course_signups')
    .insert({ email: trimmed, also_subscribe: alsoSubscribe === true });

  if (signupError && signupError.code !== '23505') {
    console.error('[course-signup]', signupError.message);
    return NextResponse.json({ error: 'Something went wrong, try again.' }, { status: 500 });
  }

  // If also_subscribe, upsert into subscribers table (ignore duplicates)
  if (alsoSubscribe === true) {
    const { error: subError } = await db
      .from('subscribers')
      .insert({ email: trimmed })
      .select();

    if (subError && subError.code !== '23505') {
      // Non-fatal — course signup already succeeded
      console.error('[course-signup/subscribe]', subError.message);
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
