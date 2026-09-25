-- Run this in your Supabase SQL Editor to add the missing 'drive_id' column
-- to the 'pending_uploads' table. This will enable storing Google Drive backup
-- IDs for new uploads.

ALTER TABLE public.pending_uploads 
ADD COLUMN IF NOT EXISTS drive_id TEXT;
