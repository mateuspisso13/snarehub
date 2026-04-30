create extension if not exists pgcrypto;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  accent_color text not null default '#3b82f6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  title text,
  status text not null default 'draft',
  share_token text not null unique default replace(gen_random_uuid()::text,'-',''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, year, month)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  position int not null default 0,
  date_label text,
  day_label text,
  theme text,
  format text,
  channels text[] not null default '{}',
  strategic_pillar text,
  intention_pillar text,
  disclaimer text,
  visual_suggestion text,
  art_headline text,
  art_subtitle text,
  carousel_content jsonb not null default '[]'::jsonb,
  video_script text,
  ig_fb_caption text,
  linkedin_caption text,
  hashtags text,
  approval_status text not null default 'pending',
  client_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_plan_id_position_idx on public.posts(plan_id, position);
create index plans_client_id_idx on public.plans(client_id);

-- Open access (single-user app + public share via token).
alter table public.clients enable row level security;
alter table public.plans   enable row level security;
alter table public.posts   enable row level security;

create policy "open_all_clients" on public.clients for all using (true) with check (true);
create policy "open_all_plans"   on public.plans   for all using (true) with check (true);
create policy "open_all_posts"   on public.posts   for all using (true) with check (true);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_clients_updated before update on public.clients for each row execute function public.set_updated_at();
create trigger trg_plans_updated   before update on public.plans   for each row execute function public.set_updated_at();
create trigger trg_posts_updated   before update on public.posts   for each row execute function public.set_updated_at();
