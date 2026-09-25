-- ====================================================================
-- HM-Nexora Notifications Database Setup
-- Run this script inside your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Table for User-Specific In-App Notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'announcement', -- 'announcement', 'reply', etc.
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table for Tracking Sent Email Notification Batches
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    sent_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.user_notifications
    FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON public.user_notifications
    FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- System/Service Role can insert notifications (done by server endpoints using service_role key)
-- Note: Service Role naturally bypasses RLS policies.

-- RLS Policies for notification_logs
-- Only admins and owners can view notification logs
CREATE POLICY "Admins can view notification logs" ON public.notification_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid()::TEXT AND (role = 'admin' OR role = 'owner')
    ));
