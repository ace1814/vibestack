export type ResourceType = 'tool' | 'learning' | 'project' | 'mcp';

export interface Tag {
  id: string;
  slug: string;
  label: string;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  description: string | null;
  url: string;
  domain: string;
  preview_image_url: string | null;
  created_at: string;
  tags?: string[]; // tag slugs
  created_by?: string | null;
  created_by_url?: string | null;
}

export interface ResourcesResponse {
  items: Resource[];
  nextCursor: string | null;
}

export interface CreateResourceBody {
  type: ResourceType;
  name: string;
  description: string;
  url: string;
  tags: string[]; // tag slugs
  preview_image_url?: string; // optional manual override
  created_by?: string;
  created_by_url?: string;
}
