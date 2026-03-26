#!/usr/bin/env node
/**
 * Scaffold a new MDX blog post (or bulk-create from CSV).
 *
 * Single post:
 *   node scripts/new-post.mjs "My Post Title" [--type guide|roundup|comparison|category]
 *
 * Bulk from CSV:
 *   node scripts/new-post.mjs --from-csv posts.csv
 *   CSV columns: title, description, slug (optional), type (optional), tags (optional, semicolon-separated), publishedAt (optional)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function buildFrontmatter({ title, description = '', slug, type = 'guide', tags = [], publishedAt }) {
  const lines = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `slug: "${slug}"`,
    `publishedAt: "${publishedAt || today()}"`,
    `type: "${type}"`,
    `tags: [${tags.map((t) => `"${t.trim()}"`).join(', ')}]`,
    '# ogImage: /og/blog/your-image.png',
    '---',
    '',
    `# ${title}`,
    '',
    description ? `${description}` : '<!-- Write your article content here -->',
    '',
  ];
  return lines.join('\n');
}

function createPost({ title, description = '', slug: customSlug, type = 'guide', tags = [], publishedAt }) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  const slug = customSlug || slugify(title);
  const filename = `${slug}.mdx`;
  const dest = path.join(BLOG_DIR, filename);

  if (fs.existsSync(dest)) {
    console.warn(`  ⚠ Skipped (already exists): ${filename}`);
    return;
  }

  const content = buildFrontmatter({ title, description, slug, type, tags, publishedAt });
  fs.writeFileSync(dest, content, 'utf-8');
  console.log(`  ✓ Created: content/blog/${filename}`);
}

// Parse a single CSV line respecting quoted fields
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function fromCsv(csvPath) {
  const abs = path.resolve(csvPath);
  if (!fs.existsSync(abs)) {
    console.error(`CSV file not found: ${abs}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(abs, 'utf-8').trim().split('\n');
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

  const col = (row, name) => {
    const i = headers.indexOf(name);
    return i >= 0 ? (row[i] ?? '').trim() : '';
  };

  let created = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const title = col(row, 'title');
    if (!title) continue;

    createPost({
      title,
      description: col(row, 'description'),
      slug: col(row, 'slug') || undefined,
      type: col(row, 'type') || 'guide',
      tags: col(row, 'tags') ? col(row, 'tags').split(';').map((t) => t.trim()).filter(Boolean) : [],
      publishedAt: col(row, 'publishedat') || col(row, 'published_at') || undefined,
    });
    created++;
  }
  console.log(`\nDone — processed ${created} row(s).`);
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args[0] === '--from-csv') {
  if (!args[1]) { console.error('Usage: node scripts/new-post.mjs --from-csv <path>'); process.exit(1); }
  fromCsv(args[1]);
} else {
  const title = args[0];
  if (!title) {
    console.error('Usage: node scripts/new-post.mjs "Post Title" [--type guide|roundup|comparison|category]');
    process.exit(1);
  }
  const typeIdx = args.indexOf('--type');
  const type = typeIdx >= 0 ? args[typeIdx + 1] : 'guide';
  createPost({ title, type });
}
