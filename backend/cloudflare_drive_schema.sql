CREATE TABLE IF NOT EXISTS file_contributions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_size INTEGER NOT NULL DEFAULT 0,
  drive_file_id TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'uploading',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_file_contributions_user
ON file_contributions(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_file_contributions_status
ON file_contributions(status, created_at);
