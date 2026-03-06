import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Basic format validation — no external library needed
  const trimmed = (email ?? '').trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
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
