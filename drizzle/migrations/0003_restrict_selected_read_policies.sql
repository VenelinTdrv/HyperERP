-- Restrict only the eleven broad read policies selected for remediation.
-- Seller roles retain read-only catalogue access; administrators retain full access.
drop policy "Authenticated read articles" on public.articles;
create policy "Assigned roles read articles" on public.articles
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'influencer')
    or public.has_role(auth.uid(), 'wholesale')
  );

drop policy "Authenticated read categories" on public.categories;
create policy "Assigned roles read categories" on public.categories
  for select to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'influencer')
    or public.has_role(auth.uid(), 'wholesale')
  );

-- These tables remain readable by administrators through their existing manage policies.
drop policy "Authenticated read combos" on public.combos;
drop policy "Authenticated read combo items" on public.combo_items;
drop policy "Authenticated read settlements" on public.settlements;
drop policy "Authenticated read warehouses" on public.warehouses;
drop policy "Authenticated read suppliers" on public.suppliers;
drop policy "Authenticated read deliveries" on public.deliveries;
drop policy "Authenticated read transfers" on public.transfers;
drop policy "Authenticated read transfer items" on public.transfer_items;
drop policy "Authenticated read stock" on public.stock;
