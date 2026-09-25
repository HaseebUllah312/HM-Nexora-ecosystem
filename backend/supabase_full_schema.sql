/* =============================================================
   HM NEXORA — FULL SUPABASE SCHEMA (Run this in SQL Editor)
   Covers: Mobile App + Chrome Extension + Admin Panel
   ============================================================= */

-- ─────────────────────────────────────────────
-- 1. USERS (Student Profiles)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      text UNIQUE NOT NULL,
  display_name    text NOT NULL DEFAULT '',
  email           text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '',
  role            text NOT NULL DEFAULT 'student',
  subjects_json   text DEFAULT '[]',
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON public.users (student_id);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_all" ON public.users;
CREATE POLICY "users_all" ON public.users USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 2. FILES (Drive Vault Files per Subject)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.files (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code    text NOT NULL,
  title          text NOT NULL DEFAULT '',
  description    text DEFAULT '',
  type           text DEFAULT 'pdf',
  drive_file_id  text DEFAULT '',
  url            text DEFAULT '',
  preview_url    text DEFAULT '',
  download_url   text DEFAULT '',
  is_premium     boolean DEFAULT false,
  premium        boolean DEFAULT false,
  created_at     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_files_course_code ON public.files (course_code);
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "files_all" ON public.files;
CREATE POLICY "files_all" ON public.files USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 3. COMMUNITY MESSAGES (All 402 Subject Chat Rooms)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_messages (
  id           text PRIMARY KEY,
  channel      text NOT NULL DEFAULT 'GENERAL',
  course_code  text DEFAULT 'GENERAL',
  user_id      text DEFAULT '',
  student_id   text DEFAULT '',
  display_name text DEFAULT 'Student',
  user_email   text DEFAULT '',
  is_verified  boolean DEFAULT false,
  text         text NOT NULL,
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_channel ON public.community_messages (channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_course  ON public.community_messages (course_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_student ON public.community_messages (student_id);
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "community_all" ON public.community_messages;
CREATE POLICY "community_all" ON public.community_messages USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for instant cross-platform chat sync
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ─────────────────────────────────────────────
-- 4. USER SETTINGS (Admin Config, Room Locks, App Config)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id       text PRIMARY KEY,
  settings_json text DEFAULT '{}',
  updated_at    timestamptz DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_all" ON public.user_settings;
CREATE POLICY "settings_all" ON public.user_settings USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 5. MCQ BANK (All 402 VU Subjects)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mcq_bank (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code    text NOT NULL,
  question_text  text NOT NULL DEFAULT '',
  question       text DEFAULT '',
  option_a       text DEFAULT '',
  option_b       text DEFAULT '',
  option_c       text DEFAULT '',
  option_d       text DEFAULT '',
  correct_option text DEFAULT 'A',
  explanation    text DEFAULT '',
  created_at     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mcq_course ON public.mcq_bank (course_code);
ALTER TABLE public.mcq_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mcq_all" ON public.mcq_bank;
CREATE POLICY "mcq_all" ON public.mcq_bank USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 6. FAQS (Knowledge Base shown in App / Extension / Web)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question   text NOT NULL,
  answer     text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faqs_all" ON public.faqs;
CREATE POLICY "faqs_all" ON public.faqs USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 7. PREMIUM REQUESTS (Student File Requests)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.premium_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text NOT NULL DEFAULT '',
  course_code  text DEFAULT '',
  request_type text DEFAULT 'premium_file',
  details      text DEFAULT '',
  status       text DEFAULT 'pending',
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_premium_requests_status ON public.premium_requests (status, created_at DESC);
ALTER TABLE public.premium_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "requests_all" ON public.premium_requests;
CREATE POLICY "requests_all" ON public.premium_requests USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 8. NOTIFICATIONS (Push Broadcasts)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text DEFAULT 'broadcast',
  channel      text DEFAULT 'app',
  type         text DEFAULT 'announcement',
  payload_json text DEFAULT '{}',
  status       text DEFAULT 'unread',
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_all" ON public.notifications;
CREATE POLICY "notifications_all" ON public.notifications USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 9. REVIEWS (Course Reviews by Students)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL DEFAULT '',
  course_code text NOT NULL,
  term        text DEFAULT 'final',
  semester    text DEFAULT '',
  text        text NOT NULL,
  anonymous   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON public.reviews (course_code);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_all" ON public.reviews;
CREATE POLICY "reviews_all" ON public.reviews USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 10. SUMMARIES (AI Study Summaries)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.summaries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text NOT NULL DEFAULT '',
  payload_json text DEFAULT '{}',
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_summaries_user ON public.summaries (user_id, created_at DESC);
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "summaries_all" ON public.summaries;
CREATE POLICY "summaries_all" ON public.summaries USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 11. SAVED ITEMS (Student Vault Bookmarks)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text NOT NULL DEFAULT '',
  item_type    text DEFAULT 'file',
  course_code  text DEFAULT '',
  payload_json text DEFAULT '{}',
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON public.saved_items (user_id, created_at DESC);
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_items_all" ON public.saved_items;
CREATE POLICY "saved_items_all" ON public.saved_items USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 12. FILE CONTRIBUTIONS (Student-contributed Files)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.file_contributions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text NOT NULL,
  course_code   text NOT NULL,
  title         text NOT NULL,
  description   text DEFAULT '',
  file_name     text DEFAULT '',
  mime_type     text DEFAULT 'application/octet-stream',
  file_size     integer DEFAULT 0,
  drive_file_id text DEFAULT '',
  url           text DEFAULT '',
  status        text DEFAULT 'uploading',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_file_contributions_user   ON public.file_contributions (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_file_contributions_status ON public.file_contributions (status, created_at);
ALTER TABLE public.file_contributions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contributions_all" ON public.file_contributions;
CREATE POLICY "contributions_all" ON public.file_contributions USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- DONE! All 12 tables created. ✅
-- ─────────────────────────────────────────────
