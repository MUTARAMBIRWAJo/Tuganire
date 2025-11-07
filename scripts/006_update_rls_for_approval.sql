-- Update RLS policies to check is_approved status

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "reporter_insert_own" ON public.articles;
DROP POLICY IF EXISTS "reporter_update_own" ON public.articles;

-- Reporters can only insert if they are approved
CREATE POLICY "approved_reporters_can_insert" ON public.articles
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_approved = true
      AND profiles.role IN ('reporter', 'admin', 'superadmin')
    )
  );

-- Reporters can update their own drafts/pending articles if approved
CREATE POLICY "approved_reporters_update_own" ON public.articles
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid() 
    AND status IN ('draft', 'pending')
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_approved = true
    )
  )
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_approved = true
    )
  );

-- Admins and superadmins can update any article
CREATE POLICY "admins_update_all" ON public.articles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );
