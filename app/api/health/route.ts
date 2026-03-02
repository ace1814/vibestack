import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/health
 * Quick diagnostic endpoint. Protected by admin password.
 * Usage: curl http://localhost:3000/api/health -H "x-admin-password: your-pass"
 */
export async function GET(req: NextRequest) {
  const pass = req.headers.get('x-admin-password');
  if (pass !== process.env.ADMIN_PASS) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checks: Record<string, string> = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ missing',
    SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ missing',
    ADMIN_PASS: process.env.ADMIN_PASS ? '✅ set' : '❌ missing',
  };

  let dbStatus = '';
  try {
    const { error } = await getSupabaseAdmin()
      .from('resources')
      .select('id')
      .limit(1);

    if (error) {
      dbStatus = `❌ Query error: ${error.message}`;
    } else {
      dbStatus = '✅ Connected and resources table accessible';
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('fetch failed') || msg.includes('ENOTFOUND')) {
      dbStatus =
        '❌ Cannot reach Supabase host. Check NEXT_PUBLIC_SUPABASE_URL — the project may not exist or credentials are wrong.';
    } else if (msg.includes('does not exist')) {
      dbStatus =
        '❌ Tables not found. Run supabase-schema.sql in the Supabase SQL Editor.';
    } else {
      dbStatus = `❌ ${msg}`;
    }
  }

  return NextResponse.json({ env: checks, database: dbStatus });
}
