# Contributing to Vibestack

## Branch strategy

```
main       ← production (vibestack.in)
  └─ staging  ← staging (staging-vibestack.vercel.app)
       └─ feat/xxx  ← feature branches
```

**Day-to-day workflow:**

1. Branch off `staging`, not `main`:
   ```bash
   git checkout staging
   git pull
   git checkout -b feat/my-feature
   ```
2. Develop locally against the staging Supabase project (credentials in `.env.local`).
3. Push and open a PR targeting **`staging`**:
   ```bash
   git push -u origin feat/my-feature
   # GitHub: open PR → base: staging
   ```
4. Vercel auto-deploys a preview URL for the PR. Test there.
5. Merge `feat/my-feature` → `staging` → staging deployment updates automatically.
6. When the feature is ready for production, open a PR: **`staging` → `main`**.

## Local setup

```bash
cp env.local.example .env.local
# Fill in credentials from your Supabase project and choose an admin password
npm install
npm run dev
```

## Environment variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `ADMIN_PASS` | Choose a strong password |
| `NEXT_PUBLIC_ADMIN_SLUG` | Choose an unguessable URL slug |

Use the **staging** Supabase project credentials when working on `staging` or `feat/*` branches.

## Database schema

Run `supabase-schema.sql` in the Supabase SQL Editor to initialize the schema on a new project.
