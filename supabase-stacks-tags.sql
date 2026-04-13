-- ============================================================
-- Vibestack: Insert stack tags + tag existing resources
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Insert the 5 stack tags
INSERT INTO tags (slug, label) VALUES
  ('beginner',      'Start here')
  ,('build-an-app',  'Build an app')
  ,('local-ai',      'Run AI locally')
  ,('design-with-ai','Design with AI')
  ,('mcp-starter',   'Automate with MCP')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Tag resources
-- ============================================================

-- beginner: Claude Code, Figma Make, Lovable, Bolt, Replit, v0
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'beginner'
AND r.name IN ('Claude Code','Figma Make','Lovable','Bolt','Replit','v0 by Vercel')
ON CONFLICT DO NOTHING;

-- beginner: learning resources
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'beginner'
AND r.name IN (
  'Claude 101',
  'Vibe Coding Essentials - Build Apps with AI Specialization',
  'I Let AI Build My Entire App — 4 Hour Vibe Coding Masterclass (Free)',
  'I left my job, knew nothing about coding, and shipped a SaaS in 2 weeks. Here is the short story.'
)
ON CONFLICT DO NOTHING;

-- build-an-app: core builders
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'build-an-app'
AND r.name IN ('Claude Code','Figma Make','Lovable','Bolt','Replit','v0 by Vercel','Jules by Google')
ON CONFLICT DO NOTHING;

-- build-an-app: learning
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'build-an-app'
AND r.name IN (
  'Vibe Coding Essentials - Build Apps with AI Specialization',
  'Lovable Vibe Coding Tutorials',
  'I Let AI Build My Entire App — 4 Hour Vibe Coding Masterclass (Free)',
  'I vibe-coded an entire SaaS in a few months with Replit — here''s what I learned',
  'I left my job, knew nothing about coding, and shipped a SaaS in 2 weeks. Here is the short story.',
  'Build & Sell with Claude Code (10+ Hour Course)',
  'How I build Vibestack from scratch?'
)
ON CONFLICT DO NOTHING;

-- local-ai: tools
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'local-ai'
AND r.name IN ('Ollama','Open Router','OpenClaw')
ON CONFLICT DO NOTHING;

-- local-ai: learning
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'local-ai'
AND r.name IN (
  'Run Ollama on Your Machine | AI x Local Setup',
  'The wild rise of OpenClaw...',
  '8 Practical Clawdbot Use Cases (Full Tutorial)'
)
ON CONFLICT DO NOTHING;

-- design-with-ai: tools
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'design-with-ai'
AND r.name IN ('Figma Make','Paper','Pencil','Stitch by Google','Magic Path','Moda','Quiver AI','Weavy')
ON CONFLICT DO NOTHING;

-- design-with-ai: MCPs
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'design-with-ai'
AND r.name IN ('Framer MCP','Figma MCP Console','Refero MCP')
ON CONFLICT DO NOTHING;

-- design-with-ai: learning
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'design-with-ai'
AND r.name IN (
  'Claude Just Started Designing in Figma. No, Really.',
  'The MCP Tool That''s Changing How I Use Figma'
)
ON CONFLICT DO NOTHING;

-- mcp-starter: MCPs
INSERT INTO resource_tags (resource_id, tag_id)
SELECT r.id, t.id FROM resources r, tags t
WHERE t.slug = 'mcp-starter'
AND r.name IN (
  'Framer MCP','Webflow MCP','Notion MCP','Context7',
  'Blendor MCP','Playwright','Figma MCP Console','Refero MCP'
)
ON CONFLICT DO NOTHING;

-- Verify: count resources per stack tag
SELECT t.slug, t.label, COUNT(rt.resource_id) as resource_count
FROM tags t
LEFT JOIN resource_tags rt ON rt.tag_id = t.id
WHERE t.slug IN ('beginner','build-an-app','local-ai','design-with-ai','mcp-starter')
GROUP BY t.slug, t.label
ORDER BY t.slug;
