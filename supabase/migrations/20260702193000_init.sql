-- ═══════════════════════════════════════════════════════════════════════
--  Gowtham's Wedding — database schema + security
--  Run this in Supabase → SQL Editor (once). Safe to re-run.
--
--  Security model: "Public view, login to edit"
--    • anyone (anon) can SELECT (read) everything
--    • only authenticated (logged-in family) can INSERT / UPDATE / DELETE
-- ═══════════════════════════════════════════════════════════════════════

-- ── EVENTS (wedding timeline) ──────────────────────────────────────────
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  starts_at  timestamptz not null,
  venue      text,
  notes      text,
  created_at timestamptz not null default now()
);

-- ── CATERING MENU ──────────────────────────────────────────────────────
create table if not exists public.catering_menu (
  id         uuid primary key default gen_random_uuid(),
  dish       text not null,
  course     text not null default 'main',   -- welcome | starters | main | sweets | live
  vendor     text,
  notes      text,
  status     text not null default 'proposed', -- proposed | confirmed
  created_at timestamptz not null default now()
);

-- ── SUGGESTIONS / IDEAS BOARD ──────────────────────────────────────────
create table if not exists public.suggestions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  category    text not null default 'other',  -- menu | decor | logistics | other
  author_name text,
  author_id   uuid references auth.users(id) on delete set null,
  voters      uuid[] not null default '{}',   -- user ids who ❤️'d it
  created_at  timestamptz not null default now()
);

-- ── TASKS / SHOPPING CHECKLIST ─────────────────────────────────────────
create table if not exists public.tasks (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  assignee   text,
  due_date   date,
  status     text not null default 'todo',    -- todo | doing | done
  created_at timestamptz not null default now()
);

-- ── PHOTOS (metadata only — files live in Cloudflare R2) ───────────────
create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,          -- public R2 url
  album       text not null default 'Misc',
  caption     text,
  uploaded_by text,
  uploader_id uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array['events','catering_menu','suggestions','tasks','photos']
  loop
    execute format('alter table public.%I enable row level security;', t);

    -- anyone can read
    execute format($p$
      drop policy if exists "public read %1$s" on public.%1$I;
      create policy "public read %1$s" on public.%1$I
        for select using (true);
    $p$, t);

    -- logged-in family can insert
    execute format($p$
      drop policy if exists "auth insert %1$s" on public.%1$I;
      create policy "auth insert %1$s" on public.%1$I
        for insert to authenticated with check (true);
    $p$, t);

    -- logged-in family can update
    execute format($p$
      drop policy if exists "auth update %1$s" on public.%1$I;
      create policy "auth update %1$s" on public.%1$I
        for update to authenticated using (true) with check (true);
    $p$, t);

    -- logged-in family can delete
    execute format($p$
      drop policy if exists "auth delete %1$s" on public.%1$I;
      create policy "auth delete %1$s" on public.%1$I
        for delete to authenticated using (true);
    $p$, t);
  end loop;
end $$;

-- ── Realtime: broadcast changes so everyone sees live updates ──────────
do $$
declare t text;
begin
  foreach t in array array['events','catering_menu','suggestions','tasks','photos']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
