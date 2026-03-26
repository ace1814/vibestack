import { getSupabaseAdmin } from '@/lib/supabase';
import { Resource, Tag } from '@/lib/types';

export interface ResourceWithTags extends Resource {
  tagObjects: Tag[];
}

export async function getResource(id: string): Promise<ResourceWithTags | null> {
  const supabase = getSupabaseAdmin();

  const { data: resource, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !resource) return null;

  const { data: tagRows } = await supabase
    .from('resource_tags')
    .select('tags(id, slug, label)')
    .eq('resource_id', id);

  const tagObjects: Tag[] = (tagRows ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => r.tags)
    .filter(Boolean);

  return {
    ...resource,
    tags: tagObjects.map((t) => t.slug),
    tagObjects,
  };
}

export async function getAllResourceIds(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('resources').select('id');
  return (data ?? []).map((r: { id: string }) => r.id);
}
