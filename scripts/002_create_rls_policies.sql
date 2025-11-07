-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.comments enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns enable row level security;
alter table public.media enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.newsletters enable row level security;
alter table public.audits enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- App Users policies
create policy "Public profiles are viewable by everyone"
  on public.app_users for select
  using (true);

create policy "Users can update own profile"
  on public.app_users for update
  using (auth.uid() = id);

-- Categories policies
create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Only admins can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Tags policies
create policy "Tags are viewable by everyone"
  on public.tags for select
  using (true);

create policy "Only admins can manage tags"
  on public.tags for all
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Articles policies
create policy "Published articles are viewable by everyone"
  on public.articles for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "reporter_insert_own" on public.articles
  for insert 
  using (true)
  with check (author_id = auth.uid());

create policy "reporter_update_own" on public.articles
  for update 
  using (author_id = auth.uid() AND status IN ('draft','submitted'))
  with check (author_id = auth.uid());

create policy "admin_update_all" on public.articles
  for update
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "Only admins can delete articles"
  on public.articles for delete
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Article tags policies
create policy "Article tags are viewable by everyone"
  on public.article_tags for select
  using (true);

create policy "Authors can manage own article tags"
  on public.article_tags for all
  using (
    exists (
      select 1 from public.articles
      where id = article_id
      and (
        author_id = auth.uid()
        or exists (
          select 1 from public.app_users
          where id = auth.uid()
          and role in ('superadmin', 'admin')
        )
      )
    )
  );

-- Comments policies
create policy "Approved comments are viewable by everyone"
  on public.comments for select
  using (
    is_approved = true
    or user_id = auth.uid()
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() is not null);

create policy "Users can update own comments"
  on public.comments for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "Users can delete own comments"
  on public.comments for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Newsletter subscribers policies
create policy "Users can view own subscription"
  on public.newsletter_subscribers for select
  using (
    email = (select email from auth.users where id = auth.uid())
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Users can update own subscription"
  on public.newsletter_subscribers for update
  using (
    email = (select email from auth.users where id = auth.uid())
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Newsletter campaigns policies
create policy "Only admins can view campaigns"
  on public.newsletter_campaigns for select
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "Only admins can manage campaigns"
  on public.newsletter_campaigns for all
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Media policies
create policy "Media is viewable by everyone"
  on public.media for select
  using (true);

create policy "Authenticated users can upload media"
  on public.media for insert
  with check (
    auth.uid() is not null
    and uploaded_by = auth.uid()
  );

create policy "Users can update own media"
  on public.media for update
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "Users can delete own media"
  on public.media for delete
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Audit logs policies
create policy "Only admins can view audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "System can insert audit logs"
  on public.audit_logs for insert
  with check (true);

-- Subscriptions policies
create policy "Anyone can subscribe"
  on public.subscriptions for insert
  with check (true);

create policy "Only admins can view subscriptions"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Newsletters policies
create policy "Only admins can manage newsletters"
  on public.newsletters for all
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

-- Audits policies
create policy "Only admins can view audits"
  on public.audits for select
  using (
    exists (
      select 1 from public.app_users
      where id = auth.uid()
      and role in ('superadmin', 'admin')
    )
  );

create policy "System can insert audits"
  on public.audits for insert
  with check (true);
