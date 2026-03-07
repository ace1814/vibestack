import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { scrapeOGMeta } from '@/lib/og-scraper';
import { validateScrapeUrl } from '@/lib/ssrf-guard';
import { rateLimit, getIp } from '@/lib/rate-limit';
import { CreateResourceBody } from '@/lib/types';

const ALLOWED_TYPES = ['tool', 'learning', 'project', 'mcp'] as const;
const TAG_RE = /^[a-z0-9-]+$/;

/** Returns a 429 if the IP has failed admin auth too many times (5 / 15 min). */
function checkAdminAuth(req: NextRequest): { ok: true } | NextResponse {
  const ip = getIp(req);
  const authHeader = req.headers.get('x-admin-password');

  if (authHeader !== process.env.ADMIN_PASS) {
    // Only count failures against the rate limit
    const { allowed, retryAfterSec } = rateLimit(`admin-auth-fail:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many failed attempts — try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      );
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { ok: true };
}

function validateHttpUrl(value: unknown, fieldName: string): string | NextResponse {
  if (typeof value !== 'string' || !value.trim()) return '';
  const check = validateScrapeUrl(value);
  if (!check.ok) {
    return NextResponse.json({ error: `${fieldName}: ${check.reason}` }, { status: 400 });
  }
  return value.trim();
}

function dbError(err: unknown): NextResponse {
  const msg = err instanceof Error ? err.message : String(err);

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
  const auth = checkAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const db = getSupabaseAdmin();

  try {
    const { count, error: countError } = await db
      .from('resources')
      .select('*', { count: 'exact', head: true });

    if (countError) return dbError(countError);

    const { data, error } = await db
      .from('resources')
      .select('id, type, name, description, url, domain, preview_image_url, created_by, created_by_url, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + ADMIN_PAGE_SIZE - 1);

    if (error) return dbError(error);

    const resourceIds = (data || []).map((r) => r.id);
    const tagsMap: Record<string, string[]> = {};

    if (resourceIds.length > 0) {
      const { data: rtData } = await db
        .from('resource_tags')
        .select('resource_id, tags(slug)')
        .in('resource_id', resourceIds);

      for (const rt of rtData || []) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = rt as any;
        const rid: string = row.resource_id;
        const rawTags = row.tags;
        const slug: string | undefined = Array.isArray(rawTags)
          ? rawTags[0]?.slug
          : rawTags?.slug;
        if (rid && slug) tagsMap[rid] = [...(tagsMap[rid] || []), slug];
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
  const auth = checkAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

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

  // --- Input validation ---

  if (!type || !name || !url) {
    return NextResponse.json({ error: 'type, name, and url are required' }, { status: 400 });
  }

  // type enum
  if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
    return NextResponse.json(
      { error: `type must be one of: ${ALLOWED_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // name
  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (name.length > 200) {
    return NextResponse.json({ error: 'name must be ≤ 200 characters' }, { status: 400 });
  }

  // description
  if (description !== undefined && description !== null && typeof description === 'string' && description.length > 2000) {
    return NextResponse.json({ error: 'description must be ≤ 2000 characters' }, { status: 400 });
  }

  // url — SSRF guard
  const urlCheck = validateScrapeUrl(url);
  if (!urlCheck.ok) {
    return NextResponse.json({ error: `url: ${urlCheck.reason}` }, { status: 400 });
  }

  // created_by
  if (created_by !== undefined && created_by !== null && typeof created_by === 'string' && created_by.length > 100) {
    return NextResponse.json({ error: 'created_by must be ≤ 100 characters' }, { status: 400 });
  }

  // created_by_url
  if (created_by_url) {
    const byUrlResult = validateHttpUrl(created_by_url, 'created_by_url');
    if (byUrlResult instanceof NextResponse) return byUrlResult;
  }

  // preview_image_url
  if (manualImageUrl) {
    const imgCheck = validateScrapeUrl(manualImageUrl);
    if (!imgCheck.ok) {
      return NextResponse.json({ error: `preview_image_url: ${imgCheck.reason}` }, { status: 400 });
    }
  }

  // tags
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'tags must be an array' }, { status: 400 });
    }
    if (tags.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 tags allowed' }, { status: 400 });
    }
    for (const t of tags) {
      // Normalise spaces → hyphens before validation so "AI Agents" → "ai-agents"
      const slug = String(t).toLowerCase().trim().replace(/\s+/g, '-');
      if (slug.length > 50) {
        return NextResponse.json({ error: 'Each tag must be ≤ 50 characters' }, { status: 400 });
      }
      if (!TAG_RE.test(slug)) {
        return NextResponse.json(
          { error: `Tag "${slug}" contains invalid characters (use a-z, 0-9, hyphens only)` },
          { status: 400 }
        );
      }
    }
  }

  const db = getSupabaseAdmin();

  try {
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

    let finalImageUrl: string | null = manualImageUrl || null;
    let domain = urlCheck.url.hostname.replace(/^www\./, '');

    if (!finalImageUrl) {
      const scraped = await scrapeOGMeta(url);
      finalImageUrl = scraped.previewImageUrl;
      domain = scraped.domain;
    }

    const { data: resource, error: insertError } = await db
      .from('resources')
      .insert({
        type,
        name: name.trim(),
        description: description?.trim() ?? null,
        url,
        domain,
        preview_image_url: finalImageUrl,
        ...(created_by ? { created_by: String(created_by).trim() } : {}),
        ...(created_by_url ? { created_by_url: String(created_by_url).trim() } : {}),
      })
      .select()
      .single();

    if (insertError) return dbError(insertError);
    if (!resource) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });

    const tagSlugs = (tags || [])
      .map((t: string) => t.toLowerCase().trim().replace(/\s+/g, '-'))
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
