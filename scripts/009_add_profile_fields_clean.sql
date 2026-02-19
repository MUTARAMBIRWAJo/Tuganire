-- Step 1: Add bio field
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS bio text;

-- Step 2: Add contact fields
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS email_public boolean DEFAULT false;

-- Step 3: Add social media fields
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS youtube_url text;

-- Step 4: Add privacy settings
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS show_email boolean DEFAULT false;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS show_phone boolean DEFAULT false;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS show_social_links boolean DEFAULT true;

-- Step 5: Add location
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS location text;

-- Step 6: Add updated_at timestamp
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Step 7: Create function for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_app_users_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Step 8: Create trigger
DROP TRIGGER IF EXISTS update_app_users_updated_at_trigger ON public.app_users;
CREATE TRIGGER update_app_users_updated_at_trigger
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_app_users_updated_at();

