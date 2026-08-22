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
4. Stripe checkout
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

## Admin products

Open http://localhost:3000/admin locally, or `https://YOUR_DOMAIN/admin` after deploy.

1. Add `ADMIN_PASSWORD` to `.env.local` (local) and to Vercel env vars (live site)
2. Log in and edit product titles, info, prices, and images
3. Upload image files or paste image URLs
4. Hidden / zero-stock products stay out of the storefront

### Remote catalog updates

The password in `.env.local` only works on that computer. To edit the shop
from a phone or another computer:

1. Create a free Supabase project
2. Run `supabase/products.sql` in the Supabase SQL editor
3. In Vercel → Settings → Environment Variables, add:
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (`https://YOUR_DOMAIN`)
   - `BIT_PAYBOX_PHONE` (seller Bit / PayBox mobile, never in client code)
4. Redeploy
5. Open `https://YOUR_DOMAIN/admin`, sign in, and save products

The public Supabase URL and anon key only let the shop *read* products.
Admin saves need `SUPABASE_SERVICE_ROLE_KEY` (server-only write key).

Products and uploaded images are stored in Supabase, so they survive deploys.
On a laptop without Supabase, edits still save to `data/catalog.json`.

## Bit / PayBox transfer

The cart can reveal a Bit/PayBox phone number only after the buyer fills a
name, an Israeli mobile number, and confirms they intend to pay now. The
seller number is read from `BIT_PAYBOX_PHONE` on the server and never
rendered on public pages. Set it in `.env.local` locally and in Vercel for
the live site, then restart / redeploy.

## Stripe checkout

The cart "לתשלום מאובטח" button creates a Stripe Checkout Session on the server
and redirects to Stripe. Card details never touch this app.

1. Create a Stripe account at https://dashboard.stripe.com/register
2. Open https://dashboard.stripe.com/test/apikeys
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`)
   - `STRIPE_SECRET_KEY` (`sk_test_...`)
   - `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` locally)
4. Restart `npm run dev`
5. Add items to the cart and click the checkout button
6. Pay with the test card `4242 4242 4242 4242`, any future date, any CVC

Prices are loaded from the catalog on the server, not trusted from the browser.
Shipping is ₪35, or free over ₪350.

### Webhook (optional, for real order handling)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Put the printed `whsec_...` value in `STRIPE_WEBHOOK_SECRET`.

On Vercel, add the same env vars and set the webhook URL to
`https://YOUR_DOMAIN/api/stripe/webhook` for `checkout.session.completed`.
