import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { scrapeOGMeta } from '@/lib/og-scraper';
import { validateScrapeUrl } from '@/lib/ssrf-guard';
import { rateLimit, getIp } from '@/lib/rate-limit';

const ALLOWED_TYPES = ['tool', 'learning', 'project', 'mcp'] as const;
const TAG_RE = /^[a-z0-9-]+$/;

/** Returns a 429 if the IP has failed admin auth too many times (5 / 15 min). */
function checkAdminAuth(req: NextRequest): { ok: true } | NextResponse {
  const ip = getIp(req);
  const authHeader = req.headers.get('x-admin-password');

  if (authHeader !== process.env.ADMIN_PASS) {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // --- Input validation ---

  // type enum (if provided)
  if (body.type !== undefined) {
    if (!ALLOWED_TYPES.includes(body.type as typeof ALLOWED_TYPES[number])) {
      return NextResponse.json(
        { error: `type must be one of: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
  }

  // name length
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
    }
    if (body.name.length > 200) {
      return NextResponse.json({ error: 'name must be ≤ 200 characters' }, { status: 400 });
    }
  }

  // description length
  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description === 'string' && body.description.length > 2000) {
      return NextResponse.json({ error: 'description must be ≤ 2000 characters' }, { status: 400 });
    }
  }

  // url — SSRF guard
  if (body.url) {
    const urlCheck = validateScrapeUrl(body.url as string);
    if (!urlCheck.ok) {
      return NextResponse.json({ error: `url: ${urlCheck.reason}` }, { status: 400 });
    }
  }

  // created_by length
  if (body.created_by && typeof body.created_by === 'string' && body.created_by.length > 100) {
    return NextResponse.json({ error: 'created_by must be ≤ 100 characters' }, { status: 400 });
  }

  // created_by_url
  if (body.created_by_url && typeof body.created_by_url === 'string') {
    const check = validateScrapeUrl(body.created_by_url);
    if (!check.ok) {
      return NextResponse.json({ error: `created_by_url: ${check.reason}` }, { status: 400 });
    }
  }

  // preview_image_url
  if (body.preview_image_url && typeof body.preview_image_url === 'string') {
    const imgCheck = validateScrapeUrl(body.preview_image_url);
    if (!imgCheck.ok) {
      return NextResponse.json({ error: `preview_image_url: ${imgCheck.reason}` }, { status: 400 });
    }
  }

  // tags
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      return NextResponse.json({ error: 'tags must be an array' }, { status: 400 });
    }
    if ((body.tags as unknown[]).length > 20) {
      return NextResponse.json({ error: 'Maximum 20 tags allowed' }, { status: 400 });
    }
    for (const t of body.tags as unknown[]) {
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

  // --- Build update payload ---
  const updateData: Record<string, unknown> = {};
  if (body.type) updateData.type = body.type;
  if (body.name) updateData.name = (body.name as string).trim();
  if ('description' in body) updateData.description = body.description;

  if (body.preview_image_url !== undefined) {
    updateData.preview_image_url = body.preview_image_url || null;
  }

  if ('created_by' in body) updateData.created_by = body.created_by || null;
  if ('created_by_url' in body) updateData.created_by_url = body.created_by_url || null;

  // If URL changed and no manual image provided, re-scrape (SSRF already validated above)
  if (body.url) {
    updateData.url = body.url;
    if (!body.preview_image_url) {
      const { previewImageUrl, domain } = await scrapeOGMeta(body.url as string);
      updateData.domain = domain;
      updateData.preview_image_url = previewImageUrl;
    } else {
      const parsed = new URL(body.url as string);
      updateData.domain = parsed.hostname.replace(/^www\./, '');
    }
  }

  const { data: resource, error } = await getSupabaseAdmin()
    .from('resources')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !resource) {
    return NextResponse.json(
      { error: error?.message || 'Update failed' },
      { status: 500 }
    );
  }

  // Update tags if provided
  if (Array.isArray(body.tags)) {
    await getSupabaseAdmin().from('resource_tags').delete().eq('resource_id', id);

    const tagSlugs = (body.tags as string[])
      .map((t) => t.toLowerCase().trim().replace(/\s+/g, '-'))
      .filter(Boolean);
    const resolvedTagIds: string[] = [];

    for (const slug of tagSlugs) {
      const label = slug.charAt(0).toUpperCase() + slug.slice(1);
      const { data: tag, error: tagError } = await getSupabaseAdmin()
        .from('tags')
        .upsert({ slug, label }, { onConflict: 'slug' })
        .select('id')
        .single();

      if (!tagError && tag) resolvedTagIds.push(tag.id);
    }

    if (resolvedTagIds.length > 0) {
      await getSupabaseAdmin().from('resource_tags').insert(
        resolvedTagIds.map((tag_id) => ({ resource_id: id, tag_id }))
      );
    }

    return NextResponse.json({ ...resource, tags: tagSlugs });
  }

  return NextResponse.json(resource);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = checkAdminAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const { error } = await getSupabaseAdmin()
    .from('resources')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
