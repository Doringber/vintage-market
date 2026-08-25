-- Run in Supabase SQL Editor to enable map places from the database.

create table if not exists public.second_hand_places (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  place_type text not null check (place_type in ('sell', 'give', 'both')),
  categories text[] not null default '{general}',
  address text not null,
  city text not null,
  lat double precision not null,
  lng double precision not null,
  description text,
  phone text,
  hours text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.second_hand_places enable row level security;

create policy "Public read active places"
  on public.second_hand_places
  for select
  using (is_active = true);

insert into public.second_hand_places
  (slug, name, place_type, categories, address, city, lat, lng, description, hours)
values
  (
    'jaffa-flea-market',
    'שוק הפשפשים יפו',
    'sell',
    array['clothes', 'furniture', 'general'],
    'שוק הפשפשים, יפו',
    'תל אביב-יפו',
    32.0533,
    34.7525,
    'שוק וינטג׳ ויד שנייה עם בגדים, רהיטים, תכשיטים ופריטי אספנות.',
    'יום ראשון–חמישי 10:00–18:00'
  ),
  (
    'gan-hair-second-hand',
    'חנויות יד שנייה — גן העיר',
    'both',
    array['clothes', 'general'],
    'כיכר מגן-דוד / גן העיר',
    'תל אביב',
    32.0722,
    34.7764,
    'מספר חנויות יד שנייה ועמותות באזור גן העיר.',
    'שעות משתנות לפי חנות'
  )
on conflict (slug) do nothing;
