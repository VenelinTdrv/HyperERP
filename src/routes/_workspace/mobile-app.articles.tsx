import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { erpListsQuery } from '@/lib/erp-query';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import perfume from '@/assets/perfume.jpg';

export const Route = createFileRoute('/_workspace/mobile-app/articles')({
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(erpListsQuery); },
  head: () => ({ meta: [
    { title: 'HyperERP · Мобилно приложение · Артикули' },
    { name: 'description', content: 'Мобилен екран за артикули в HyperERP.' },
    { property: 'og:title', content: 'HyperERP · Мобилни артикули' },
    { property: 'og:description', content: 'Артикули в мобилното приложение на HyperERP.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: MobileArticles,
});

function MobileArticles() {
  const { data } = useSuspenseQuery(erpListsQuery);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const query = search.trim().toLocaleLowerCase('bg');
  const rows = data.articles.filter(row => `${row.name} ${row.sku}`.toLocaleLowerCase('bg').includes(query));
  const visible = pageSize ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  return <section className="border-t border-border py-5" aria-label="Артикули">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-foreground">Артикули <span className="ml-2 text-sm font-normal text-muted-foreground">{rows.length}</span></h2>
      <span className="text-xs text-muted-foreground">Примерни данни</span>
    </div>
    <div className="relative mb-5 max-w-md">
      <Search size={16} className="absolute left-3 top-3 text-muted-foreground" aria-hidden="true"/>
      <Input aria-label="Търсене по име или SKU" placeholder="Търсене по име или SKU" value={search} className="h-10 pl-9" onChange={event => { setSearch(event.target.value); setPage(1); }}/>
    </div>
    <div className="flex items-center justify-between border-b border-border pb-2 text-xs text-muted-foreground"><span>Продукт / SKU</span><span>Наличност</span></div>
    <ul className="divide-y divide-border" aria-label="Продукти и наличности">
      {visible.map(row => <li key={row.id} className="flex items-center gap-3 py-4">
        {row.name.startsWith('Парфюм') ? <img src={perfume} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover"/> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><Package size={22}/></div>}
        <div className="min-w-0 flex-1"><h3 className="break-words text-sm font-semibold text-foreground">{row.name}</h3><p className="mt-1 break-all text-xs text-muted-foreground">SKU: {row.sku}</p></div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{row.stock} <span className="text-xs font-normal text-muted-foreground">бр.</span></span>
      </li>)}
    </ul>
    {rows.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Няма намерени продукти.</p>}
    <Pagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} noun="продукта" id="mobile-articles-page-size"/>
  </section>;
}