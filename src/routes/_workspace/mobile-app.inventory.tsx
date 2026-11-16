import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Plus, Eye, ClipboardCheck, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createInventory, useInventories, inventoryLines, inventoryToday, INVENTORY_WAREHOUSES } from '@/lib/inventory-store';

export const Route = createFileRoute('/_workspace/mobile-app/inventory')({
  head: () => ({ meta: [
    { title: 'HyperERP · Мобилно приложение · Ревизия' },
    { name: 'description', content: 'Мобилен екран за ревизия в HyperERP.' },
    { property: 'og:title', content: 'HyperERP · Мобилна ревизия' },
    { property: 'og:description', content: 'Ревизия в мобилното приложение на HyperERP.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: MobileInventory,
});

function MobileInventory() {
  const rows = useInventories();
  const [creating, setCreating] = useState(false);
  const [warehouse, setWarehouse] = useState('');
  const [date, setDate] = useState(inventoryToday);
  const [note, setNote] = useState('');
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const selected = rows.find(row => row.id === selectedId);
  const visible = pageSize ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;
  const start = () => { setWarehouse(''); setDate(inventoryToday()); setNote(''); setCounts({}); setError(''); setCreating(true); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    try {
      const revision = createInventory({ warehouse, date, note, counts });
      setCreating(false); setPage(1); setNotice(`${revision.id} · Ревизията е създадена само в демонстрацията.`);
    } catch (error) { setError(error instanceof Error ? error.message : 'Ревизията не е създадена.'); }
  };
  return <section className="border-t border-border py-5" aria-label="Ревизия">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">{creating ? 'Нова ревизия' : 'Ревизия'}</h2>{!creating && <Button size="sm" onClick={start}><Plus/>Нова ревизия</Button>}</div>
    <p className="mb-4 text-xs text-muted-foreground">Примерни ревизии · без промяна на реалните наличности</p>
    {creating ? <form onSubmit={save} noValidate>
      {error && <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="field"><label htmlFor="inventory-warehouse">Склад *</label><select id="inventory-warehouse" value={warehouse} onChange={event => { setWarehouse(event.target.value); setCounts({}); }}><option value="">Изберете склад</option>{INVENTORY_WAREHOUSES.map(value => <option key={value}>{value}</option>)}</select></div>
        <div><label htmlFor="inventory-date" className="mb-2 block text-xs">Дата *</label><Input id="inventory-date" type="date" value={date} onChange={event => setDate(event.target.value)}/></div>
      </div>
      {warehouse && <div className="border-t border-border"><div className="grid grid-cols-[minmax(0,1fr)_52px_80px] items-center gap-2 py-3 text-xs text-muted-foreground"><span>Продукт / SKU</span><span>Нал.</span><span>Преброено</span></div>{inventoryLines(warehouse).map(line => <div key={line.sku} className="grid grid-cols-[minmax(0,1fr)_52px_80px] items-center gap-2 border-t border-border py-3"><div className="min-w-0"><strong className="block break-words text-sm">{line.name}</strong><span className="block break-all text-xs text-muted-foreground">{line.sku}</span></div><span className="text-sm tabular-nums">{line.expected}</span><Input type="number" min={0} step={1} inputMode="numeric" aria-label={`Преброено ${line.name}`} value={counts[line.sku] ?? ''} placeholder="—" onChange={event => setCounts(previous => ({ ...previous, [line.sku]: event.target.value }))}/></div>)}</div>}
      <label htmlFor="inventory-note" className="mb-2 mt-5 block text-xs">Бележка</label><Input id="inventory-note" value={note} maxLength={500} onChange={event => setNote(event.target.value)}/>
      <div className="mt-5 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setCreating(false)}><ArrowLeft/>Отказ</Button><Button type="submit"><Check/>Създай ревизия</Button></div>
    </form> : <>
      {notice && <p role="status" className="mb-4 text-sm text-primary">{notice}</p>}
      {rows.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-muted-foreground"><ClipboardCheck size={40}/><p className="text-sm">Няма създадени ревизии.</p></div> : <ul aria-label="Списък с ревизии" className="divide-y divide-border border-y border-border">{visible.map(row => <li key={row.id} className="py-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold">{row.id}</p><p className="mt-1 break-words text-sm">{row.warehouse}</p><p className="mt-1 text-xs text-muted-foreground">{row.date} · {row.status} · {row.lines.filter(line => line.counted !== null).length}/{row.lines.length} преброени</p></div><Button variant="outline" size="icon" aria-label={`Преглед ${row.id}`} onClick={() => setSelectedId(row.id)}><Eye/></Button></div></li>)}</ul>}
      <Pagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} noun="ревизии" id="mobile-inventory-page-size"/>
    </>}
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto">{selected && <><DialogHeader><DialogTitle>Ревизия {selected.id}</DialogTitle><DialogDescription>{selected.warehouse} · {selected.date} · {selected.status} · Примерни данни</DialogDescription></DialogHeader><div className="grid grid-cols-[minmax(0,1fr)_40px_55px_50px] gap-2 text-xs text-muted-foreground"><span>Продукт</span><span>Нал.</span><span>Брой</span><span>Разлика</span></div>{selected.lines.map(line => <div key={line.sku} className="grid grid-cols-[minmax(0,1fr)_40px_55px_50px] gap-2 border-t border-border pt-3 text-sm"><div className="min-w-0 break-words">{line.name}<span className="block break-all text-xs text-muted-foreground">{line.sku}</span></div><span>{line.expected}</span><span>{line.counted ?? '—'}</span><span className={line.counted !== null && line.counted !== line.expected ? 'text-destructive' : 'text-muted-foreground'}>{line.counted === null ? '—' : line.counted - line.expected}</span></div>)}{selected.note && <p className="break-words text-sm">{selected.note}</p>}<Button variant="outline" onClick={() => setSelectedId(null)}>Затвори</Button></>}</DialogContent></Dialog>
  </section>;
}