-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'pro_reservoir')),
  updated_at        timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "users can read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- WATER SOURCES
-- =============================================
create table public.water_sources (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  ec          numeric not null default 0,
  ph          numeric not null default 7,
  ca_ppm      numeric not null default 0,
  mg_ppm      numeric not null default 0,
  na_ppm      numeric not null default 0,
  cl_ppm      numeric not null default 0,
  s_ppm       numeric not null default 0,
  k_ppm       numeric not null default 0,
  n_ppm       numeric not null default 0,
  alkalinity  numeric not null default 0,
  created_at  timestamptz default now()
);
alter table public.water_sources enable row level security;
create policy "users crud own water_sources" on public.water_sources
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================
-- SYSTEMS
-- =============================================
create table public.systems (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  type                text not null check (type in ('DWC','NFT','Drip','Ebb & Flow')),
  reservoir_l         numeric not null,
  crop                text not null default '',
  crop_target_id      text not null default '',
  stage               text not null default '',
  water_source_id     uuid references public.water_sources(id) on delete set null,
  active_recipe_id    uuid,
  ec_target           numeric not null,
  ph_target_low       numeric not null,
  ph_target_high      numeric not null,
  -- Denormalized last-reading cache, updated by trigger on log_entries insert
  last_ec             numeric,
  last_ph             numeric,
  last_temp_c         numeric,
  last_do_mg_l        numeric,
  last_reservoir_pct  numeric,
  last_at             timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
alter table public.systems enable row level security;
create policy "users crud own systems" on public.systems
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger: keep systems.last_* in sync with newest log entry
create or replace function public.update_system_last_reading()
returns trigger language plpgsql security definer as $$
begin
  update public.systems
  set
    last_ec            = new.ec,
    last_ph            = new.ph,
    last_temp_c        = new.temp_c,
    last_do_mg_l       = new.do_mg_l,
    last_reservoir_pct = coalesce(new.reservoir_pct, last_reservoir_pct),
    last_at            = new.logged_at,
    updated_at         = now()
  where id = new.system_id;
  return new;
end;
$$;

-- =============================================
-- FERTILIZERS (user-custom; shared library stays in code)
-- =============================================
create table public.fertilizers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  formula     text,
  hydration   text,
  label       text,
  frac_n      numeric not null default 0,
  frac_p      numeric not null default 0,
  frac_k      numeric not null default 0,
  frac_ca     numeric not null default 0,
  frac_mg     numeric not null default 0,
  frac_s      numeric not null default 0,
  frac_cl     numeric not null default 0,
  created_at  timestamptz default now()
);
alter table public.fertilizers enable row level security;
create policy "users crud own fertilizers" on public.fertilizers
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================
-- LOG ENTRIES
-- =============================================
create table public.log_entries (
  id              uuid primary key default gen_random_uuid(),
  system_id       uuid not null references public.systems(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  logged_at       timestamptz not null default now(),
  ec              numeric not null,
  ph              numeric not null,
  temp_c          numeric,
  do_mg_l         numeric,
  top_off_l       numeric not null default 0,
  reservoir_pct   numeric,
  notes           text
);
alter table public.log_entries enable row level security;
create policy "users crud own log_entries" on public.log_entries
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger on_log_entry_insert
  after insert on public.log_entries
  for each row execute procedure public.update_system_last_reading();

-- =============================================
-- HARVEST ENTRIES
-- =============================================
create table public.harvest_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  system_id         uuid references public.systems(id) on delete set null,
  harvested_at      date not null,
  crop              text not null,
  fresh_kg          numeric not null,
  units             integer,
  grade_a_fraction  numeric check (grade_a_fraction between 0 and 1),
  notes             text,
  created_at        timestamptz default now()
);
alter table public.harvest_entries enable row level security;
create policy "users crud own harvest_entries" on public.harvest_entries
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
