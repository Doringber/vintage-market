create table if not exists public.products (
  slug text primary key,
  name text not null,
  category text not null,
  price numeric not null,
  image_url text,
  images text[] not null default '{}',
  description text,
  stock integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products
  add column if not exists images text[] not null default '{}';

alter table public.products enable row level security;

drop policy if exists "Public can read listed products" on public.products;
create policy "Public can read listed products"
on public.products
for select
to anon, authenticated
using (is_active = true and stock > 0);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');
