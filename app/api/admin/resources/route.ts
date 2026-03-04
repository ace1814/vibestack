import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { scrapeOGMeta } from '@/lib/og-scraper';
import { CreateResourceBody } from '@/lib/types';

function checkAdminAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('x-admin-password');
  return authHeader === process.env.ADMIN_PASS;
}

function dbError(err: unknown): NextResponse {
  const msg = err instanceof Error ? err.message : String(err);

  // Surface helpful messages for common Supabase failures
  if (msg.toLowerCase().includes('fetch failed') || msg.toLowerCase().includes('enotfound')) {
    return NextResponse.json(
      {
        error:
          'Cannot connect to Supabase. Check that NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local are correct and that your Supabase project exists.',
      },
      { status: 503 }
    );
  }
  if (msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('relation')) {
    return NextResponse.json(
      {
        error:
          'Database tables not found. Run supabase-schema.sql in the Supabase SQL Editor first.',
      },
      { status: 503 }
    );
  }
  return NextResponse.json({ error: msg }, { status: 500 });
}

const ADMIN_PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const db = getSupabaseAdmin();

  try {
    // Total count (exact) — needed for pagination UI
    const { count, error: countError } = await db
      .from('resources')
      .select('*', { count: 'exact', head: true });

    if (countError) return dbError(countError);

    // Paginated resources
    const { data, error } = await db
      .from('resources')
      .select('id, type, name, description, url, domain, preview_image_url, created_by, created_by_url, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + ADMIN_PAGE_SIZE - 1);

    if (error) return dbError(error);

    // Fetch tags for the returned resources
    const resourceIds = (data || []).map((r) => r.id);
    const tagsMap: Record<string, string[]> = {};

    if (resourceIds.length > 0) {
      const { data: rtData } = await db
        .from('resource_tags')
        .select('resource_id, tags(slug)')
        .in('resource_id', resourceIds);

      for (const rt of rtData || []) {
        const rid = (rt as { resource_id: string; tags: { slug: string } | null }).resource_id;
        const slug = (rt as { resource_id: string; tags: { slug: string } | null }).tags?.slug;
        if (slug) tagsMap[rid] = [...(tagsMap[rid] || []), slug];
      }
    }

    const items = (data || []).map((r) => ({ ...r, tags: tagsMap[r.id] || [] }));
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

    return NextResponse.json(
      { items, total, page, pageSize: ADMIN_PAGE_SIZE, totalPages },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateResourceBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    type,
    name,
    description,
    url,
    tags,
    preview_image_url: manualImageUrl,
    created_by,
    created_by_url,
  } = body;

  if (!type || !name || !url) {
    return NextResponse.json(
      { error: 'type, name, and url are required' },
      { status: 400 }
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  try {
    // Prevent duplicates
    const { data: existing, error: dupError } = await db
      .from('resources')
      .select('id')
      .eq('url', url)
      .maybeSingle();

    if (dupError) return dbError(dupError);

    if (existing) {
      return NextResponse.json(
        { error: 'A resource with this URL already exists' },
        { status: 409 }
      );
    }

    // Use manual image if provided, otherwise scrape
    let finalImageUrl: string | null = manualImageUrl || null;
    let domain = new URL(url).hostname.replace(/^www\./, '');

    if (!finalImageUrl) {
      const scraped = await scrapeOGMeta(url);
      finalImageUrl = scraped.previewImageUrl;
      domain = scraped.domain;
    }

    // Insert resource
    const { data: resource, error: insertError } = await db
      .from('resources')
      .insert({
        type,
        name,
        description,
        url,
        domain,
        preview_image_url: finalImageUrl,
        ...(created_by ? { created_by } : {}),
        ...(created_by_url ? { created_by_url } : {}),
      })
      .select()
      .single();

    if (insertError) return dbError(insertError);
    if (!resource) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

    // Handle tags
    const tagSlugs = (tags || [])
      .map((t: string) => t.toLowerCase().trim())
      .filter(Boolean);
    const resolvedTagIds: string[] = [];

    for (const slug of tagSlugs) {
      const label = slug.charAt(0).toUpperCase() + slug.slice(1);
      const { data: tag, error: tagError } = await db
        .from('tags')
        .upsert({ slug, label }, { onConflict: 'slug' })
        .select('id')
        .single();

      if (!tagError && tag) resolvedTagIds.push(tag.id);
    }

    if (resolvedTagIds.length > 0) {
      await db
        .from('resource_tags')
        .insert(resolvedTagIds.map((tag_id) => ({ resource_id: resource.id, tag_id })));
    }

    return NextResponse.json({ ...resource, tags: tagSlugs }, { status: 201 });
  } catch (err) {
    return dbError(err);
  }
}
