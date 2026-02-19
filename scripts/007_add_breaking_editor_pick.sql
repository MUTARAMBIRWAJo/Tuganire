-- Add is_breaking and is_editor_pick columns to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS is_breaking boolean DEFAULT false;

ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS is_editor_pick boolean DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking ON public.articles(is_breaking) WHERE is_breaking = true;
CREATE INDEX IF NOT EXISTS idx_articles_is_editor_pick ON public.articles(is_editor_pick) WHERE is_editor_pick = true;

-- Recreate helper views used by the public homepage
DROP VIEW IF EXISTS public.v_latest4_by_category CASCADE;
DROP VIEW IF EXISTS public.v_breaking CASCADE;
DROP VIEW IF EXISTS public.v_trending CASCADE;

-- Latest 4 published per category
CREATE OR REPLACE VIEW public.v_latest4_by_category AS
SELECT
  t.id,
  t.slug,
  t.title,
  t.excerpt,
  t.featured_image,
  t.published_at,
  t.category_id,
  t.category_name,
  t.category_slug,
  t.author_id,
  t.author_display_name,
  t.author_avatar_url,
  t.views_count,
  t.is_featured,
  t.is_breaking,
  t.is_editor_pick
FROM (
  SELECT
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.featured_image,
    a.published_at,
    a.category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    a.author_id,
    au.display_name AS author_display_name,
    au.avatar_url AS author_avatar_url,
    a.views_count,
    a.is_featured,
    a.is_breaking,
    a.is_editor_pick,
    row_number() OVER (PARTITION BY a.category_id ORDER BY a.published_at DESC) AS rn
  FROM public.articles a
  LEFT JOIN public.categories c ON c.id = a.category_id
  LEFT JOIN public.app_users au ON au.id = a.author_id
  WHERE lower(a.status) = 'published'
    AND a.published_at IS NOT NULL
    AND a.published_at <= now()
)
t
WHERE t.rn <= 4;

-- Breaking view
CREATE OR REPLACE VIEW public.v_breaking AS
SELECT
  a.id,
  a.slug,
  a.title,
  a.excerpt,
  a.featured_image,
  a.published_at,
  c.name AS category_name,
  c.slug AS category_slug
FROM public.articles a
LEFT JOIN public.categories c ON c.id = a.category_id
WHERE a.is_breaking = true
  AND lower(a.status) = 'published'
  AND a.published_at IS NOT NULL
  AND a.published_at <= now()
ORDER BY a.published_at DESC;

-- Trending view
CREATE OR REPLACE VIEW public.v_trending AS
SELECT
  a.id,
  a.slug,
  a.title,
  a.excerpt,
  a.featured_image,
  a.published_at,
  a.views_count,
  c.name AS category_name,
  c.slug AS category_slug
FROM public.articles a
LEFT JOIN public.categories c ON c.id = a.category_id
WHERE lower(a.status) = 'published'
  AND a.published_at IS NOT NULL
  AND a.published_at <= now()
ORDER BY a.views_count DESC NULLS LAST, a.published_at DESC;

