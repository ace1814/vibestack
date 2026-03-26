import { getSupabaseAdmin } from '@/lib/supabase';
import { Resource, Tag } from '@/lib/types';

export async function getResourcesByTag(
  slug: string
): Promise<{ tag: Tag; resources: Resource[] } | null> {
  const supabase = getSupabaseAdmin();

  const { data: tag, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !tag) return null;

  const { data: rtRows } = await supabase
    .from('resource_tags')
    .select('resource_id')
    .eq('tag_id', tag.id);

  const resourceIds = (rtRows ?? []).map((r: { resource_id: string }) => r.resource_id);

  if (resourceIds.length === 0) return { tag, resources: [] };

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .in('id', resourceIds)
    .order('created_at', { ascending: false });

  return { tag, resources: resources ?? [] };
}

export async function getAllTagSlugs(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('tags').select('slug');
  return (data ?? []).map((t: { slug: string }) => t.slug);
}
