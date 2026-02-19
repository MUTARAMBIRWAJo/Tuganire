-- Visitor & article view tracking schema

-- Device type enum (create only if it does not exist)
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'device_type_enum'
      and n.nspname = 'public'
  ) then
    create type public.device_type_enum as enum ('desktop','tablet','mobile','other');
  end if;
end$$;

-- Visitors table (one per browser/device)
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  first_ip inet,
  last_ip inet,
  first_user_agent text,
  last_user_agent text,
  first_referrer text,
  last_referrer text,
  first_device_type device_type_enum,
  last_device_type device_type_enum,
  first_browser text,
  last_browser text,
  first_os text,
  last_os text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_visitors_first_seen_at on public.visitors(first_seen_at);
create index if not exists idx_visitors_last_seen_at on public.visitors(last_seen_at);
create index if not exists idx_visitors_email on public.visitors(email);

drop trigger if exists set_visitors_updated_at on public.visitors;
create trigger set_visitors_updated_at
before update on public.visitors
for each row execute function public.handle_updated_at();

-- Sessions table (logical browsing sessions)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  session_token text not null unique,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  ip inet,
  user_agent text,
  device_type device_type_enum,
  browser text,
  os text,
  referrer text,
  landing_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sessions_visitor_id_started_at
  on public.sessions(visitor_id, started_at);

drop trigger if exists set_sessions_updated_at on public.sessions;
create trigger set_sessions_updated_at
before update on public.sessions
for each row execute function public.handle_updated_at();

-- Article views table (detailed per-view analytics)
create table if not exists public.article_views_detailed (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  article_id uuid not null references public.articles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  time_spent_seconds integer,
  device_type device_type_enum,
  browser text,
  os text,
  ip inet,
  referrer text,
  path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_article_views_detailed_article_id
  on public.article_views_detailed(article_id);

create index if not exists idx_article_views_detailed_visitor_id
  on public.article_views_detailed(visitor_id);

create index if not exists idx_article_views_detailed_started_at
  on public.article_views_detailed(started_at);

create index if not exists idx_article_views_detailed_article_visitor
  on public.article_views_detailed(article_id, visitor_id);

drop trigger if exists set_article_views_detailed_updated_at on public.article_views_detailed;
create trigger set_article_views_detailed_updated_at
before update on public.article_views_detailed
for each row execute function public.handle_updated_at();

-- Optional generic events table for future analytics
create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.visitors(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  event_type text not null,
  article_id uuid references public.articles(id) on delete cascade,
  event_timestamp timestamptz not null default now(),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tracking_events_visitor_id on public.tracking_events(visitor_id);
create index if not exists idx_tracking_events_session_id on public.tracking_events(session_id);
create index if not exists idx_tracking_events_event_type on public.tracking_events(event_type);
create index if not exists idx_tracking_events_article_id on public.tracking_events(article_id);
