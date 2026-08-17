-- ============================================================================
--  DROP the `contacts` table — Supabase is no longer part of the delivery path
-- ============================================================================
--
--  Context: the n8n workflow now fans a lead out to Telegram + Google Sheets.
--  Supabase was the original third branch; it has been replaced, and the site
--  itself has never had a Supabase client (verified: no NEXT_PUBLIC_SUPABASE_*
--  vars, no @supabase/* import anywhere in src/).
--
--  Decision: drop rather than keep dormant. A table with no writer and no
--  reader is pure ongoing risk — it stays reachable through PostgREST to the
--  `anon` role at the network layer (confirmed earlier: the endpoint returns
--  200 rather than 404), so its safety depends entirely on RLS never being
--  loosened by a future migration, a dashboard misclick, or a new
--  collaborator who doesn't know the history. Deleting it removes that
--  surface entirely instead of asking it to be babysat indefinitely.
--
--  Run this in the Supabase SQL Editor. Safe to run even if the table (or
--  its policies) were already partially cleaned up — every statement is
--  conditional.
--
--  Paste, run, and the final SELECT confirms the table is gone.
-- ============================================================================

drop table if exists public.contacts cascade;

-- Verification — should return zero rows.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'contacts';
