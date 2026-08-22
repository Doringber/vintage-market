create table if not exists public.products (
  slug text primary key,
  name text not null,
  category text not null,
  price numeric not null,
  image_url text,
  description text,
  stock integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
