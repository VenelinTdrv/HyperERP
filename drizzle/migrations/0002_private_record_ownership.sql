alter table public.orders add column owner_user_id uuid references public.profiles(id);
alter table public.sales add column owner_user_id uuid references public.profiles(id);
alter table public.payments add column owner_user_id uuid references public.profiles(id);
alter table public.clients add column owner_user_id uuid references public.profiles(id);
create index orders_owner_idx on public.orders(owner_user_id);
create index sales_owner_idx on public.sales(owner_user_id);
create index payments_owner_idx on public.payments(owner_user_id);
create index clients_owner_idx on public.clients(owner_user_id);
-- Legacy seed rows have no owner and are visible only to administrators.
do $$ declare t text; p record; begin
 foreach t in array array['orders','sales','payments','clients'] loop
  for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
   execute format('drop policy %I on public.%I',p.policyname,t);
  end loop;
  execute format('create policy %I on public.%I for select to authenticated using (public.has_role(auth.uid(), ''admin'') or owner_user_id = auth.uid())', t || '_read',t);
  execute format('create policy %I on public.%I for insert to authenticated with check (public.has_role(auth.uid(), ''admin'') or owner_user_id = auth.uid())',t || '_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using (public.has_role(auth.uid(), ''admin'') or owner_user_id = auth.uid()) with check (public.has_role(auth.uid(), ''admin'') or owner_user_id = auth.uid())',t || '_update',t);
  execute format('create policy %I on public.%I for delete to authenticated using (public.has_role(auth.uid(), ''admin''))',t || '_delete',t);
 end loop;
end $$;
drop policy "Authenticated read order items" on public.order_items;
drop policy "Authenticated write order items" on public.order_items;
create policy order_items_access on public.order_items for all to authenticated using (exists (select 1 from public.orders o where o.id=order_id and (public.has_role(auth.uid(), 'admin') or o.owner_user_id=auth.uid()))) with check (exists (select 1 from public.orders o where o.id=order_id and (public.has_role(auth.uid(), 'admin') or o.owner_user_id=auth.uid())));
