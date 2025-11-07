-- Add is_approved field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- Update existing users to be approved (so they can continue working)
UPDATE public.profiles SET is_approved = true WHERE is_approved IS NULL;

-- Check if article_status enum exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_status') THEN
        CREATE TYPE article_status AS ENUM ('draft', 'pending', 'published', 'rejected');
    END IF;
END $$;

-- If articles.status is not using the enum, we need to convert it
-- First, add a temporary column with the enum type
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS status_new article_status;

-- Copy data, mapping text values to enum values
UPDATE public.articles 
SET status_new = CASE 
    WHEN status::text = 'draft' THEN 'draft'::article_status
    WHEN status::text IN ('submitted', 'pending', 'review') THEN 'pending'::article_status
    WHEN status::text = 'published' THEN 'published'::article_status
    WHEN status::text = 'rejected' THEN 'rejected'::article_status
    ELSE 'draft'::article_status
END
WHERE status_new IS NULL;

-- Drop old column and rename new one (only if status_new exists and has data)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'status_new'
    ) THEN
        ALTER TABLE public.articles DROP COLUMN IF EXISTS status;
        ALTER TABLE public.articles RENAME COLUMN status_new TO status;
        ALTER TABLE public.articles ALTER COLUMN status SET DEFAULT 'draft'::article_status;
        ALTER TABLE public.articles ALTER COLUMN status SET NOT NULL;
    END IF;
END $$;

-- Add media column to articles if it doesn't exist (for multiple images/videos)
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS media jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for media (this needs to be done via Supabase dashboard or API)
-- But we'll add a comment for reference
COMMENT ON COLUMN public.articles.media IS 'Array of media objects with URLs from Supabase Storage';
