export type ResourceType = 'tool' | 'learning' | 'project';

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
}
