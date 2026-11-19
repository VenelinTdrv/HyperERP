import { useState } from 'react';
import { Download, Eye, MoreVertical, Search, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { REPORTS, REPORT_VIRTUAL_WAREHOUSES, virtualOrderSalesTotal, virtualOrderTotal, virtualWarehouseClientKey, virtualWarehouseClientOrderCounts, virtualWarehouseClientTotals, virtualWarehouseOrders, type VirtualWarehouseOrder } from '@/lib/reports-data';

const money = (value: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR' }).format(value);
const headers = ['Клиент', 'Телефон', 'Брой поръчки', 'Поръчка', 'Виртуален склад', 'Статус', 'Минимална цена', 'Продажна цена'];
const values = (order: VirtualWarehouseOrder, orderCount: number) => [order.client, order.phone, String(orderCount), order.orderNumber, order.warehouse, order.status, money(virtualOrderTotal(order)), money(virtualOrderSalesTotal(order))];

function exportOrders(orders: VirtualWarehouseOrder[], counts = virtualWarehouseClientOrderCounts(orders)) {
  const csv = '\uFEFF' + [headers, ...orders.map(order => values(order, counts.get(virtualWarehouseClientKey(order)) ?? 0))].map(line => line.map(value => `"${value.replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'spravka-virtualni-skladowe.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function VirtualWarehouseOrders() {
  const [query, setQuery] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<VirtualWarehouseOrder | null>(null);
  const rows = virtualWarehouseOrders(query, warehouse);
  const clientTotals = virtualWarehouseClientTotals(rows);
  const orderCounts = virtualWarehouseClientOrderCounts(rows);
  const size = pageSize || rows.length || 1;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / size)));
  const shown = rows.slice((currentPage - 1) * size, currentPage * size);
  const clear = () => { setQuery(''); setWarehouse(''); setPage(1); };

  return <WorkspaceShell active={REPORTS.virtual}><div className="page-content orders-content deliveries-content">
    <div className="page-heading"><div><h1>{REPORTS.virtual}</h1><p>Излезли от склада и неприключени поръчки</p></div><Button variant="outline" size="icon" aria-label="Експорт в CSV" title="Експорт в CSV" onClick={() => exportOrders(rows)}><Download /></Button></div>
    <div className="reports-filters"><div className="search-box"><Search /><input className="search-input" aria-label="Търсене по име на клиент или телефон" placeholder="Име на клиент или телефон…" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></div><div className="field"><select aria-label="Склад" value={warehouse} onChange={event => { setWarehouse(event.target.value); setPage(1); }}><option value="">Всички виртуални складове</option>{REPORT_VIRTUAL_WAREHOUSES.map(name => <option key={name}>{name}</option>)}</select></div><Button variant="outline" disabled={!query && !warehouse} onClick={clear}><X />Изчисти</Button></div>
    {clientTotals.length > 0 && <section aria-label="Общи суми по клиенти" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {clientTotals.map(total => <article key={`${total.client}-${total.phone}`} className="rounded-md border border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-semibold">{total.client}</h2><span className="text-xs text-muted-foreground">{total.orderCount} поръчки</span></div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><div className="text-xs text-muted-foreground">Общо по минимални цени</div><div className="mt-1 font-semibold text-primary">{money(total.minimumTotal)}</div></div><div><div className="text-xs text-muted-foreground">Общо по продажни цени</div><div className="mt-1 font-semibold text-primary">{money(total.salesTotal)}</div></div></div>
      </article>)}
    </section>}
    <section className="delivery-list" aria-label={REPORTS.virtual}><div className="delivery-list-heading"><h2>Поръчки <span>{rows.length}</span></h2><span className="text-muted-foreground text-xs">Обща минимална стойност: <strong className="text-primary">{money(rows.reduce((sum, order) => sum + virtualOrderTotal(order), 0))}</strong> · Обща продажна стойност: <strong className="text-primary">{money(rows.reduce((sum, order) => sum + virtualOrderSalesTotal(order), 0))}</strong></span></div>
      <div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}<th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th></tr></thead><tbody>{shown.map(order => <tr key={order.orderNumber}><td><span className="client-name">{order.client}</span></td><td>{order.phone}</td><td className="font-semibold">{orderCounts.get(virtualWarehouseClientKey(order)) ?? 0}</td><td><button type="button" className="font-semibold text-primary hover:underline" aria-label={`Преглед на поръчка ${order.orderNumber}`} onClick={() => setSelected(order)}>{order.orderNumber}</button></td><td>{order.warehouse}</td><td>{order.status}</td><td className="font-semibold text-primary">{money(virtualOrderTotal(order))}</td><td className="font-semibold text-primary">{money(virtualOrderSalesTotal(order))}</td><td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${order.orderNumber}`} title="Действия"><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => exportOrders([order], orderCounts)}><Download />Експорт в CSV</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td><td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${order.orderNumber}`} title="Преглед" onClick={() => setSelected(order)}><Eye /></Button></div></td></tr>)}</tbody></table></div>
      {!rows.length && <div className="delivery-empty"><Search size={28} /><h3>Няма намерени поръчки</h3><Button variant="outline" onClick={clear}>Изчисти</Button></div>}
      <Pagination total={rows.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="reports-virtual-page-size" />
    </section><div className="demo-caption mt-4"><ShieldCheck size={13} />Примерни поръчки · не отразяват реални поръчки или наличности</div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>Поръчка {selected?.orderNumber}</DialogTitle><DialogDescription>{selected?.client} · примерни данни</DialogDescription></DialogHeader>{selected && <>
      <dl className="delivery-details reports-summary"><div><dt>Клиент</dt><dd>{selected.client}</dd></div><div><dt>Телефон</dt><dd>{selected.phone}</dd></div><div><dt>Брой поръчки</dt><dd className="font-semibold">{orderCounts.get(virtualWarehouseClientKey(selected)) ?? 0}</dd></div><div><dt>Поръчка</dt><dd>{selected.orderNumber}</dd></div><div><dt>Виртуален склад</dt><dd>{selected.warehouse}</dd></div><div><dt>Статус</dt><dd>{selected.status}</dd></div><div><dt>Сума по минимални цени</dt><dd className="text-primary">{money(virtualOrderTotal(selected))}</dd></div><div><dt>Продажна цена</dt><dd className="text-primary">{money(virtualOrderSalesTotal(selected))}</dd></div></dl>
      <section className="min-w-0 border-t border-border pt-4" aria-label={`Съдържание на поръчка ${selected.orderNumber}`}><h3 className="mb-3 text-sm font-semibold">Съдържание <span className="text-muted-foreground">({selected.items.length})</span></h3><div className="delivery-table-scroll rounded-md border border-border"><table className="delivery-table orders-table"><thead><tr><th>Продукт / SKU</th><th>Количество</th><th>Минимална цена</th><th>Продажна цена</th><th>Сума</th></tr></thead><tbody>{selected.items.map(item => <tr key={item.sku}><td><div className="font-semibold">{item.name}</div><div className="mt-1 break-all text-muted-foreground">{item.sku}</div></td><td>{item.quantity} бр.</td><td>{money(item.minimumPrice)}</td><td>{money(item.salesPrice)}</td><td className="font-semibold text-primary">{money(item.quantity * item.salesPrice)}</td></tr>)}</tbody><tfoot><tr><td colSpan={4} className="text-right font-semibold">Общо по продажни цени</td><td className="font-semibold text-primary">{money(virtualOrderSalesTotal(selected))}</td></tr></tfoot></table></div></section>
    </>}<div className="flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Затвори</Button></div></DialogContent></Dialog>
  </div></WorkspaceShell>;
}
