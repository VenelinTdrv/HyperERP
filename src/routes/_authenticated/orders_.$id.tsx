import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, FileSpreadsheet, FileText, Plus, Printer, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { CATALOG, ORDER_STATUSES, PAYMENT_METHODS, type Order, type OrderStatus, type PaymentMethod, saveOrder, subtotal, total, useOrders } from '@/lib/orders-store';
import { downloadOrderBlankPdf, openOrderBlank } from '@/lib/order-blank';
import { downloadOrderXls } from '@/lib/order-export';

export const Route = createFileRoute('/_authenticated/orders_/$id')({
  head: ({ params }) => ({ meta: [
    { title: `HyperERP · Поръчка ${params.id}` },
    { name: 'description', content: 'Преглед и редакция на поръчка, продукти, цени и статус в HyperERP.' },
    { property: 'og:title', content: `HyperERP · Поръчка ${params.id}` },
    { property: 'og:description', content: 'Редакция на поръчка и смяна на статуса.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: OrderScreen,
});

const money = (v: number) => `${v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const statusClass: Record<OrderStatus, string> = { 'Необработена': 'pending', 'Обработена': 'received', 'Анулирана': 'cancelled' };

function OrderScreen() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const orders = useOrders();
  const original = orders.find(o => o.id === id);
  const [draft, setDraft] = useState<Order | null>(original ?? null);
  const [errors, setErrors] = useState<Partial<Record<'customer'|'phone'|'city'|'address'|'items'|'shipping', string>>>({});
  useEffect(() => { setDraft(original ?? null); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!original || !draft) return <WorkspaceShell active="Поръчки"><div className="page-content"><h1>Поръчката не е намерена</h1><Button asChild variant="outline" className="mt-4"><Link to="/orders"><ArrowLeft />Към поръчките</Link></Button></div></WorkspaceShell>;

  const locked = original.status === 'Анулирана';
  const set = <K extends keyof Order>(k: K, v: Order[K]) => setDraft(d => d && { ...d, [k]: v });
  const setItem = (i: number, patch: Partial<Order['items'][number]>) => set('items', draft.items.map((it, n) => n === i ? { ...it, ...patch } : it));
  const addItem = () => { const free = CATALOG.find(c => !draft.items.some(i => i.sku === c.sku)); if (free) set('items', [...draft.items, { ...free, quantity: 1 }]); };
  const save = () => {
    const e: typeof errors = {};
    if (!draft.customer.trim()) e.customer = 'Въведете клиент.';
    if (!/^[0-9 +]{6,}$/.test(draft.phone.trim())) e.phone = 'Въведете валиден телефон.';
    if (!draft.city.trim()) e.city = 'Въведете населено място.';
    if (!draft.address.trim()) e.address = 'Въведете адрес или офис.';
    if (draft.items.length === 0) e.items = 'Добавете поне един продукт.';
    if (draft.items.some(i => !(i.quantity >= 1) || !(i.price >= 0))) e.items = 'Количеството трябва да е поне 1, а цената не може да е отрицателна.';
    if (!(draft.shipping >= 0)) e.shipping = 'Невалидна цена за доставка.';
    setErrors(e);
    if (Object.keys(e).length) return;
    saveOrder(draft);
    toast.success(`Поръчка ${draft.id} е обновена (демо, без реално записване).`);
    if (draft.status !== 'Необработена') navigate({ to: '/orders' });
  };
  const field = (k: 'customer' | 'phone' | 'city' | 'address', label: string) => <div className="field"><label htmlFor={`o-${k}`}>{label}</label><input id={`o-${k}`} disabled={locked} value={draft[k]} aria-invalid={!!errors[k]} onChange={e => set(k, e.target.value)} />{errors[k] && <span className="text-destructive text-xs">{errors[k]}</span>}</div>;

  return <WorkspaceShell active="Поръчки"><div className="page-content deliveries-content order-detail">
    <div className="page-heading"><div><Link to="/orders" className="text-xs text-muted-foreground inline-flex items-center gap-1"><ArrowLeft size={13} />Поръчки</Link><h1>Поръчка {draft.id}</h1><p>Създадена на {new Date(`${draft.created}T12:00:00`).toLocaleDateString('bg-BG')} · <span className={`delivery-status ${statusClass[original.status]}`}><span />{original.status}</span></p></div>
      <div className="flex gap-2 flex-wrap items-end">
        <div className="field"><label htmlFor="o-status">Статус</label><select id="o-status" value={draft.status} disabled={locked} onChange={e => set('status', e.target.value as OrderStatus)}>{ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
        <Button variant="outline" size="icon" onClick={() => openOrderBlank(draft)} aria-label="Печат" title="Печат"><Printer /></Button>
        <Button variant="outline" size="icon" onClick={() => downloadOrderBlankPdf(draft)} aria-label="Експорт в PDF" title="Експорт в PDF"><FileText className="text-destructive" /></Button>
        <Button variant="outline" size="icon" onClick={() => downloadOrderXls(draft)} aria-label="Експорт в XLS" title="Експорт в XLS"><FileSpreadsheet className="text-primary" /></Button>
        <Button variant="outline" asChild><Link to="/orders">Отказ</Link></Button>
        <Button onClick={save} disabled={locked}><Save />Запази</Button>
      </div></div>
    {locked && <p className="text-sm text-muted-foreground mb-4">Анулираните поръчки не могат да се редактират.</p>}
    <section className="delivery-list order-detail-client" aria-label="Клиент и доставка"><h2 className="font-semibold">Клиент и доставка</h2><div className="delivery-editor-grid">
      {field('customer', 'Клиент')}{field('phone', 'Телефон')}{field('city', 'Населено място')}{field('address', 'Адрес / офис')}
      <div className="field"><label htmlFor="o-courier">Куриер</label><select id="o-courier" disabled={locked} value={draft.courier} onChange={e => set('courier', e.target.value)}><option>Еконт</option><option>Спиди</option></select></div>
      <div className="field"><label htmlFor="o-payment">Метод на плащане</label><select id="o-payment" disabled={locked} value={draft.payment} onChange={e => set('payment', e.target.value as PaymentMethod)}>{PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
      <div className="field order-detail-note"><label htmlFor="o-note">Бележка</label><input id="o-note" disabled={locked} value={draft.note} onChange={e => set('note', e.target.value)} placeholder="Вътрешна бележка…" /></div>
    </div></section>
    <section className="delivery-list" aria-label="Продукти"><div className="delivery-list-heading"><h2>Продукти <span>{draft.items.length}</span></h2><Button variant="outline" size="sm" disabled={locked || draft.items.length >= CATALOG.length} onClick={addItem}><Plus />Добави продукт</Button></div>
      <div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>Продукт</th><th>SKU</th><th>Количество</th><th>Ед. цена (€)</th><th className="text-right">Сума</th><th /></tr></thead><tbody>
        {draft.items.map((it, i) => <tr key={i}>
          <td><select aria-label="Продукт" disabled={locked} className="border rounded px-2 py-1 bg-card" value={it.sku} onChange={e => { const c = CATALOG.find(x => x.sku === e.target.value)!; setItem(i, { sku: c.sku, name: c.name, price: c.price }); }}>{CATALOG.filter(c => c.sku === it.sku || !draft.items.some(x => x.sku === c.sku)).map(c => <option key={c.sku} value={c.sku}>{c.name}</option>)}</select></td>
          <td className="text-muted-foreground">{it.sku}</td>
          <td><input aria-label={`Количество ${it.name}`} type="number" min={1} disabled={locked} className="w-20 border rounded px-2 py-1 bg-card" value={it.quantity} onChange={e => setItem(i, { quantity: Number(e.target.value) })} /></td>
          <td><input aria-label={`Цена ${it.name}`} type="number" min={0} step="0.01" disabled={locked} className="w-24 border rounded px-2 py-1 bg-card" value={it.price} onChange={e => setItem(i, { price: Number(e.target.value) })} /></td>
          <td className="text-right font-semibold">{money(it.quantity * it.price)}</td>
          <td className="text-right"><Button variant="ghost" size="icon" disabled={locked} aria-label={`Премахни ${it.name}`} onClick={() => set('items', draft.items.filter((_, n) => n !== i))}><Trash2 /></Button></td>
        </tr>)}
      </tbody></table></div>
      {errors.items && <p className="text-destructive text-xs px-5 py-2">{errors.items}</p>}
      <dl className="delivery-details order-detail-totals"><div><dt>Междинна сума</dt><dd>{money(subtotal(draft))}</dd></div>
        <div><dt><label htmlFor="o-ship">Доставка (€)</label></dt><dd><input id="o-ship" type="number" min={0} step="0.01" disabled={locked} className="w-24 border rounded px-2 py-1 bg-card" value={draft.shipping} onChange={e => set('shipping', Number(e.target.value))} />{errors.shipping && <span className="text-destructive text-xs block">{errors.shipping}</span>}</dd></div>
        <div><dt>Общо с ДДС</dt><dd className="text-base">{money(total(draft))}</dd></div></dl>
    </section>
    <div className="demo-caption mt-4"><ShieldCheck size={13} />Примерна поръчка · промените не се записват реално</div>
  </div></WorkspaceShell>;
}
