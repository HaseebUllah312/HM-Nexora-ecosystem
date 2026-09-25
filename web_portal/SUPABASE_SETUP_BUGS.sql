-- 1. Table for Community Reports (Moderation Center)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'content', 'user', 'comment'
    target_id TEXT NOT NULL,
    title TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table for Platform Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'user', 'content', 'system', 'security'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    actor TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Table for User-Submitted Quiz Questions (replacing JSON file)
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT,
    status TEXT DEFAULT 'pending',
    submitted_by TEXT REFERENCES public.users(id), -- Changed from UUID to TEXT
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table for Quiz Attempts (to track completions)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id), -- Changed from UUID to TEXT
    subject_code TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins/owners can see reports and activity
CREATE POLICY "Admins can view reports" ON public.reports FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id::TEXT = auth.uid()::TEXT AND (role = 'admin' OR role = 'owner')));
CREATE POLICY "Admins can view activity" ON public.activity_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id::TEXT = auth.uid()::TEXT AND (role = 'admin' OR role = 'owner')));

-- Users can submit questions
CREATE POLICY "Users can submit questions" ON public.quiz_submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage submissions" ON public.quiz_submissions FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id::TEXT = auth.uid()::TEXT AND (role = 'admin' OR role = 'owner')));

-- Users can view their own quiz attempts
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid()::TEXT = user_id::TEXT);
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id::TEXT);
