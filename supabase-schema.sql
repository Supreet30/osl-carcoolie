-- =====================================================================
-- OSL Car Coolie — Supabase schema
-- =====================================================================
-- Covers the /services/b2c estimate → book → my-bookings → payment flow,
-- plus everything the admin panel needs to edit (route pricing, add-ons,
-- coupons, document verification, final quotes) and a status history the
-- customer-facing "My Bookings" page reads from.
--
-- This is the real schema that app/services/b2c/lib/bookingStore.js's
-- localStorage functions (saveEstimate, getEstimate, createBooking,
-- getBooking, getBookings, updateBooking) are a temporary stand-in for.
-- Swapping that module's internals for supabase-js calls against these
-- tables (same function signatures) is the intended migration path — see
-- the comment at the top of that file.
--
-- Run this in the Supabase SQL editor. Safe to re-run in full any time this
-- file changes — every table/column/trigger/policy is guarded with
-- IF NOT EXISTS / DROP ... IF EXISTS / CREATE OR REPLACE, so re-running
-- after a pull is how you pick up schema changes on an existing project.
-- =====================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

do $$ begin
  create type booking_status as enum (
    'docs_review',   -- matches BOOKING_STATUS.DOCS_REVIEW
    'quote_sent',    -- matches BOOKING_STATUS.QUOTE_SENT
    'advance_paid',  -- matches BOOKING_STATUS.ADVANCE_PAID
    'confirmed',     -- matches BOOKING_STATUS.CONFIRMED
    'in_transit',    -- matches BOOKING_STATUS.IN_TRANSIT
    'delivered'      -- matches BOOKING_STATUS.DELIVERED
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type leg_method as enum ('self', 'driver'); -- self drop-off/pickup vs CarCoolie driver
exception when duplicate_object then null; end $$;

do $$ begin
  create type leg_type as enum ('pickup', 'dropoff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_type as enum ('rc', 'license', 'pan', 'aadhaar', 'insurance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_status as enum ('pending', 'uploaded', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type coupon_type as enum ('percent', 'flat');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_type as enum ('advance', 'balance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'success', 'failed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- updated_at helper trigger
-- ---------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- Admins (staff who use the separate admin panel app)
-- ---------------------------------------------------------------------

create table if not exists admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'admin', -- 'admin' | 'staff'
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Customers (the person booking, from the b2c site's own auth)
-- ---------------------------------------------------------------------

create table if not exists customers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Cities — the 4 demo cities today (Delhi, Chandigarh, Mumbai,
-- Bangalore), extensible by the admin panel later.
-- ---------------------------------------------------------------------

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  pincode_prefixes text[] not null default '{}', -- e.g. {'11'} for Delhi, used to auto-detect city from a PIN
  is_active boolean not null default true
);

insert into cities (name, pincode_prefixes) values
  ('Delhi', '{11}'),
  ('Chandigarh', '{16}'),
  ('Mumbai', '{40}'),
  ('Bangalore', '{56}')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- Routes — directional A→B and B→A pricing, independently editable by
-- the admin ("edit A to B or B to A prices") from the Route Pricing page.
-- No seed data — every row is entered by an admin.
-- ---------------------------------------------------------------------

create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  from_city_id uuid not null references cities (id) on delete cascade,
  to_city_id uuid not null references cities (id) on delete cascade,
  distance_km integer not null,
  base_price numeric(10, 2) not null,
  -- Minimum transit days for this direction — the booking form's drop-off
  -- date picker disables every date from (pickup + 1) through
  -- (pickup + min_days) so the earliest pickable drop-off is
  -- pickup + min_days + 1. Directional (A→B can differ from B→A) since
  -- backhaul/forward legs can have different transit times, same reasoning
  -- as base_price already being set per-direction.
  min_days integer not null default 1,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (from_city_id, to_city_id),
  check (from_city_id <> to_city_id),
  check (min_days >= 0)
);

-- Idempotent add for installs that ran this file before min_days existed.
alter table routes add column if not exists min_days integer not null default 1;

drop trigger if exists routes_set_updated_at on routes;
create trigger routes_set_updated_at before update on routes
  for each row execute function set_updated_at();

-- No seed data here on purpose — route prices are entered from the admin
-- panel's Route Pricing page now (pick two cities, set A→B/B→A together).
-- The demo seed routes that used to be inserted here were deleted from the
-- live project; leaving this as a no-op avoids `on conflict do nothing`
-- silently re-inserting them next time this file is re-run.

-- ---------------------------------------------------------------------
-- Vehicle types — captured on every booking; not price-affecting today
-- (matches the current frontend dummy model) but broken out into its
-- own admin-editable table so a per-type multiplier can be added later
-- without a schema change.
-- ---------------------------------------------------------------------

create table if not exists vehicle_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, -- 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury Sedan' | 'Luxury SUV' | 'Sports' ...
  -- Flat rupee surcharge added on top of the route price (negative for a
  -- discount, e.g. Hatchback). Matches the frontend's VEHICLE_TYPES
  -- fallback in pricing.js.
  price_addon numeric(10, 2) not null default 0,
  is_active boolean not null default true
);

-- Renames the column in place for a project that already has this table
-- from before it switched from a percentage multiplier to a flat amount —
-- a no-op once price_addon exists.
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'vehicle_types' and column_name = 'price_multiplier'
  ) then
    alter table vehicle_types rename column price_multiplier to price_addon;
    alter table vehicle_types alter column price_addon type numeric(10, 2);
    alter table vehicle_types alter column price_addon set default 0;
  end if;
end $$;

-- `do update` (not `do nothing`) so re-running this file after an amount
-- changes here actually updates it on an existing project.
insert into vehicle_types (name, price_addon) values
  ('Hatchback', -1000),
  ('Sedan', 0),
  ('SUV', 2500),
  ('Luxury Sedan', 6000),
  ('Luxury SUV', 9000),
  ('Sports', 12000)
on conflict (name) do update set price_addon = excluded.price_addon;

-- Superseded by 'Luxury Sedan' / 'Luxury SUV' above — deactivated rather
-- than deleted so any past booking referencing it by id still resolves.
update vehicle_types set is_active = false where name = 'Luxury';

-- ---------------------------------------------------------------------
-- Add-on services — admin-manageable ("add add-on services").
-- ---------------------------------------------------------------------

create table if not exists add_on_services (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- stable slug used by the frontend, e.g. 'insurance'
  label text not null,
  subtitle text,
  price numeric(10, 2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into add_on_services (key, label, subtitle, price) values
  ('guaranteedDate', 'Guaranteed Date', 'Priority scheduling', 1500),
  ('insurance', 'Insurance', 'Additional coverage', 800),
  ('carWash', 'Car Wash', 'Professional cleaning', 700)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Coupons — admin-manageable ("coupons applicable"). WELCOME5 = 5% off,
-- matching the frontend today.
-- ---------------------------------------------------------------------

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null default 'percent',
  value numeric(10, 2) not null, -- percent (0-100) or flat rupee amount, per `type`
  label text,
  is_active boolean not null default true,
  usage_limit integer, -- null = unlimited
  times_used integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

insert into coupons (code, type, value, label) values
  ('WELCOME5', 'percent', 5, '5% off')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- Bookings — the core record. Human-friendly id like the frontend's
-- `CC-XXXXXXXX` is kept as its own column so URLs/UI don't need to
-- change; the primary key is still a uuid.
-- ---------------------------------------------------------------------

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default ('CC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_id uuid references customers (id) on delete set null,
  status booking_status not null default 'docs_review',

  -- Snapshot of the estimate at booking time (see computeEstimate() in
  -- pricing.js) — kept denormalized on the booking so it still reads
  -- correctly even if routes/add-ons/coupons change later.
  from_city_id uuid references cities (id),
  to_city_id uuid references cities (id),
  vehicle_type_id uuid references vehicle_types (id),
  -- Free-text copy of whatever the customer picked, even if it doesn't
  -- match a seeded vehicle_types row (vehicle_type_id is left null then).
  vehicle_type_label text,
  distance_km integer,
  route_price numeric(10, 2),
  -- Flat surcharge (or discount, negative) from vehicle_types.price_addon
  -- applied on top of route_price — see computeEstimate() in pricing.js.
  vehicle_surcharge numeric(10, 2) not null default 0,
  service_charge numeric(10, 2),
  addons_total numeric(10, 2) not null default 0,
  gst_amount numeric(10, 2),
  subtotal numeric(10, 2),
  coupon_code text references coupons (code),
  discount_amount numeric(10, 2) not null default 0,
  estimated_total numeric(10, 2),
  pickup_pin text,
  destination_pin text,

  -- Set by the admin after document review — the customer then pays a
  -- 30% advance against this.
  final_quote numeric(10, 2),
  advance_paid numeric(10, 2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists bookings_set_updated_at on bookings;
create trigger bookings_set_updated_at before update on bookings
  for each row execute function set_updated_at();

-- Patches columns onto an already-existing `bookings` table from an
-- earlier run of this file (e.g. before vehicle_type_label was added) —
-- `create table if not exists` above does nothing once the table already
-- exists, so new columns need to be added explicitly here too. Safe to
-- re-run: no-ops once the column is present.
alter table bookings add column if not exists vehicle_type_label text;
alter table bookings add column if not exists vehicle_surcharge numeric(10, 2) not null default 0;

create index if not exists bookings_customer_id_idx on bookings (customer_id);
create index if not exists bookings_status_idx on bookings (status);

-- Add-ons actually selected on a given booking, priced at time of
-- booking (so later admin price edits don't rewrite past bookings).
create table if not exists booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  add_on_service_id uuid not null references add_on_services (id),
  price_at_booking numeric(10, 2) not null,
  unique (booking_id, add_on_service_id)
);

-- Pickup + drop-off legs (sections 1/2/4/5 of the booking form). One row
-- per leg per booking, distinguished by `type`.
create table if not exists booking_addresses (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  type leg_type not null,
  full_name text,
  phone text,
  house text,
  street text,
  landmark text,
  city text,
  pin text,
  method leg_method not null default 'driver',
  -- "Current Location" / "Select on Map" capture:
  captured_address text,
  captured_lat double precision,
  captured_lng double precision,
  slot_date date,
  time_slot text,
  unique (booking_id, type)
);

-- Vehicle documents (section 3). One row per document type per booking;
-- `status` is what the admin panel's "docs verification" screen edits.
create table if not exists booking_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  doc_type document_type not null,
  file_name text,
  file_size_mb numeric(6, 2),
  file_url text, -- Supabase Storage object path once real uploads are wired up
  status document_status not null default 'pending',
  verified_by uuid references admin_users (id),
  verified_at timestamptz,
  rejection_reason text,
  uploaded_at timestamptz not null default now(),
  unique (booking_id, doc_type)
);

-- 30% advance + remaining balance payments.
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  type payment_type not null,
  amount numeric(10, 2) not null,
  status payment_status not null default 'pending',
  method text, -- 'card' | 'upi' | ... — free text for the demo gateway
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Status history / audit trail — what "show status to user" reads from,
-- and what the admin panel writes to on every status change (docs
-- reviewed, final quote sent, admin confirms, etc). STATUS_STEPS in
-- bookingStore.js is the ordered list this maps onto.
create table if not exists booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  status booking_status not null,
  note text,
  changed_by uuid references admin_users (id), -- null = system/customer action
  changed_at timestamptz not null default now()
);

-- Keep booking_status_history in sync automatically whenever a
-- booking's status changes, so the admin app doesn't have to remember
-- to write both.
-- security definer so this system-generated audit row always writes
-- regardless of which RLS policy the triggering insert/update ran under
-- (an anonymous customer's own insert included) — customers cannot invoke
-- this directly, it only ever runs as a trigger on `bookings`.
create or replace function log_booking_status_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') or (new.status is distinct from old.status) then
    insert into booking_status_history (booking_id, status, changed_by)
    values (new.id, new.status, null);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists bookings_log_status_change on bookings;
create trigger bookings_log_status_change
  after insert or update of status on bookings
  for each row execute function log_booking_status_change();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- Customers can only see/manage their own bookings and related rows;
-- anyone in admin_users can see/manage everything. Reference tables
-- (cities, routes, vehicle_types, add_on_services, coupons) are
-- publicly readable (needed to price an estimate before signing in)
-- but only admin-writable.

alter table customers enable row level security;
alter table admin_users enable row level security;
alter table cities enable row level security;
alter table routes enable row level security;
alter table vehicle_types enable row level security;
alter table add_on_services enable row level security;
alter table coupons enable row level security;
alter table bookings enable row level security;
alter table booking_addons enable row level security;
alter table booking_addresses enable row level security;
alter table booking_documents enable row level security;
alter table payments enable row level security;
alter table booking_status_history enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$ language sql stable security definer;

-- carcoolie-admin has no sign-in flow yet either — it also just uses the
-- anon key, so auth.uid() is null there too and is_admin() alone would
-- reject every admin write. Treat a fully unauthenticated (anon) request
-- as admin-equivalent for the specific admin-only actions the admin app
-- performs (route/add-on/coupon edits, document verification) — this is
-- intentionally permissive for this testing phase, same spirit as
-- `customer_id is null` above. Once the admin app has real Supabase Auth
-- sign-in, replace is_admin_or_anon() with is_admin() in those policies.
create or replace function is_admin_or_anon()
returns boolean as $$
  select is_admin() or auth.role() = 'anon';
$$ language sql stable security definer;

-- Every policy below is preceded by `drop policy if exists` so this whole
-- file stays safe to re-run after a policy definition changes (plain
-- `create policy` errors with "policy already exists" on a second run).

-- customers: self-serve own row
drop policy if exists "customers read own" on customers;
create policy "customers read own" on customers for select using (id = auth.uid() or is_admin());
drop policy if exists "customers update own" on customers;
create policy "customers update own" on customers for update using (id = auth.uid());
drop policy if exists "customers insert own" on customers;
create policy "customers insert own" on customers for insert with check (id = auth.uid());

-- admin_users: only admins can read the admin roster
drop policy if exists "admin_users admin only" on admin_users;
create policy "admin_users admin only" on admin_users for select using (is_admin());

-- public reference data: readable by anyone, writable by admins only
drop policy if exists "cities readable" on cities;
create policy "cities readable" on cities for select using (true);
drop policy if exists "cities admin write" on cities;
create policy "cities admin write" on cities for all using (is_admin_or_anon()) with check (is_admin_or_anon());

drop policy if exists "routes readable" on routes;
create policy "routes readable" on routes for select using (true);
drop policy if exists "routes admin write" on routes;
create policy "routes admin write" on routes for all using (is_admin_or_anon()) with check (is_admin_or_anon());

drop policy if exists "vehicle_types readable" on vehicle_types;
create policy "vehicle_types readable" on vehicle_types for select using (true);
drop policy if exists "vehicle_types admin write" on vehicle_types;
create policy "vehicle_types admin write" on vehicle_types for all using (is_admin_or_anon()) with check (is_admin_or_anon());

drop policy if exists "add_on_services readable" on add_on_services;
create policy "add_on_services readable" on add_on_services for select using (true);
drop policy if exists "add_on_services admin write" on add_on_services;
create policy "add_on_services admin write" on add_on_services for all using (is_admin_or_anon()) with check (is_admin_or_anon());

drop policy if exists "coupons readable" on coupons;
create policy "coupons readable" on coupons for select using (true);
drop policy if exists "coupons admin write" on coupons;
create policy "coupons admin write" on coupons for all using (is_admin_or_anon()) with check (is_admin_or_anon());

-- bookings + children: owner (customer) or admin. The customer-facing site
-- doesn't have Supabase Auth wired up yet (no sign-in gate on the booking
-- flow), so every booking is created with customer_id = null for now —
-- `customer_id is null` is included here so those anonymous bookings stay
-- readable/writable by the browser that made them. Tighten this to just
-- `customer_id = auth.uid()` once customer auth exists.
drop policy if exists "bookings owner read" on bookings;
create policy "bookings owner read" on bookings for select using (customer_id = auth.uid() or customer_id is null or is_admin());
drop policy if exists "bookings owner insert" on bookings;
create policy "bookings owner insert" on bookings for insert with check (customer_id = auth.uid() or customer_id is null or is_admin());
drop policy if exists "bookings owner update" on bookings;
create policy "bookings owner update" on bookings for update using (customer_id = auth.uid() or customer_id is null or is_admin());
drop policy if exists "bookings admin delete" on bookings;
create policy "bookings admin delete" on bookings for delete using (is_admin_or_anon());

drop policy if exists "booking_addons via booking" on booking_addons;
create policy "booking_addons via booking" on booking_addons for all using (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
) with check (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
);

drop policy if exists "booking_addresses via booking" on booking_addresses;
create policy "booking_addresses via booking" on booking_addresses for all using (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
) with check (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
);

-- documents: customer can insert/read own uploads, only admin can verify/reject
drop policy if exists "booking_documents owner read" on booking_documents;
create policy "booking_documents owner read" on booking_documents for select using (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
);
drop policy if exists "booking_documents owner insert" on booking_documents;
create policy "booking_documents owner insert" on booking_documents for insert with check (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
);
drop policy if exists "booking_documents admin verify" on booking_documents;
create policy "booking_documents admin verify" on booking_documents for update using (is_admin_or_anon());

drop policy if exists "payments via booking" on payments;
create policy "payments via booking" on payments for all using (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
) with check (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
);

drop policy if exists "booking_status_history via booking" on booking_status_history;
create policy "booking_status_history via booking" on booking_status_history for select using (
  exists (select 1 from bookings b where b.id = booking_id and (b.customer_id = auth.uid() or b.customer_id is null or is_admin()))
);
-- No customer-facing insert policy here on purpose — rows are written by
-- the log_booking_status_change() trigger above (security definer, so it
-- bypasses RLS), not directly by client code.
drop policy if exists "booking_status_history admin insert" on booking_status_history;
create policy "booking_status_history admin insert" on booking_status_history for insert with check (is_admin());

-- ---------------------------------------------------------------------
-- Storage — actual uploaded document files (booking_documents.file_url
-- stores the object path within this bucket). Kept private (not a public
-- bucket); the admin app reads files via short-lived signed URLs
-- (supabase.storage.from('booking-documents').createSignedUrl(path, ...)),
-- not direct public links.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('booking-documents', 'booking-documents', false)
on conflict (id) do nothing;

-- Not enabling RLS on storage.objects here on purpose — it's on by default
-- on every Supabase project already, and the table is owned by an internal
-- supabase_storage_admin role, so ALTER TABLE on it errors with "must be
-- owner of table objects" even from the SQL editor's postgres role. Policy
-- creation on it (below) is specifically granted and works fine.

-- Same "no real auth yet" reasoning as is_admin_or_anon() above: the
-- customer app has no auth to gate uploads with, and the admin app has no
-- auth to gate signed-URL reads with, so both sides use the anon key.
-- Tighten these (e.g. to the uploader's own booking, and to is_admin() for
-- reads) once real auth exists on both apps.
drop policy if exists "booking-documents anon upload" on storage.objects;
create policy "booking-documents anon upload" on storage.objects for insert
  with check (bucket_id = 'booking-documents');

drop policy if exists "booking-documents anon read" on storage.objects;
create policy "booking-documents anon read" on storage.objects for select
  using (bucket_id = 'booking-documents');

-- =====================================================================
-- End of schema.
-- =====================================================================
