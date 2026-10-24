create type public.app_role as enum ('admin','influencer','wholesale');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins update profiles"
  on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "System profiles are protected"
  on public.profiles as restrictive for update to authenticated
  using (not is_system);
create policy "System profiles cannot be deleted"
  on public.profiles as restrictive for delete to authenticated
  using (not is_system);
create policy "Admins delete profiles"
  on public.profiles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users read own roles"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid());
create policy "Admins read all roles"
  on public.user_roles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;
  insert into public.profiles (id, display_name, email, is_system)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email, first_user);
  if first_user then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'influencer');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();