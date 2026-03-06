-- VibeStack — Supabase (Postgres) Schema
-- Run this in your Supabase SQL Editor

-- Resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('tool', 'learning', 'project', 'mcp')),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  preview_image_url TEXT,
  created_by TEXT,
  created_by_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL
);

-- Resource ↔ Tag join table
CREATE TABLE resource_tags (
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- Index for faster tag filtering
CREATE INDEX idx_resource_tags_tag_id ON resource_tags(tag_id);
CREATE INDEX idx_resource_tags_resource_id ON resource_tags(resource_id);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);

-- Optional: Disable RLS (simpler for small projects) or configure policies below
-- If you use the service role key in server routes, RLS is bypassed automatically.
-- If you want anon users to read resources publicly, enable RLS + add a policy:

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Public can read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public can read resource_tags" ON resource_tags FOR SELECT USING (true);

-- Writes are done only via service role key (admin API), so no insert/update/delete policies needed for anon.

-- Subscribers table (email capture — storing only, no sending infra yet)
CREATE TABLE subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserts are done via service role key (server route), no anon insert policy needed.
-- No public read needed either.
