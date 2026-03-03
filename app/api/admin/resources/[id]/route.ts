import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { scrapeOGMeta } from '@/lib/og-scraper';

function checkAdminAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('x-admin-password');
  return authHeader === process.env.ADMIN_PASS;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.type) updateData.type = body.type;
  if (body.name) updateData.name = body.name;
  if ('description' in body) updateData.description = body.description;

  // Manual image override takes highest priority
  if (body.preview_image_url !== undefined) {
    updateData.preview_image_url = body.preview_image_url || null;
  }

  // Creator attribution (null-able — pass empty string to clear)
  if ('created_by' in body) updateData.created_by = body.created_by || null;
  if ('created_by_url' in body) updateData.created_by_url = body.created_by_url || null;

  // If URL changed and no manual image provided, re-scrape
  if (body.url) {
    updateData.url = body.url;
    if (!body.preview_image_url) {
      const { previewImageUrl, domain } = await scrapeOGMeta(body.url as string);
      updateData.domain = domain;
      updateData.preview_image_url = previewImageUrl;
    } else {
      updateData.domain = new URL(body.url as string).hostname.replace(/^www\./, '');
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
    // Remove existing tags
    await getSupabaseAdmin().from('resource_tags').delete().eq('resource_id', id);

    const tagSlugs = (body.tags as string[])
      .map((t) => t.toLowerCase().trim())
      .filter(Boolean);
    const resolvedTagIds: string[] = [];

    for (const slug of tagSlugs) {
      const label = slug.charAt(0).toUpperCase() + slug.slice(1);
      const { data: tag, error: tagError } = await getSupabaseAdmin()
        .from('tags')
        .upsert({ slug, label }, { onConflict: 'slug' })
        .select('id')
        .single();

      if (!tagError && tag) {
        resolvedTagIds.push(tag.id);
      }
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
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
