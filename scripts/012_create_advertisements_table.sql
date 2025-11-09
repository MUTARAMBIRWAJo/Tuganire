-- Create advertisements table
CREATE TABLE IF NOT EXISTS public.advertisements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  click_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for active ads ordered by display_order
CREATE INDEX IF NOT EXISTS idx_advertisements_active_ordered 
ON public.advertisements(is_active, display_order) 
WHERE is_active = true;

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_advertisements_dates 
ON public.advertisements(start_date, end_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_advertisements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_advertisements_updated_at_trigger ON public.advertisements;

CREATE TRIGGER update_advertisements_updated_at_trigger
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_advertisements_updated_at();

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read active ads
CREATE POLICY "Public can read active advertisements"
ON public.advertisements
FOR SELECT
TO public
USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

-- Policy: Authenticated users can read all ads (for admin)
CREATE POLICY "Authenticated users can read all advertisements"
ON public.advertisements
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only superadmins can insert/update/delete
CREATE POLICY "Superadmins can manage advertisements"
ON public.advertisements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin')
  )
);

-- Add comment
COMMENT ON TABLE public.advertisements IS 'Stores advertisements (images/videos) for display on the website';

