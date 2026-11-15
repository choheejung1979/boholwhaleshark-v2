-- Run in Supabase SQL Editor
create table if not exists public.reservations (
 id uuid primary key default gen_random_uuid(), booking_code text not null unique,
 tour_key text not null check(tour_key in('ticket','transfer','private','combo')), tour_name text not null,
 rate_category text not null check(rate_category in('Filipino','Foreigner')),
 unit_price integer not null check(unit_price>0), guests integer not null check(guests between 1 and 30),
 total_amount integer not null check(total_amount=unit_price*guests), tour_date date not null,
 customer_name text not null, hotel text, whatsapp text not null, email text not null, special_request text,
 payment_status text not null default 'pending' check(payment_status in('pending','paid','failed','cancelled')),
 payment_provider text not null default 'PayMongo', checkout_session_id text unique, payment_intent_id text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists reservations_created_at_idx on public.reservations(created_at desc);
alter table public.reservations enable row level security;
drop policy if exists "Admins can read reservations" on public.reservations;
create policy "Admins can read reservations" on public.reservations for select to authenticated using(exists(select 1 from public.admin_users au where au.user_id=auth.uid()));

-- Compatibility columns for an earlier reservations table, if one already exists.
alter table public.reservations add column if not exists booking_code text;
alter table public.reservations add column if not exists tour_key text;
alter table public.reservations add column if not exists tour_name text;
alter table public.reservations add column if not exists rate_category text;
alter table public.reservations add column if not exists unit_price integer;
alter table public.reservations add column if not exists guests integer;
alter table public.reservations add column if not exists total_amount integer;
alter table public.reservations add column if not exists tour_date date;
alter table public.reservations add column if not exists customer_name text;
alter table public.reservations add column if not exists hotel text;
alter table public.reservations add column if not exists whatsapp text;
alter table public.reservations add column if not exists email text;
alter table public.reservations add column if not exists special_request text;
alter table public.reservations add column if not exists payment_status text default 'pending';
alter table public.reservations add column if not exists payment_provider text default 'PayMongo';
alter table public.reservations add column if not exists checkout_session_id text;
alter table public.reservations add column if not exists payment_intent_id text;
alter table public.reservations add column if not exists updated_at timestamptz default now();
alter table public.reservations add column if not exists contact text;
alter table public.reservations add column if not exists status text default 'pending';
create unique index if not exists reservations_booking_code_uidx on public.reservations(booking_code) where booking_code is not null;
create unique index if not exists reservations_checkout_session_uidx on public.reservations(checkout_session_id) where checkout_session_id is not null;
