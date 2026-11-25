import { useEffect, useState, useSyncExternalStore } from 'react';
import { ArrowDown, ArrowUp, Download, Search, ShieldCheck, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { REPORTS } from '@/lib/reports-data';
import { dispatchStockEvent, freePercent, freeQty, isLowStock, lowStockLevel, lowStockSnapshot, lowStockSubscribe, LOW_STOCK_THRESHOLD, LOW_STOCK_WAREHOUSE, type LowStockItem } from '@/lib/low-stock';

type SortKey = 'name' | 'sku' | 'reference' | 'sold' | 'reserved' | 'free' | 'percent' | 'lastDelivery';
const COLUMNS: [SortKey, string][] = [['name', 'Артикул'], ['sku', 'SKU'], ['reference', 'Общо количество'], ['sold', 'Продадени'], ['reserved', 'Резервирани'], ['free', 'Свободни'], ['percent', 'Свободна наличност (%)'], ['lastDelivery', 'Последна доставка']];
const val = (i: LowStockItem, k: SortKey): string | number => k === 'free' ? freeQty(i) : k === 'percent' ? freePercent(i) : i[k];
const fmtPct = (p: number) => `${p.toLocaleString('bg-BG', { maximumFractionDigits: 2 })}%`;
const levelClass: Record<string, string> = { yellow: 'bg-warning-soft text-warning', orange: 'bg-destructive-soft text-warning', red: 'bg-destructive-soft text-destructive' };
const levelLabel: Record<string, string> = { yellow: 'до 30%', orange: 'до 15%', red: 'Изчерпана' };

export function LowStockReport({ openSku }: { openSku?: string | undefined }) {
  const { items } = useSyncExternalStore(lowStockSubscribe, lowStockSnapshot, lowStockSnapshot);
  const [admin, setAdmin] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'percent', asc: true });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  useEffect(() => { if (openSku) setSelectedSku(openSku); }, [openSku]);

  const yambol = items.filter(i => i.warehouse === LOW_STOCK_WAREHOUSE);
  const low = yambol.filter(isLowStock);
  const q = query.trim().toLocaleLowerCase('bg-BG');
  const rows = low.filter(i => (!q || `${i.name} ${i.sku}`.toLocaleLowerCase('bg-BG').includes(q)) && (!category || i.category === category) && (!brand || i.brand === brand) && (!level || lowStockLevel(freePercent(i)) === level))
    .sort((a, b) => { const x = val(a, sort.key), y = val(b, sort.key); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'bg-BG'); return sort.asc ? c : -c; });
  const size = pageSize || rows.length || 1;
  const cur = Math.min(page, Math.max(1, Math.ceil(rows.length / size)));
  const shown = rows.slice((cur - 1) * size, cur * size);
  const counts = { low: low.length, critical: low.filter(i => freePercent(i) <= 15).length, out: low.filter(i => freeQty(i) === 0).length };
  const selected = yambol.find(i => i.sku === selectedSku) ?? null;
  const clear = () => { setQuery(''); setCategory(''); setBrand(''); setLevel(''); setPage(1); };
  const cells = (i: LowStockItem) => [i.name, i.sku, String(i.reference), String(i.sold), String(i.reserved), String(freeQty(i)), fmtPct(freePercent(i)), i.lastDelivery];
  const exportXls = () => {
    const csv = '\uFEFF' + [COLUMNS.map(c => c[1]), ...rows.map(cells)].map(l => l.map(v => `"${v.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'namalyavashti-nalichnosti.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const event = (e: Parameters<typeof dispatchStockEvent>[2]) => selected && dispatchStockEvent(selected.sku, LOW_STOCK_WAREHOUSE, e);
  const unique = (k: 'category' | 'brand') => [...new Set(yambol.map(i => i[k]))].sort();

  return <WorkspaceShell active={REPORTS.lowStock}><div className="page-content orders-content deliveries-content">
    <div className="page-heading"><h1>{REPORTS.lowStock} <span className="text-sm font-normal text-muted-foreground">· склад {LOW_STOCK_WAREHOUSE}</span></h1><div className="flex gap-2"><div className="segmented" role="group" aria-label="Преглед на екрана"><Button type="button" variant="ghost" className="segment" aria-pressed={admin} onClick={() => setAdmin(true)}><ShieldCheck size={13} />Админ</Button><Button type="button" variant="ghost" className="segment" aria-pressed={!admin} onClick={() => setAdmin(false)}><User size={13} />Инфлуенсър</Button></div>{admin && <Button variant="outline" size="icon" aria-label="Експорт в Excel" title="Експорт в Excel" onClick={exportXls}><Download /></Button>}</div></div>
    {!admin ? <div className="delivery-empty"><ShieldCheck size={28} /><h3>Нямате достъп до тази справка</h3><p className="text-xs text-muted-foreground">Справката и известията са само за потребители с права за наличности и доставки.</p></div> : <>
    <section aria-label="Намаляващи наличности — обобщение" className="mb-4 grid gap-3 sm:grid-cols-3">
      {([['Свободна наличност до 30%', counts.low, 'yellow'], ['Свободна наличност до 15%', counts.critical, 'orange'], ['Изчерпана свободна наличност', counts.out, 'red']] as const).map(([label, n, l]) => <button type="button" key={label} onClick={() => { setLevel(level === l ? '' : l); setPage(1); }} aria-pressed={level === l} className={`rounded-lg border border-border p-3 text-left ${levelClass[l]}`}><div className="text-xs">{label}</div><div className="text-2xl font-bold">{n}</div></button>)}
    </section>
    <div className="reports-filters low-stock-filters"><div className="search-box"><Search /><input className="search-input" aria-label="Търсене по име или SKU" placeholder="Артикул или SKU…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></div>
      <div className="field"><select aria-label="Категория" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}><option value="">Всички категории</option>{unique('category').map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><select aria-label="Марка" value={brand} onChange={e => { setBrand(e.target.value); setPage(1); }}><option value="">Всички марки</option>{unique('brand').map(c => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><select aria-label="Свободна наличност" value={level} onChange={e => { setLevel(e.target.value); setPage(1); }}><option value="">До {LOW_STOCK_THRESHOLD}% (всички)</option><option value="yellow">Над 15% до 30%</option><option value="orange">Над 0% до 15%</option><option value="red">0% — изчерпана</option></select></div>
      <Button variant="outline" disabled={!query && !category && !brand && !level} onClick={clear}><X />Изчисти</Button></div>
    <section className="delivery-list" aria-label={REPORTS.lowStock}><div className="delivery-list-heading"><h2>Резултати <span>{rows.length}</span></h2></div>
      <div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr>{COLUMNS.map(([k, label]) => <th key={k} aria-sort={sort.key === k ? (sort.asc ? 'ascending' : 'descending') : 'none'}><button type="button" className="inline-flex items-center gap-1" onClick={() => setSort(s => ({ key: k, asc: s.key === k ? !s.asc : true }))}>{label}{sort.key === k && (sort.asc ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>)}</tr></thead>
        <tbody>{shown.map(i => { const p = freePercent(i); const l = lowStockLevel(p); return <tr key={i.sku}><td><button type="button" className="font-semibold text-primary hover:underline" onClick={() => setSelectedSku(i.sku)}>{i.name}</button></td><td>{i.sku}</td><td>{i.reference}</td><td>{i.sold}</td><td>{i.reserved}</td><td className="font-semibold">{freeQty(i)}</td><td><span className={`rounded px-2 py-0.5 text-xs font-semibold ${levelClass[l] ?? ''}`} title={levelLabel[l]}>{fmtPct(p)}</span></td><td>{i.lastDelivery}</td></tr>; })}</tbody></table></div>
      {!rows.length && <div className="delivery-empty"><Search size={28} /><h3>Няма артикули с намаляваща наличност</h3></div>}
      <Pagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="reports-low-stock-page-size" />
    </section><div className="demo-caption mt-4"><ShieldCheck size={13} />Примерни данни · действията в профила на артикула не променят реални наличности</div></>}
    <Dialog open={selected !== null && admin} onOpenChange={o => { if (!o) setSelectedSku(null); }}><DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>Профил на артикула · склад {LOW_STOCK_WAREHOUSE} · примерни данни</DialogDescription></DialogHeader>
      {selected && <><dl className="delivery-details reports-summary">{cells(selected).map((v, idx) => <div key={COLUMNS[idx]![0]}><dt>{COLUMNS[idx]![1]}</dt><dd>{v}</dd></div>)}<div><dt>Категория / марка</dt><dd>{selected.category} · {selected.brand}</dd></div></dl>
        <section className="border-t border-border pt-3" aria-label="Симулация на складови събития"><h3 className="mb-2 text-sm font-semibold">Симулирай събитие</h3><div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => event({ type: 'reserve', qty: 5 })}>Резервирай 5</Button>
          <Button size="sm" variant="outline" disabled={!selected.reserved} onClick={() => event({ type: 'cancel', qty: 5 })}>Анулирай поръчка (5)</Button>
          <Button size="sm" variant="outline" disabled={!selected.reserved} onClick={() => event({ type: 'ship', qty: 5 })}>Изпиши 5</Button>
          <Button size="sm" variant="outline" onClick={() => event({ type: 'return', qty: 5 })}>Връщане 5</Button>
          <Button size="sm" onClick={() => event({ type: 'delivery', qty: 100, date: new Date().toISOString().slice(0, 10) })}>Нова доставка 100</Button>
        </div>{!isLowStock(selected) && <p className="mt-2 text-xs text-success">Свободната наличност е над 30% — артикулът отпада от справката.</p>}</section></>}
      <div className="flex justify-end"><Button variant="outline" onClick={() => setSelectedSku(null)}>Затвори</Button></div></DialogContent></Dialog>
  </div></WorkspaceShell>;
}
