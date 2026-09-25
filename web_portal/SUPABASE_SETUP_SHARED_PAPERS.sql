-- IMPORTANT: Please run this inside your Supabase Dashboard -> SQL Editor

CREATE TABLE IF NOT EXISTS public.shared_papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_code TEXT NOT NULL,
    term TEXT NOT NULL CHECK (term IN ('midterm', 'final')),
    exam_date DATE,
    exam_time TIME,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shared_papers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to shared_papers
CREATE POLICY "Allow public read access to shared_papers" ON public.shared_papers
    FOR SELECT USING (true);

-- Allow public insert access for now (if you want students to submit without logging in)
-- If you require login, change `true` to `auth.role() = 'authenticated'`
CREATE POLICY "Allow public insert to shared_papers" ON public.shared_papers
    FOR INSERT WITH CHECK (true);

-- ADD IMAGE COLUMN TO EXISTING TABLE
ALTER TABLE public.shared_papers ADD COLUMN IF NOT EXISTS image_url TEXT;

-- CREATE STORAGE BUCKET FOR PAPER IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shared_papers_images', 'shared_papers_images', true)
ON CONFLICT (id) DO NOTHING;

-- ENABLE PUBLIC UPLOADS TO BUCKET
CREATE POLICY "Public Upload shared_papers_images" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'shared_papers_images');

CREATE POLICY "Public Select shared_papers_images" ON storage.objects 
    FOR SELECT USING (bucket_id = 'shared_papers_images');
