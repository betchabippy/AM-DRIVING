-- Rally App — Supabase Schema
-- Run this in the Supabase SQL editor after creating your project

-- Enable PostGIS for geospatial queries (equidistant meetpoints, nearby drives)
create extension if not exists postgis;

-- ─── Users ───────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  name        text not null,
  location    text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by all members" on public.profiles for select using (true);
create policy "Users can update own profile"         on public.profiles for update using (auth.uid() = id);

-- ─── Cars ────────────────────────────────────────────────────────────────────
create table public.cars (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles on delete cascade not null,
  make        text not null,
  model       text not null,
  year        int  not null,
  color       text,
  color_hex   text,
  spec        text,
  nickname    text,
  club_name   text,
  club_badge  text default 'none' check (club_badge in ('none','self-declared','verified')),
  is_primary  boolean default false,
  created_at  timestamptz default now()
);
alter table public.cars enable row level security;
create policy "Cars viewable by all"       on public.cars for select using (true);
create policy "Users manage own cars"      on public.cars for all    using (auth.uid() = user_id);

-- ─── Routes ──────────────────────────────────────────────────────────────────
create table public.routes (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  description   text,
  states        text[] not null,
  miles         int,
  duration_mins int,
  character     text[],
  rating        numeric(3,2) default 0,
  drive_count   int default 0,
  -- GeoJSON LineString for the route path
  path          geography(linestring, 4326),
  created_by    uuid references public.profiles,
  created_at    timestamptz default now()
);
alter table public.routes enable row level security;
create policy "Routes viewable by all" on public.routes for select using (true);

-- ─── Drives ──────────────────────────────────────────────────────────────────
create table public.drives (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  type            text not null check (type in ('loop','destination','equidistant','multiday')),
  character       text,
  visibility      text not null default 'open' check (visibility in ('private','club','open')),
  drive_date      date not null,
  depart_time     time not null,
  meeting_point   text,
  -- PostGIS point for meeting location
  meeting_coords  geography(point, 4326),
  destination     text,
  route_id        uuid references public.routes,
  states          text[],
  club_name       text,
  organizer_id    uuid references public.profiles not null,
  max_spots       int,
  description     text,
  created_at      timestamptz default now()
);
alter table public.drives enable row level security;
create policy "Open drives viewable by all"   on public.drives for select using (visibility = 'open' or organizer_id = auth.uid());
create policy "Organizers manage own drives"  on public.drives for all    using (auth.uid() = organizer_id);

-- ─── RSVPs ───────────────────────────────────────────────────────────────────
create table public.rsvps (
  id          uuid default gen_random_uuid() primary key,
  drive_id    uuid references public.drives on delete cascade not null,
  user_id     uuid references public.profiles not null,
  car_id      uuid references public.cars,
  status      text not null default 'pending' check (status in ('going','maybe','declined','pending')),
  note        text,
  created_at  timestamptz default now(),
  unique (drive_id, user_id)
);
alter table public.rsvps enable row level security;
create policy "RSVPs viewable by drive members" on public.rsvps for select using (true);
create policy "Users manage own RSVPs"          on public.rsvps for all    using (auth.uid() = user_id);

-- ─── Club memberships ────────────────────────────────────────────────────────
create table public.club_memberships (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles on delete cascade not null,
  club_slug    text not null,
  badge        text default 'self-declared' check (badge in ('self-declared','verified')),
  proof_url    text,  -- uploaded membership card/screenshot
  verified_at  timestamptz,
  created_at   timestamptz default now(),
  unique (user_id, club_slug)
);
alter table public.club_memberships enable row level security;
create policy "Memberships viewable by all"  on public.club_memberships for select using (true);
create policy "Users manage own memberships" on public.club_memberships for all    using (auth.uid() = user_id);

-- ─── Route ratings ───────────────────────────────────────────────────────────
create table public.route_ratings (
  id          uuid default gen_random_uuid() primary key,
  route_id    uuid references public.routes on delete cascade not null,
  user_id     uuid references public.profiles not null,
  rating      int not null check (rating between 1 and 5),
  note        text,
  created_at  timestamptz default now(),
  unique (route_id, user_id)
);
alter table public.route_ratings enable row level security;
create policy "Ratings viewable by all"  on public.route_ratings for select using (true);
create policy "Users manage own ratings" on public.route_ratings for all    using (auth.uid() = user_id);

-- ─── Useful views ────────────────────────────────────────────────────────────

-- Drive with organizer name and RSVP counts
create view public.drives_with_stats as
  select
    d.*,
    p.name as organizer_name,
    count(r.id) filter (where r.status = 'going')  as going_count,
    count(r.id) filter (where r.status = 'maybe')  as maybe_count
  from public.drives d
  join public.profiles p on p.id = d.organizer_id
  left join public.rsvps r on r.drive_id = d.id
  group by d.id, p.name;

-- Miles driven per user per club (for leaderboard)
create view public.club_leaderboard as
  select
    cm.club_slug,
    cm.user_id,
    p.name,
    coalesce(sum(ro.miles), 0) as total_miles,
    count(distinct rsvp.drive_id)   as total_drives
  from public.club_memberships cm
  join public.profiles p on p.id = cm.user_id
  left join public.rsvps rsvp on rsvp.user_id = cm.user_id and rsvp.status = 'going'
  left join public.drives dr   on dr.id = rsvp.drive_id and dr.club_name is not null
  left join public.routes ro   on ro.id = dr.route_id
  group by cm.club_slug, cm.user_id, p.name
  order by total_miles desc;

-- ─── Functions ───────────────────────────────────────────────────────────────

-- Find nearby drives within N miles of a point
create or replace function public.nearby_drives(
  lat float, lng float, radius_miles float default 50
)
returns setof public.drives_with_stats as $$
  select * from public.drives_with_stats d
  where st_dwithin(
    d.meeting_coords,
    st_point(lng, lat)::geography,
    radius_miles * 1609.34  -- convert miles to meters
  )
  and d.drive_date >= current_date
  order by d.drive_date;
$$ language sql stable;
