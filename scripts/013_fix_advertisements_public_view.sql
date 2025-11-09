-- Fix advertisements public view policy
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read active advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Authenticated users can read all advertisements" ON public.advertisements;

-- Policy: Public can read active ads (more permissive)
CREATE POLICY "Public can read active advertisements"
ON public.advertisements
FOR SELECT
TO public, anon, authenticated
USING (
  is_active = true 
  AND (start_date IS NULL OR start_date <= now()) 
  AND (end_date IS NULL OR end_date >= now())
);

-- Policy: Authenticated users can read all ads (for admin dashboard)
CREATE POLICY "Authenticated users can read all advertisements"
ON public.advertisements
FOR SELECT
TO authenticated
USING (true);

-- Ensure the table is accessible
GRANT SELECT ON public.advertisements TO anon;
GRANT SELECT ON public.advertisements TO authenticated;
GRANT SELECT ON public.advertisements TO public;

