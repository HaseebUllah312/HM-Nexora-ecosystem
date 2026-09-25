-- IMPORTANT: Please run this inside your Supabase Dashboard -> SQL Editor

CREATE TABLE IF NOT EXISTS public.subject_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    term TEXT NOT NULL CHECK (term IN ('midterm', 'final')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Allow anyone to read reviews, but restrict inserts/deletes to service_role (your API handles auth)
-- Alternatively, if RLS is enabled on your DB, you must add policies.
ALTER TABLE public.subject_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reviews
CREATE POLICY "Allow public read access to subject_reviews" ON public.subject_reviews
    FOR SELECT USING (true);

-- Allow the edge/server API to bypass RLS with service_role key
-- Service Role bypasses RLS naturally, so inserts/deletes from your Next.js API using SUPABASE_SERVICE_ROLE_KEY will work automatically.
