-- Run this in the Supabase SQL Editor for your project.
-- After creating your first Auth user, replace the UUID below with that user's ID.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category text not null check (category in ('coffee','drinks','bakery','plates')),
  price integer not null check (price >= 0),
  image_url text,
  tag text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cafe_settings (
  id integer primary key check (id = 1),
  cafe_name text not null default 'Sipology',
  cafe_slug text not null default 'sipology',
  updated_at timestamptz not null default now()
);
insert into public.cafe_settings (id,cafe_name,cafe_slug) values (1,'Sipology','sipology') on conflict (id) do nothing;

alter table public.admin_users enable row level security;
alter table public.menu_items enable row level security;
alter table public.cafe_settings enable row level security;

-- Admin can see their own membership row; no public role can insert/delete membership rows.
drop policy if exists "admin membership read own" on public.admin_users;
create policy "admin membership read own" on public.admin_users for select to authenticated using (user_id = auth.uid());

-- Public website can read active products; admin can manage all rows.
drop policy if exists "public reads active menu" on public.menu_items;
create policy "public reads active menu" on public.menu_items for select to anon, authenticated using (active = true or exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins insert menu" on public.menu_items;
create policy "admins insert menu" on public.menu_items for insert to authenticated with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins update menu" on public.menu_items;
create policy "admins update menu" on public.menu_items for update to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins delete menu" on public.menu_items;
create policy "admins delete menu" on public.menu_items for delete to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Public may read the cafe identity; only allowlisted admin may change it.
drop policy if exists "public reads cafe profile" on public.cafe_settings;
create policy "public reads cafe profile" on public.cafe_settings for select to anon, authenticated using (true);
drop policy if exists "admins update cafe profile" on public.cafe_settings;
create policy "admins update cafe profile" on public.cafe_settings for update to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Optional starter menu seed rows. Prices are sample INR prices.
insert into public.menu_items (name,description,category,price,image_url,tag,sort_order) values
('Brown Sugar Latte','Double espresso, oat milk, brown sugar','coffee',220,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=85','HOUSE FAVOURITE',1),
('Butter Croissant','Golden, flaky, baked every morning','bakery',120,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85',null,2),
('Classic Cappuccino','Rich espresso, silky steamed milk','coffee',180,'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=85',null,3),
('Country Sourdough','Slow-fermented, crisp crust, soft centre','bakery',220,'https://images.unsplash.com/photo-1608198093002-ad4e005484e1?auto=format&fit=crop&w=800&q=85',null,4),
('Avocado Toast','Whipped feta, chilli oil, sourdough','plates',320,'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=85',null,5),
('Chocolate Croissant','Dark chocolate tucked in buttery layers','bakery',150,'https://images.unsplash.com/photo-1606313564200-e75d5e304c76?auto=format&fit=crop&w=800&q=85',null,6),
('Double Espresso','Our rotating single-origin house shot','coffee',130,'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=85',null,7),
('Berry & Granola Bowl','Greek yoghurt, seasonal fruit, house granola','plates',280,'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=85',null,8),
('Flat White','Velvety microfoam over a double shot','coffee',190,'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=85',null,9),
('Hot Chocolate','Slow-melted chocolate, steamed milk','drinks',210,'https://images.unsplash.com/photo-1542990253-0b8be9e2e8f2?auto=format&fit=crop&w=800&q=85',null,10),
('Matcha Latte','Japanese matcha whisked with milk','drinks',240,'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=85',null,11),
('Grilled Cheese','Toasted sourdough, melting cheese','plates',260,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85',null,12)
on conflict do nothing;
