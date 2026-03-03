-- VibeStack — Migration v2
-- Run this in your Supabase SQL Editor to add MCP Servers support
-- and the "Created by" attribution fields.

-- 1. Add created_by columns
ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS created_by_url TEXT;

-- 2. Extend the type CHECK constraint to include 'mcp'
--    Drop the old constraint and recreate it with the new value.
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_type_check;
ALTER TABLE resources
  ADD CONSTRAINT resources_type_check
  CHECK (type IN ('tool', 'learning', 'project', 'mcp'));
