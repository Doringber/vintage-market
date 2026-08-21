# שנית — Vintage Market

Hebrew-first, RTL vintage / second-hand marketplace.

## Design direction

Editorial, curated, warm, minimal and image-led. Inspired by the references supplied for this project and informed by UI UX Pro Max principles.

## Current phase

V0 — visual storefront only.

Next phases:
1. Supabase products + image storage
2. Admin product management
3. Cart + checkout
4. Israeli payment provider integration
5. Orders + customer management
6. Deployment + domain

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Supabase setup (step 1)

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env.local`
3. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase clients are ready in:
- `lib/supabase/client.ts` (browser/client usage)
- `lib/supabase/server.ts` (server components and routes)
