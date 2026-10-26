import { useState } from 'react';
import { Download, Eye, MoreVertical, Search, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { REPORTS, REPORT_WAREHOUSES, reportRows, type ReportKind, type ReportRow } from '@/lib/reports-data';

const money = (value: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR' }).format(value);
export function ReportsWorkspace({ kind }: { kind: ReportKind }) {
  const [query, setQuery] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const rows = reportRows(kind, query, warehouse);
  const size = pageSize || rows.length || 1;
  const cur = Math.min(page, Math.max(1, Math.ceil(rows.length / size)));
  const shown = rows.slice((cur - 1) * size, cur * size);
  const warehouseProducts = kind === 'warehouses' && selected ? reportRows('articles', '', selected.name) : [];
  const batches = kind === 'batches' || kind === 'exhausted';
  const profit = kind === 'profit';
  const headers = [...(kind === 'articles' || batches ? ['SKU', 'Артикул'] : ['Склад']), ...(batches ? ['Склад', 'Партида'] : []), profit ? 'Продадени бройки' : 'Наличност (бр.)', ...(profit ? ['Продажби', 'Доставни цени'] : []), profit ? 'Печалба' : 'Доставна стойност'];
  const values = (row: ReportRow) => [...(kind === 'articles' || batches ? [row.sku ?? '', row.name] : [row.name]), ...(batches ? [row.warehouse ?? '', row.batch ?? ''] : []), String(row.quantity), ...(profit ? [money(row.revenue ?? 0), money(row.cost ?? 0)] : []), money(row.value)];
  const exportRows = (data: ReportRow[]) => {
    const csv = '\uFEFF' + [headers, ...data.map(values)].map(line => line.map(value => `"${value.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `spravka-${kind}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const clear = () => { setQuery(''); setWarehouse(''); setPage(1); };
  return <WorkspaceShell active={REPORTS[kind]}><div className="page-content orders-content deliveries-content">
    <div className="page-heading"><h1>{REPORTS[kind]}</h1><Button variant="outline" size="icon" aria-label="Експорт в CSV" title="Експорт в CSV" onClick={() => exportRows(rows)}><Download /></Button></div>
    <div className="reports-filters"><div className="search-box"><Search /><input className="search-input" aria-label="Търсене в справката" placeholder={batches ? 'Артикул, SKU или партида…' : 'Търсене…'} value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></div><div className="field"><select aria-label="Склад" value={warehouse} onChange={event => { setWarehouse(event.target.value); setPage(1); }}><option value="">Всички складове</option>{REPORT_WAREHOUSES.map(name => <option key={name}>{name}</option>)}</select></div><Button variant="outline" disabled={!query && !warehouse} onClick={clear}><X />Изчисти</Button></div>
    <section className="delivery-list" aria-label={REPORTS[kind]}><div className="delivery-list-heading"><h2>Резултати <span>{rows.length}</span></h2><span className="text-muted-foreground text-xs">{profit ? 'Печалба' : 'Обща доставна стойност'}: <strong className="text-primary">{money(rows.reduce((sum, row) => sum + row.value, 0))}</strong></span></div>
      <div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}<th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th></tr></thead><tbody>{shown.map(row => <tr key={row.id}>{values(row).map((value, index) => <td key={index} className={index === headers.length - 1 ? 'font-semibold text-primary' : undefined}>{value}</td>)}<td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${row.id}`} title="Действия"><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => exportRows([row])}><Download />Експорт в CSV</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td><td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${row.id}`} title="Преглед" onClick={() => setSelected(row)}><Eye /></Button></div></td></tr>)}</tbody></table></div>
      {!rows.length && <div className="delivery-empty"><Search size={28} /><h3>Няма намерени резултати</h3><Button variant="outline" onClick={clear}>Изчисти</Button></div>}
      <Pagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id={`reports-${kind}-page-size`} />
    </section><div className="demo-caption mt-4"><ShieldCheck size={13} />Примерни данни · не отразяват реални наличности или печалба</div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto"><DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>{REPORTS[kind]} · примерни данни</DialogDescription></DialogHeader>{selected && <dl className="delivery-details">{values(selected).map((value, index) => <div key={headers[index]}><dt>{headers[index]}</dt><dd>{value}</dd></div>)}</dl>}
      {kind === 'warehouses' && selected && <section className="min-w-0 border-t border-border pt-4" aria-label="Продукти в склада">
        <h3 className="mb-3 text-sm font-semibold">Продукти <span className="text-muted-foreground">({warehouseProducts.length})</span></h3>
        <div className="max-h-40 overflow-y-auto overscroll-contain rounded-md border border-border" role="region" aria-label="Наличности на продуктите" tabIndex={0}>
          <table className="w-full border-collapse text-xs"><thead className="sticky top-0 bg-muted text-muted-foreground"><tr><th className="px-3 py-2 text-left font-medium">Продукт / SKU</th><th className="px-3 py-2 text-right font-medium">Наличност (бр.)</th></tr></thead><tbody>{warehouseProducts.map(product => <tr key={product.id} className="border-t border-border"><td className="px-3 py-3"><div className="font-semibold">{product.name}</div><div className="mt-1 break-all text-muted-foreground">{product.sku}</div></td><td className="px-3 py-3 text-right font-semibold tabular-nums">{product.quantity}</td></tr>)}</tbody></table>
          {!warehouseProducts.length && <p className="p-3 text-muted-foreground">Няма продукти в този склад.</p>}
        </div>
      </section>}
      <div className="flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Затвори</Button></div></DialogContent></Dialog>
  </div></WorkspaceShell>;
}
