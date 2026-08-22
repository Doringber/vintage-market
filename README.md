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

## Bit / PayBox transfer

The cart can reveal a Bit/PayBox phone number only after the buyer fills a
name, an Israeli mobile number, and confirms they intend to pay now. The
number is stored in `BIT_PAYBOX_PHONE` and never rendered on public pages.

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
