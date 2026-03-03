import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('tags')
      .select('id, slug, label')
      .order('label');

    if (error) {
      // Don't crash the UI if tags fail to load; return empty array
      console.error('[/api/tags] Supabase error:', error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || [], {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[/api/tags] Unexpected error:', err);
    return NextResponse.json([]);
  }
}
