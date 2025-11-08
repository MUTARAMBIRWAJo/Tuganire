-- Fix infinite recursion in app_users update policy
-- The recursion happens when RLS policies query the same table they protect
-- Solution: Use a security definer function that bypasses RLS

-- Create a security definer function to check if user can update
CREATE OR REPLACE FUNCTION public.can_update_app_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- This function bypasses RLS, so it won't cause recursion
  -- SECURITY DEFINER runs with the privileges of the function owner
  RETURN auth.uid() = user_id;
END;
$$;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.app_users;

-- Create policy using the security definer function
-- This avoids recursion because the function bypasses RLS
CREATE POLICY "Users can update own profile" 
ON public.app_users 
FOR UPDATE
USING (public.can_update_app_user(id))
WITH CHECK (public.can_update_app_user(id));

