-- ============================================================
-- T-WMS – training_requests V2 migration
-- Adds the new spec columns introduced in PR #2 (Two-Flow TNA).
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- It is safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

ALTER TABLE training_requests
  ADD COLUMN IF NOT EXISTS employee_grade    TEXT,
  ADD COLUMN IF NOT EXISTS other_competency  TEXT,
  ADD COLUMN IF NOT EXISTS training_details  TEXT,
  ADD COLUMN IF NOT EXISTS provider          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS course_weblink    TEXT,
  ADD COLUMN IF NOT EXISTS training_method   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS venue_location    TEXT NOT NULL DEFAULT '';

-- Optional one-shot back-fill so legacy rows keep working in the new UI:
--   institute_id → provider, venue_type → venue_location
UPDATE training_requests
   SET provider       = COALESCE(NULLIF(provider, ''), institute_id, '')
 WHERE provider IS NULL OR provider = '';

UPDATE training_requests
   SET venue_location = COALESCE(NULLIF(venue_location, ''), venue_type, '')
 WHERE venue_location IS NULL OR venue_location = '';

-- Relax the legacy NOT NULL constraints – the new flow doesn't write to them
-- directly, the row mapper now mirrors values across (provider ↔ institute_id,
-- venue_location ↔ venue_type) so they stay populated, but you can keep these
-- ALTERs as a safety net.
ALTER TABLE training_requests
  ALTER COLUMN institute_id DROP NOT NULL,
  ALTER COLUMN venue_type   DROP NOT NULL;
