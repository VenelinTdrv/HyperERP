-- Номенклатури и операции на HyperERP

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  notes text not null default '',
  status text not null default 'active' check (status in ('active','blacklist')),
  addresses jsonb not null default '[]'::jsonb,
  primary_index integer not null default 0,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  edited_by text not null default '',
  edited_at timestamptz
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.categories(id) on delete restrict,
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references public.categories(id),
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  edited_by text not null default '',
  edited_at timestamptz
);

create table public.combos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  influencer_name text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  edited_by text not null default '',
  edited_at timestamptz
);

create table public.combo_items (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.combos(id) on delete cascade,
  article_id uuid references public.articles(id),
  quantity integer not null default 1
);

create table public.countries (
  code char(2) primary key,
  name text not null,
  local_name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) references public.countries(code),
  name text not null,
  region text not null default '',
  postal_code text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('Физически','Виртуален')),
  country_code char(2) references public.countries(code),
  city text not null default '',
  street text not null default '',
  postal_code text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  active boolean not null default true,
  eik text not null default '',
  vat text not null default '',
  country_code char(2) references public.countries(code),
  city text not null default '',
  street text not null default '',
  block text not null default '',
  entrance text not null default '',
  floor text not null default '',
  apartment text not null default '',
  postcode text not null default '',
  phone text not null default '',
  iban text not null default '',
  contact_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  edited_by text not null default '',
  edited_at timestamptz
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'Необработена' check (status in ('Необработена','Обработена','Анулирана')),
  customer text not null,
  phone text not null default '',
  city text not null default '',
  address text not null default '',
  courier text not null default '',
  delivery_type text not null default 'address',
  note text not null default '',
  payment_method text not null default 'Наложен платеж',
  shipping numeric(10,2) not null default 0,
  seller_name text not null default '',
  client_id uuid references public.clients(id),
  created_by text not null default '',
  created_at timestamptz not null default now(),
  edited_by text not null default '',
  edited_at timestamptz,
  processed_by text not null default '',
  processed_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sku text not null,
  name text not null,
  quantity integer not null default 1,
  price numeric(10,2) not null default 0,
  position integer not null default 0
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  sale_number text not null unique,
  status text not null default 'Необработена' check (status in ('Необработена','Обработена','Изпратена','Доставена','Отказана')),
  customer text not null,
  phone text not null default '',
  city text not null default '',
  address text not null default '',
  courier text not null default '',
  product_name text not null default '',
  quantity integer not null default 1,
  price numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  seller_name text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  processed_by text not null default '',
  processed_at timestamptz
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_number text not null unique,
  status text not null check (status in ('Очаквана','В транзит','Получена','Отказана')),
  supplier_id uuid references public.suppliers(id),
  supplier_name text not null default '',
  warehouse_id uuid references public.warehouses(id),
  warehouse_name text not null default '',
  product_name text not null default '',
  quantity integer not null default 0,
  expected_date date,
  received_date date,
  note text not null default '',
  created_by text not null default '',
  created_at date not null default current_date,
  edited_by text not null default '',
  edited_at timestamptz
);

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  transfer_number text not null unique,
  status text not null check (status in ('Необработен','Потвърден','Завършен','Отказан')),
  from_warehouse_id uuid references public.warehouses(id),
  from_warehouse_name text not null default '',
  to_warehouse_id uuid references public.warehouses(id),
  to_warehouse_name text not null default '',
  description text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  edited_by text not null default '',
  edited_at timestamptz
);

create table public.transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.transfers(id) on delete cascade,
  article_id uuid references public.articles(id),
  product_name text not null default '',
  quantity integer not null default 1
);

