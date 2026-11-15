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
