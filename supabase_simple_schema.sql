-- ============================================================
-- T-WMS  –  Simple training_requests table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop table if you want a clean start (comment out if not needed)
-- DROP TABLE IF EXISTS training_requests;

CREATE TABLE IF NOT EXISTS training_requests (
  id                  TEXT        PRIMARY KEY,
  employee_id         TEXT        NOT NULL,
  employee_name       TEXT        NOT NULL,
  employee_department TEXT,
  nominator_id        TEXT        NOT NULL,
  nominator_name      TEXT        NOT NULL,
  competency          TEXT        NOT NULL DEFAULT '',
  quarter             TEXT        NOT NULL DEFAULT '',
  course_title        TEXT        NOT NULL DEFAULT '',
  custom_course       TEXT,
  institute_id        TEXT        NOT NULL DEFAULT '',
  start_date          TEXT        NOT NULL DEFAULT '',
  end_date            TEXT        NOT NULL DEFAULT '',
  duration_days       INTEGER     NOT NULL DEFAULT 0,
  basic_cost          NUMERIC     NOT NULL DEFAULT 0,
  currency            TEXT        NOT NULL DEFAULT 'USD',
  usd_cost            NUMERIC     NOT NULL DEFAULT 0,
  venue_type          TEXT        NOT NULL DEFAULT '',
  city                TEXT        NOT NULL DEFAULT '',
  status              TEXT        NOT NULL DEFAULT 'PendingAI',
  comments            TEXT[]      NOT NULL DEFAULT '{}',
  created_at          TEXT        NOT NULL DEFAULT ''
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Allow all authenticated (and anonymous) users to read and write.
-- Tighten these policies once you add real Supabase Auth users.

ALTER TABLE training_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT
CREATE POLICY "allow_select" ON training_requests
  FOR SELECT USING (true);

-- Allow anyone to INSERT
CREATE POLICY "allow_insert" ON training_requests
  FOR INSERT WITH CHECK (true);

-- Allow anyone to UPDATE
CREATE POLICY "allow_update" ON training_requests
  FOR UPDATE USING (true);

-- Allow anyone to DELETE
CREATE POLICY "allow_delete" ON training_requests
  FOR DELETE USING (true);

-- ── Optional: seed the same sample data as the mock data ──────────────────────
-- Remove the lines below if you want to start with an empty table.

INSERT INTO training_requests VALUES
  ('REQ-1042','E001','Ahmed Al-Saud','Information Technology','M001','Fahad Al-Qahtani','Software Engineering','Q2-2026','Advanced React Patterns',NULL,'I001','2026-06-10','2026-06-14',5,4000,'SAR',1080,'Virtual','Riyadh','PendingUnitHead',ARRAY['AI Auditor: Budget within limits. Quarter alignment OK. ✓'],'2026-04-20'),
  ('REQ-1043','E002','Sara Al-Otaibi','Business Intelligence','M001','Fahad Al-Qahtani','Data Analytics','Q2-2026','Data Science Bootcamp',NULL,'I001','2026-07-01','2026-07-21',21,8000,'USD',8000,'Onsite','Dubai','PendingTalentDev',ARRAY['AI Auditor: All checks passed. ✓','✅ Unit Head (Yousef Al-Mutairi): Approved.'],'2026-04-18'),
  ('REQ-1041','E003','Khalid Al-Harbi','Operations','M002','Noura Al-Dossary','Project Management','Q1-2026','Project Management Professional (PMP)',NULL,'I005','2026-05-15','2026-05-19',5,3500,'USD',3500,'Hybrid','Jeddah','Approved',ARRAY['AI Auditor: All checks passed. ✓','✅ Unit Head: Approved.','✅ Talent Dev: Final sign-off.'],'2026-04-10'),
  ('REQ-1044','E001','Ahmed Al-Saud','Information Technology','M001','Fahad Al-Qahtani','Software Engineering','Q2-2026','Cybersecurity Fundamentals',NULL,'I002','2026-05-05','2026-05-06',2,500,'USD',500,'Virtual','Riyadh','PendingEmployee',ARRAY[]::TEXT[],'2026-04-28'),
  ('REQ-1045','E004','Reem Al-Shammari','Finance','M002','Noura Al-Dossary','Finance','Q3-2026','Financial Modelling & Analysis',NULL,'I006','2026-08-10','2026-08-14',5,5200,'USD',5200,'Onsite','Riyadh','Approved',ARRAY['AI Auditor: All checks passed. ✓','✅ Unit Head: Approved.','✅ Talent Dev: Final sign-off.'],'2026-03-15'),
  ('REQ-1046','E002','Sara Al-Otaibi','Business Intelligence','M001','Fahad Al-Qahtani','Leadership','Q1-2026','Leadership Excellence',NULL,'I004','2026-03-10','2026-03-12',3,6000,'SAR',1620,'Onsite','Riyadh','Rejected',ARRAY['AI Auditor: All checks passed. ✓','❌ Unit Head: Budget exceeds department allocation.'],'2026-02-20')
ON CONFLICT (id) DO NOTHING;