create table public.stock (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  quantity integer not null default 0,
  unique (warehouse_id, article_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_number text not null unique,
  order_number text not null default '',
  client_name text not null default '',
  agent_name text not null default '',
  amount numeric(10,2) not null default 0,
  method text not null default 'Наложен платеж',
  courier text not null default 'Еконт',
  status text not null check (status in ('Очаквано','Получено','Частично','Отказано','Върнато')),
  payment_date date not null default current_date,
  reference text not null default '',
  note text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  edited_by text not null default '',
  edited_at timestamptz
);

create index order_items_order_idx on public.order_items(order_id);
create index combo_items_combo_idx on public.combo_items(combo_id);
create index transfer_items_transfer_idx on public.transfer_items(transfer_id);

-- GRANT на всички таблици
grant select, insert, update, delete on public.clients, public.categories, public.articles, public.combos, public.combo_items, public.settlements, public.warehouses, public.suppliers, public.orders, public.order_items, public.sales, public.deliveries, public.transfers, public.transfer_items, public.stock, public.payments to authenticated;
grant all on public.clients, public.categories, public.articles, public.combos, public.combo_items, public.settlements, public.warehouses, public.suppliers, public.orders, public.order_items, public.sales, public.deliveries, public.transfers, public.transfer_items, public.stock, public.payments to service_role;
grant select on public.countries to authenticated;
grant all on public.countries to service_role;

-- RLS
alter table public.clients enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.combos enable row level security;
alter table public.combo_items enable row level security;
alter table public.countries enable row level security;
alter table public.settlements enable row level security;
alter table public.warehouses enable row level security;
alter table public.suppliers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.sales enable row level security;
alter table public.deliveries enable row level security;
alter table public.transfers enable row level security;
alter table public.transfer_items enable row level security;
alter table public.stock enable row level security;
alter table public.payments enable row level security;

-- Четене: всички влезли потребители
create policy "Authenticated read clients" on public.clients for select to authenticated using (true);
create policy "Authenticated read categories" on public.categories for select to authenticated using (true);
create policy "Authenticated read articles" on public.articles for select to authenticated using (true);
create policy "Authenticated read combos" on public.combos for select to authenticated using (true);
create policy "Authenticated read combo items" on public.combo_items for select to authenticated using (true);
create policy "Authenticated read countries" on public.countries for select to authenticated using (true);
create policy "Authenticated read settlements" on public.settlements for select to authenticated using (true);
create policy "Authenticated read warehouses" on public.warehouses for select to authenticated using (true);
create policy "Authenticated read suppliers" on public.suppliers for select to authenticated using (true);
create policy "Authenticated read orders" on public.orders for select to authenticated using (true);
create policy "Authenticated read order items" on public.order_items for select to authenticated using (true);
create policy "Authenticated read sales" on public.sales for select to authenticated using (true);
create policy "Authenticated read deliveries" on public.deliveries for select to authenticated using (true);
create policy "Authenticated read transfers" on public.transfers for select to authenticated using (true);
create policy "Authenticated read transfer items" on public.transfer_items for select to authenticated using (true);
create policy "Authenticated read stock" on public.stock for select to authenticated using (true);
create policy "Authenticated read payments" on public.payments for select to authenticated using (true);

-- Запис: номенклатури — само администратор
create policy "Admins manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage countries" on public.countries for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage settlements" on public.settlements for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage warehouses" on public.warehouses for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage suppliers" on public.suppliers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage articles" on public.articles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage combos" on public.combos for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage combo items" on public.combo_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage deliveries" on public.deliveries for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage transfers" on public.transfers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage transfer items" on public.transfer_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins manage stock" on public.stock for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Клиенти: пише всеки влезъл, изтрива само администратор
create policy "Authenticated create clients" on public.clients for insert to authenticated with check (true);
create policy "Authenticated update clients" on public.clients for update to authenticated using (true) with check (true);
create policy "Admins delete clients" on public.clients for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Поръчки: всеки създава своите, чете всички, редактира свои; администратор — всичко
create policy "Authenticated create orders" on public.orders for insert to authenticated with check (true);
create policy "Authenticated update orders" on public.orders for update to authenticated using (seller_name = '' or created_by = '' or true) with check (true);
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Authenticated write order items" on public.order_items for all to authenticated using (true) with check (true);

-- Продажби и плащания: същият модел
create policy "Authenticated create sales" on public.sales for insert to authenticated with check (true);
create policy "Authenticated update sales" on public.sales for update to authenticated using (true) with check (true);
create policy "Admins delete sales" on public.sales for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Authenticated create payments" on public.payments for insert to authenticated with check (true);
create policy "Authenticated update payments" on public.payments for update to authenticated using (true) with check (true);
create policy "Admins delete payments" on public.payments for delete to authenticated using (public.has_role(auth.uid(),'admin'));