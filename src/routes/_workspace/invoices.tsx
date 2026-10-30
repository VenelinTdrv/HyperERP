import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { CheckCheck, Clock3, Copy, Eye, FileText, MoreVertical, Printer, Search, X, XCircle } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { filterInvoices, INVOICE_STATUSES, useInvoices, type DemoInvoice } from '@/lib/invoices-store';
import { openInvoicesPrint } from '@/lib/invoices-export';

const money = (value: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR' }).format(value);
const date = (value: string) => value.split('-').reverse().join('.');
const statusClass = (status: string) => status === 'Платена' ? 'bg-success-soft text-success' : status === 'Анулирана' ? 'bg-destructive/10 text-destructive' : 'bg-warning-soft text-warning';

export const Route = createFileRoute('/_workspace/invoices')({
  head: () => ({
    meta: [
      { title: 'Фактури | HyperERP' },
      { name: 'description', content: 'Фактури в работното пространство на HyperERP.' },
      { property: 'og:title', content: 'Фактури | HyperERP' },
      { property: 'og:description', content: 'Преглед на фактурите в HyperERP.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const invoices = useInvoices();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DemoInvoice | null>(null);
  const dated = filterInvoices(invoices, from, to, '', query);
  const filtered = filterInvoices(dated, '', '', status);
  const size = pageSize || filtered.length || 1;
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / size)));
  const visible = filtered.slice((current - 1) * size, current * size);
  const chooseStatus = (value: string) => { setStatus(value); setPage(1); };

  return (
    <WorkspaceShell active="Фактури">
      <div className="page-content orders-content deliveries-content">
        <div className="page-heading deliveries-heading"><h1>Фактури</h1>
          <div className="delivery-overview" aria-label="Обобщение на фактурите">
            {[{ label: 'Всички', value: '', icon: FileText }, { label: 'Издадена', value: 'Издадена', icon: Clock3 }, { label: 'Платена', value: 'Платена', icon: CheckCheck }, { label: 'Анулирана', value: 'Анулирана', icon: XCircle }].map(item => <Button key={item.label} variant="ghost" className={`delivery-metric ${status === item.value ? 'is-selected' : ''}`} aria-pressed={status === item.value} onClick={() => chooseStatus(item.value)}><span className={`metric-icon ${item.value ? statusClass(item.value) : ''}`}><item.icon size={14} /></span><span className="metric-copy"><span>{item.label}</span><strong>{item.value ? dated.filter(row => row.status === item.value).length : dated.length}</strong></span></Button>)}
          </div>
        </div>
        <div className="delivery-filters"><div className="delivery-filter-primary">
          <div className="search-box"><Search /><input className="search-input" aria-label="Търсене по име на клиент или ЕИК" placeholder="Клиент или ЕИК…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></div>
          <span className="text-sm text-muted-foreground">Дата на фактура</span>
          <div className="field"><label className="sr-only" htmlFor="invoice-from">Дата от</label><input id="invoice-from" type="date" title="Дата от" value={from} max={to || undefined} onChange={e => { setFrom(e.target.value); setPage(1); }} /></div>
          <span className="text-sm text-muted-foreground">—</span>
          <div className="field"><label className="sr-only" htmlFor="invoice-to">Дата до</label><input id="invoice-to" type="date" title="Дата до" value={to} min={from || undefined} onChange={e => { setTo(e.target.value); setPage(1); }} /></div>
          <div className="field"><label className="sr-only" htmlFor="invoice-status">Статус</label><select id="invoice-status" value={status} onChange={e => chooseStatus(e.target.value)}><option value="">Всички статуси</option>{INVOICE_STATUSES.map(value => <option key={value}>{value}</option>)}</select></div>
          {(from || to || status || query) && <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo(''); setQuery(''); chooseStatus(''); }}><X />Изчисти филтрите</Button>}
        </div></div>
        <section className="delivery-list" aria-label="Списък с фактури">
          <div className="delivery-list-heading"><h2>Фактури <span>{filtered.length}</span></h2></div>
          <div className="delivery-table-scroll">
            <table className="delivery-table orders-table">
              <thead><tr>
                <th>Фактура №</th><th>Дата</th><th>Статус</th><th>Клиент</th><th>Поръчка</th><th>Общо с ДДС</th>
                <th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th>
              </tr></thead>
              <tbody>{visible.map(invoice => <tr key={invoice.id}>
                <td><Button variant="link" className="delivery-id" onClick={() => setSelected(invoice)}>{invoice.id}</Button></td>
                <td>{date(invoice.date)}</td><td><span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${statusClass(invoice.status)}`}>{invoice.status}</span></td><td>{invoice.sale.customer}{invoice.sale.eik && <span className="delivery-cell-sub block">ЕИК {invoice.sale.eik}</span>}</td><td>{invoice.sale.id}</td><td className="font-semibold">{money(invoice.total)}</td>
                <td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия ${invoice.id}`} title="Действия"><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => { void navigator.clipboard.writeText(invoice.id); }}><Copy />Копирай номер</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
                <td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${invoice.id}`} title="Преглед" onClick={() => setSelected(invoice)}><Eye /></Button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
          {!filtered.length && <div className="delivery-empty"><FileText size={28} /><h3>Няма фактури за избраните филтри</h3></div>}
          <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="invoices-page-size" />
        </section>
        <p className="demo-caption mt-4">Примерни фактури · само за текущата сесия · не са официални счетоводни документи</p>
      </div>
      <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Фактура {selected?.id}</DialogTitle><DialogDescription>Примерна фактура · не е официален счетоводен документ</DialogDescription></DialogHeader>
          {selected && <>
            <dl className="delivery-details">{[['Дата', date(selected.date)], ['Статус', selected.status], ['Продажба / Поръчка', selected.sale.id], ['Клиент', selected.sale.customer], ...(selected.sale.eik ? [['ЕИК', selected.sale.eik]] : []), ['Телефон', selected.sale.phone], ['Населено място', selected.sale.city], ['Адрес / офис', selected.sale.address]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>Продукт</th><th>Количество</th><th>Цена</th><th>Сума</th></tr></thead><tbody><tr><td>{selected.sale.product}</td><td>{selected.sale.quantity}</td><td>{money(selected.sale.price)}</td><td>{money(selected.sale.quantity * selected.sale.price)}</td></tr></tbody></table></div>
            <dl className="delivery-details"><div><dt>Доставка</dt><dd>{money(selected.sale.shipping)}</dd></div><div><dt>Общо с ДДС</dt><dd>{money(selected.total)}</dd></div></dl>
          </>}
          <div className="flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Затвори</Button></div>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}