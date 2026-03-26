import { getSupabaseAdmin } from '@/lib/supabase';
import { Resource, ResourceType } from '@/lib/types';

export interface TypeMeta {
  dbType: ResourceType;
  title: string;
  description: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  tools: {
    dbType: 'tool',
    title: 'AI Tools for Non-Coder Builders',
    description:
      'A curated collection of AI tools and software to help non-coders build and ship products faster.',
  },
  learning: {
    dbType: 'learning',
    title: 'Learning Resources for Vibe Coders',
    description:
      'Tutorials, courses, and guides to help non-technical builders learn to code and ship with AI.',
  },
  projects: {
    dbType: 'project',
    title: 'Real Projects Built by Non-Coders',
    description:
      'Inspiring projects built by vibe coders and non-technical founders using AI tools.',
  },
  'mcp-servers': {
    dbType: 'mcp',
    title: 'MCP Servers & Integrations',
    description:
      'A curated list of Model Context Protocol (MCP) servers to supercharge your AI coding assistant.',
  },
};

export async function getResourcesByType(
  typeSlug: string
): Promise<{ meta: TypeMeta; resources: Resource[] } | null> {
  const meta = TYPE_META[typeSlug];
  if (!meta) return null;

  const supabase = getSupabaseAdmin();

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('type', meta.dbType)
    .order('created_at', { ascending: false });

  return { meta, resources: resources ?? [] };
}

export const TYPE_SLUGS = Object.keys(TYPE_META);
