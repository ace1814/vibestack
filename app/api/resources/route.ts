import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const PAGE_SIZE = 12;
const ALLOWED_TYPES = new Set(['tool', 'learning', 'project', 'mcp']);

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);

  // --- Query param hardening ---

  // type: must be an allowed value or empty
  const rawType = searchParams.get('type') ?? '';
  const type = ALLOWED_TYPES.has(rawType) ? rawType : '';

  // tag: max 50 chars, only lowercase alphanumeric + hyphens
  const rawTag = searchParams.get('tag') ?? '';
  const tag = rawTag
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50);

  // cursor: must be a non-negative integer
  const rawCursor = searchParams.get('cursor');
  const offset = rawCursor
    ? Math.max(0, isNaN(parseInt(rawCursor, 10)) ? 0 : parseInt(rawCursor, 10))
    : 0;

  // q: max 100 chars, then strip PostgREST wildcards, then require ≥2 chars
  const rawQ = (searchParams.get('q') ?? '').trim().slice(0, 100);
  const q = rawQ.length >= 2 ? rawQ.replace(/[%_]/g, '') : '';

  // Longer CDN cache for search results (shared across users)
  const cacheHeader = q
    ? 'public, s-maxage=300, stale-while-revalidate=3600'
    : 'public, s-maxage=60, stale-while-revalidate=300';

  if (tag) {
    // First find the tag id
    const { data: tagRow } = await db
      .from('tags')
      .select('id')
      .eq('slug', tag)
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
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,created_by.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const items = (data || []).map((r) => ({ ...r, tags: [tag] }));
    const nextCursor = items.length === PAGE_SIZE ? String(offset + PAGE_SIZE) : null;
    return NextResponse.json({ items, nextCursor }, {
      headers: { 'Cache-Control': cacheHeader },
    });
  }

  // No tag filter
  let query = db
    .from('resources')
    .select('id, type, name, description, url, domain, preview_image_url, created_by, created_by_url, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (type) query = query.eq('type', type);
  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,created_by.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data || []).map((r) => ({ ...r, tags: [] }));
  const nextCursor = items.length === PAGE_SIZE ? String(offset + PAGE_SIZE) : null;

  return NextResponse.json({ items, nextCursor }, {
    headers: { 'Cache-Control': cacheHeader },
  });
}
