import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const tag = searchParams.get('tag');
  const cursor = searchParams.get('cursor');

  const offset = cursor ? parseInt(cursor, 10) : 0;

  if (tag) {
    // First find the tag id
    const { data: tagRow } = await db
      .from('tags')
      .select('id')
      .eq('slug', tag.toLowerCase())
      .maybeSingle();

    if (!tagRow) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    // Get resource IDs for this tag
    const { data: rtRows, error: rtError } = await db
      .from('resource_tags')
      .select('resource_id')
      .eq('tag_id', tagRow.id);

    if (rtError) {
      return NextResponse.json({ error: rtError.message }, { status: 500 });
    }

    const resourceIds = (rtRows || []).map((r) => r.resource_id);
    if (resourceIds.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    let query = db
      .from('resources')
      .select('id, type, name, description, url, domain, preview_image_url, created_by, created_by_url, created_at')
      .in('id', resourceIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const items = (data || []).map((r) => ({ ...r, tags: [tag.toLowerCase()] }));
    const nextCursor = items.length === PAGE_SIZE ? String(offset + PAGE_SIZE) : null;
    return NextResponse.json({ items, nextCursor }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  }

  // No tag filter
  let query = db
    .from('resources')
    .select('id, type, name, description, url, domain, preview_image_url, created_by, created_by_url, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data || []).map((r) => ({ ...r, tags: [] }));
  const nextCursor = items.length === PAGE_SIZE ? String(offset + PAGE_SIZE) : null;

  return NextResponse.json({ items, nextCursor }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
