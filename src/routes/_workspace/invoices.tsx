import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, FileText, MoreVertical } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useInvoices, type DemoInvoice } from '@/lib/invoices-store';

const money = (value: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR' }).format(value);
const date = (value: string) => value.split('-').reverse().join('.');

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
  const [selected, setSelected] = useState<DemoInvoice | null>(null);
  const size = pageSize || invoices.length || 1;
  const current = Math.min(page, Math.max(1, Math.ceil(invoices.length / size)));
  const visible = invoices.slice((current - 1) * size, current * size);

  return (
    <WorkspaceShell active="Фактури">
      <div className="page-content orders-content deliveries-content">
        <div className="page-heading"><h1>Фактури</h1></div>
        <section className="delivery-list" aria-label="Списък с фактури">
          <div className="delivery-list-heading"><h2>Фактури <span>{invoices.length}</span></h2></div>
          <div className="delivery-table-scroll">
            <table className="delivery-table orders-table">
              <thead><tr>
                <th>Фактура №</th><th>Дата</th><th>Клиент</th><th>Поръчка</th><th>Общо с ДДС</th>
                <th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th>
              </tr></thead>
              <tbody>{visible.map(invoice => <tr key={invoice.id}>
                <td><Button variant="link" className="delivery-id" onClick={() => setSelected(invoice)}>{invoice.id}</Button></td>
                <td>{date(invoice.date)}</td><td>{invoice.sale.customer}</td><td>{invoice.sale.id}</td><td className="font-semibold">{money(invoice.total)}</td>
                <td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия ${invoice.id}`} title="Действия"><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setSelected(invoice)}><FileText />Преглед на фактурата</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
                <td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${invoice.id}`} title="Преглед" onClick={() => setSelected(invoice)}><Eye /></Button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
          {!invoices.length && <div className="delivery-empty"><FileText size={28} /><h3>Няма фактури</h3></div>}
          <Pagination total={invoices.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="invoices-page-size" />
        </section>
        <p className="demo-caption mt-4">Примерни фактури · само за текущата сесия · не са официални счетоводни документи</p>
      </div>
      <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Фактура {selected?.id}</DialogTitle><DialogDescription>Примерна фактура · не е официален счетоводен документ</DialogDescription></DialogHeader>
          {selected && <>
            <dl className="delivery-details">{[['Дата', date(selected.date)], ['Продажба / Поръчка', selected.sale.id], ['Клиент', selected.sale.customer], ['Телефон', selected.sale.phone], ['Населено място', selected.sale.city], ['Адрес / офис', selected.sale.address]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>Продукт</th><th>Количество</th><th>Цена</th><th>Сума</th></tr></thead><tbody><tr><td>{selected.sale.product}</td><td>{selected.sale.quantity}</td><td>{money(selected.sale.price)}</td><td>{money(selected.sale.quantity * selected.sale.price)}</td></tr></tbody></table></div>
            <dl className="delivery-details"><div><dt>Доставка</dt><dd>{money(selected.sale.shipping)}</dd></div><div><dt>Общо с ДДС</dt><dd>{money(selected.total)}</dd></div></dl>
          </>}
          <div className="flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Затвори</Button></div>
        </DialogContent>
      </Dialog>
    </WorkspaceShell>
  );
}