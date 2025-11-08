-- Add comprehensive profile fields to app_users table
-- This script adds fields for bio, contact info, social media, and privacy settings

-- Add bio/description field
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS bio text;

-- Add contact information
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS email_public boolean DEFAULT false;

-- Add social media links
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS website text;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS twitter_url text;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS facebook_url text;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS linkedin_url text;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS instagram_url text;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS youtube_url text;

-- Add privacy settings
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS show_email boolean DEFAULT false;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS show_phone boolean DEFAULT false;

ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS show_social_links boolean DEFAULT true;

-- Add location information
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS location text;

-- Add updated_at timestamp
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_app_users_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_app_users_updated_at_trigger ON public.app_users;

CREATE TRIGGER update_app_users_updated_at_trigger
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_app_users_updated_at();
