-- ============================================================================
--  contacts — schema + lockdown for the portfolio contact form
-- ============================================================================
--
--  SUPERSEDED: the n8n workflow moved from Supabase to Google Sheets for its
--  data-storage branch. If that migration is confirmed, run
--  `supabase-contacts-drop.sql` instead of this file — dropping the table
--  removes the standing risk outright rather than asking RLS to hold forever.
--  Kept here only as a record of the schema this table had while it was live.
--
--  Run this whole file once in the Supabase SQL Editor (Run / Ctrl+Enter).
--  It is idempotent: running it twice changes nothing the second time, and it
--  never drops a column or deletes a row.
--
--  What it does:
--    1. Adds the columns the site actually sends, including `locale`.
--    2. Makes `subject` optional, because the form has no subject field and
--       a NOT NULL column would make every n8n insert fail.
--    3. Turns RLS on and removes public access, so the browser-exposed
--       publishable key cannot read or write this table.
--
--  ⚠️ After running this, the n8n Supabase node must authenticate with the
--     SERVICE ROLE / secret key, not the publishable one. The service role
--     bypasses RLS by design; the publishable key will now be refused.
-- ============================================================================


-- ── 1. Columns the site sends ───────────────────────────────────────────────
-- Contract fields. `name`, `email` and `message` are assumed to exist already;
-- these statements add anything missing without touching what is there.
alter table public.contacts add column if not exists name          text;
alter table public.contacts add column if not exists email         text;
alter table public.contacts add column if not exists message       text;

-- The field that was missing: which language the visitor was reading.
alter table public.contacts add column if not exists locale        text;

-- ISO 8601 timestamp sent as `submitted_at`. timestamptz keeps the offset.
alter table public.contacts add column if not exists submitted_at  timestamptz default now();

-- Extras the form also collects. Useful for qualifying a lead; safe to ignore.
alter table public.contacts add column if not exists company       text;
alter table public.contacts add column if not exists budget        text;


-- ── 2. `subject` — the form does not send one ───────────────────────────────
-- The contact form has no subject field, so nothing will ever populate this.
-- Dropping the NOT NULL constraint (if any) stops it from failing inserts.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'contacts' and column_name = 'subject'
  ) then
    alter table public.contacts alter column subject drop not null;
  end if;
end $$;

-- Optional, and destructive — uncomment only if you want the column gone:
-- alter table public.contacts drop column if exists subject;


-- ── 3. Lock the table down ──────────────────────────────────────────────────
-- The table is reachable through PostgREST with the publishable key, which is
-- embedded in the browser. RLS is the only thing keeping submitted leads
-- private, so enable it and grant the public roles nothing.
alter table public.contacts enable row level security;
alter table public.contacts force row level security;

revoke all on public.contacts from anon;
revoke all on public.contacts from authenticated;

-- No policies are created for `anon`, so with RLS on the public key can
-- neither read nor insert. n8n writes with the service role, which bypasses
-- RLS and therefore needs no policy.


-- ── 4. Verify ───────────────────────────────────────────────────────────────
-- Expect: rowsecurity = true
select relname as table, relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class where oid = 'public.contacts'::regclass;

-- Expect: no rows granted to anon / authenticated
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'contacts'
order by grantee, privilege_type;

-- Expect: any policies listed here are intentional ones you created
select policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename = 'contacts';

-- Expect: the full column list, including locale and submitted_at
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'contacts'
order by ordinal_position;
