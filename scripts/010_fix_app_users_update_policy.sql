-- Fix app_users update policy to include WITH CHECK clause
-- This ensures users can update their own profile with proper RLS

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.app_users;

-- Create updated policy with both USING and WITH CHECK clauses
CREATE POLICY "Users can update own profile" 
ON public.app_users 
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

