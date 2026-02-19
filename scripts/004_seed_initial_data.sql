-- Insert default categories
insert into public.categories (name, slug, description) values
  ('Politics', 'politics', 'Political news and analysis'),
  ('Business', 'business', 'Business and economy news'),
  ('Technology', 'technology', 'Technology and innovation'),
  ('Sports', 'sports', 'Sports news and updates'),
  ('Entertainment', 'entertainment', 'Entertainment and culture'),
  ('Health', 'health', 'Health and wellness'),
  ('Education', 'education', 'Education news and resources')
on conflict (slug) do nothing;

-- Insert default tags
insert into public.tags (name, slug) values
  ('Breaking News', 'breaking-news'),
  ('Featured', 'featured'),
  ('Trending', 'trending'),
  ('Analysis', 'analysis'),
  ('Opinion', 'opinion'),
  ('Investigation', 'investigation')
on conflict (slug) do nothing;
