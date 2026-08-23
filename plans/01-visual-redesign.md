# Plan: Visual redesign of חנות קטנה ומטריפה

Keep all Hebrew copy and current fonts (Playpen Sans Hebrew + Fredoka).
Change only layout, color, shapes, and page rhythm.

## Phase 0 — Discovery

### Allowed surfaces (do not invent new product pages)
- Home `app/page.tsx`
- Shop / products / search / product detail
- About, who-we-are, delivery, Instagram, cart, favorites
- Admin stays functional; restyle to match tokens only
- Tokens live in `app/globals.css` `:root` and component classes already used by those pages

### Keep
- `app/layout.tsx` font imports
- All user-facing sentences
- Cart Bit/PayBox flow
- Admin auth and catalog

### Anti-patterns
- Do not swap fonts
- Do not add vintage-authentication copy
- Do not use emoji as icons
- Do not drop 44px touch targets or skip-link
- Do not put new hex in components; add tokens in `:root` first

## Four directions (pick one)

### A — WOODIC shop (recommended)
Cream `#F5F3E8`, light sage `#B5D39A`, mint tiles `#C5DDB4`, no orange/terracotta.
Forest pill buttons `#4A5D45` stay for contrast.
Modular rounded blocks, category tiles, organic photo frame, product cards on white.
Best for a real shop: clear buy path, calm, kids-furniture energy.

### B — Be Kids waves
Sage/mint wavy dividers, circular category icons, cream + pastel blue.
Softer, more “about us” than store. Use if we want a story-first homepage.

### C — Palette punch
Color tiles: `#80B0E8` `#FFC0C0` `#008471` `#D1CAEA` `#D6D35F` `#C45F3F` `#F4D242` `#898E46` `#F29CC3`.
Loud Yad2/kids-market energy. High contrast required on teal/terracotta.
Use as accent system on top of A, not as the whole site.

### D — Artisanal cream
Lots of whitespace, illustration-led, boutique.
Pretty but weaker for browsing many SKUs.

**Default if no pick: A tokens + C accents on pills/categories.**

## Phase 1 — Tokens
Update `app/globals.css` `:root` only:
- `--bg-color`, `--primary`, `--accent-*`, `--title-color`
- `--radius-pill: 999px`, `--radius-block: 28px`
- Softer shadow instead of hard comic offset
Verify: grep shows no leftover `#8e6b9e` purple titles on storefront.

## Phase 2 — Home rhythm
Restyle hero, category pills, product grid, statement using existing classes in `app/page.tsx`.
Add organic blob behind `.heroImage`. Pill `.button`. Category tiles.
Verify: copy in `app/page.tsx` unchanged.

## Phase 3 — Shared chrome
Header, footer, cards, cart, content pages via `globals.css` only.
Verify: 375px no horizontal scroll; tap targets ≥44px.

## Phase 4 — Verification
- `npm run build`
- Home / shop / product / cart / about / admin still render
- Fonts still Playpen + Fredoka
- Bit checkout copy unchanged
