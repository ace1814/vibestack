# VibeStack

A curated image-forward directory for non-coder builders. Showcases **tools**, **learning resources**, and **projects** — each as a card with a large preview image, name, description, and domain.

## Stack

- **Next.js 15** (App Router) — frontend + API routes
- **Supabase (Postgres)** — database
- **Tailwind CSS** — styling
- **Vercel** — deployment

## Getting started

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy your project URL, anon key, and service role key from **Settings → API**

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ADMIN_PASS` | Password to protect the admin panel |
| `NEXT_PUBLIC_ADMIN_SLUG` | The URL path for your admin panel (e.g. `abc123xyz`) |

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin panel: `http://localhost:3000/admin/<NEXT_PUBLIC_ADMIN_SLUG>`

### 4. Deploy to Vercel

```bash
npx vercel
```

Add all env variables in the Vercel dashboard under **Project Settings → Environment Variables**.

## Project structure

```
vibestack/
├── app/
│   ├── page.tsx                    # Home page (card grid + filters)
│   ├── layout.tsx
│   ├── globals.css
│   ├── admin/[slug]/page.tsx       # Admin login + panel
│   └── api/
│       ├── resources/route.ts      # GET /api/resources
│       ├── tags/route.ts           # GET /api/tags
│       └── admin/resources/
│           ├── route.ts            # POST /api/admin/resources
│           └── [id]/route.ts       # PATCH, DELETE /api/admin/resources/:id
├── components/
│   ├── ResourceCard.tsx
│   ├── FilterBar.tsx
│   ├── AdminPanel.tsx
│   └── ResourceForm.tsx
├── lib/
│   ├── supabase.ts
│   ├── og-scraper.ts
│   └── types.ts
├── supabase-schema.sql
└── .env.local.example
```

## Features

- **Card grid** — responsive 1–4 columns, OG image preview, hover "Open" overlay
- **ref tracking** — all outbound links append `?ref=vibestack`
- **Filtering** — by type (tool/learning/project) and tags; URL query string updated
- **Pagination** — 12 cards per page with "Load more"
- **Admin panel** — hidden URL + password protected; add/edit/delete resources
- **OG scraping** — automatically fetches `og:image` → `twitter:image` → favicon on save
- **Tag management** — tags auto-created when adding resources
