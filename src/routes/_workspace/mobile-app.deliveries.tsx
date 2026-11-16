import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye, Search, Truck, Check, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDeliveries, deliveryTransitions, processDelivery, deliveryByCode, statuses, type Status } from '@/lib/deliveries-store';
import { InventoryScanner } from '@/components/inventory-scanner';

export const Route = createFileRoute('/_workspace/mobile-app/deliveries')({
  head: () => ({ meta: [
    { title: 'HyperERP · Мобилно приложение · Доставки' },
    { name: 'description', content: 'Мобилен екран за доставки в HyperERP.' },
    { property: 'og:title', content: 'HyperERP · Мобилни доставки' },
    { property: 'og:description', content: 'Доставки в мобилното приложение на HyperERP.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: MobileDeliveries,
});

const statusClass = (status: Status) => status === 'Получена' ? 'received' : status === 'В транзит' ? 'transit' : status === 'Отказана' ? 'cancelled' : 'pending';
const date = (value: string) => value ? new Date(value + 'T12:00:00').toLocaleDateString('bg-BG') : '—';
function MobileDeliveries() {
  const rows = useDeliveries();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<Status | null>(null);
  const [notice, setNotice] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const scanDelivery = (code: string) => {
    setScanning(false); setPending(null);
    const delivery = deliveryByCode(code);
    if (delivery) { setSelectedId(delivery.id); setScanError(''); }
    else { setSearch(code); setPage(1); setStatus(''); setScanError('Няма доставка с този номер.'); }
  };
  const selected = rows.find(row => row.id === selectedId);
  const matching = rows.filter(row => `${row.id} ${row.supplier} ${row.product} ${row.warehouse}`.toLowerCase().includes(search.trim().toLowerCase()));
  const filtered = matching.filter(row => !status || row.status === status);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / (pageSize || filtered.length || 1))));
  const visible = pageSize ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize) : filtered;
  return <section className="border-t border-border py-5" aria-label="Доставки">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-base font-semibold">Доставки <span className="text-sm font-normal text-muted-foreground">{filtered.length}</span></h2><span className="text-xs text-muted-foreground">Примерни данни</span></div>
    <div className="mb-3 flex max-w-md items-center gap-2"><div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-3 text-muted-foreground"/><Input className="h-10 pl-9" aria-label="Търси доставка" placeholder="Номер, доставчик, продукт…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); setScanError(''); }}/></div><Button variant="outline" size="icon" className="h-10 w-10 shrink-0" aria-label="Сканирай доставка" title="Сканирай доставка" onClick={() => { setScanError(''); setScanning(true); }}><ScanLine/></Button></div>
    {scanError && <p role="alert" className="mb-3 text-sm text-destructive">{scanError}</p>}
    <div className="mb-4 flex flex-wrap gap-2" aria-label="Статуси на доставки">{['', ...statuses].map(value => <Button key={value} variant={status === value ? 'default' : 'outline'} size="sm" aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); }}>{value || 'Всички'} <span>{matching.filter(row => !value || row.status === value).length}</span></Button>)}</div>
    {notice && <p role="status" className="mb-4 text-sm text-primary">{notice}</p>}
    <ul aria-label="Списък с доставки" className="divide-y divide-border border-y border-border">{visible.map(row => <li key={row.id} className="py-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><Button variant="link" className="h-auto p-0 font-semibold" onClick={() => { setSelectedId(row.id); setPending(null); }}>{row.id}</Button><span className={`delivery-status ${statusClass(row.status)}`}><span/>{row.status}</span></div>
      <p className="text-sm font-semibold break-words">{row.supplier}</p><p className="mt-1 text-xs text-muted-foreground break-words">{row.warehouse}</p>
      <div className="mt-3 flex items-center justify-between gap-3"><div className="min-w-0 text-sm"><p className="break-words">{row.product} · {row.quantity} бр.</p><p className="mt-1 text-xs text-muted-foreground">Очаквана: {date(row.expected)}</p></div><Button variant="outline" size="icon" aria-label={`Преглед ${row.id}`} title="Преглед и обработка" onClick={() => { setSelectedId(row.id); setPending(null); }}><Eye size={18}/></Button></div>
    </li>)}</ul>
    {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Няма намерени доставки.</p>}
    <Pagination total={filtered.length} page={currentPage} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} noun="доставки" id="mobile-deliveries-page-size"/>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) { setSelectedId(null); setPending(null); } }}><DialogContent className="max-h-[90dvh] overflow-y-auto">{selected && <>
      <DialogHeader><DialogTitle>Доставка {selected.id}</DialogTitle><DialogDescription>Примерни данни · промените не обновяват реални наличности.</DialogDescription></DialogHeader>
      <span className={`delivery-status ${statusClass(selected.status)}`}><span/>{selected.status}</span>
      <dl className="grid gap-3 text-sm">{[['Доставчик', selected.supplier], ['Склад', selected.warehouse], ['Продукт', selected.product], ['Количество', `${selected.quantity} бр.`], ['Очаквана на', date(selected.expected)], ['Получена на', date(selected.received)], ['Последна промяна', date(selected.edited)], ['Обработена от', selected.editedBy || '—']].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-3"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
      {selected.note && <p className="text-sm break-words">{selected.note}</p>}
      {pending ? <div className="border-t border-border pt-4"><p className="mb-3 text-sm">Промяна към „{pending}“ само в демонстрацията?</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setPending(null)}>Назад</Button><Button onClick={() => { processDelivery(selected.id, pending); setNotice(`${selected.id} · ${pending} — само в демонстрацията.`); setPending(null); }}><Check/>Потвърди</Button></div></div> : <div className="flex flex-wrap gap-2 border-t border-border pt-4">{deliveryTransitions(selected.status).map(next => <Button key={next} variant={next === 'Получена' ? 'default' : 'outline'} onClick={() => setPending(next)}>{next === 'В транзит' ? <Truck/> : <Check/>}{next === 'Получена' ? 'Получи доставка' : next === 'Отказана' ? 'Откажи доставка' : 'В транзит'}</Button>)}<Button variant="outline" onClick={() => setSelectedId(null)}>Затвори</Button></div>}
    </>}</DialogContent></Dialog>
    {scanning && <InventoryScanner title="Сканиране на доставка" description="Баркод или QR код с номера на доставката" manualLabel="номер на доставка" onScan={scanDelivery} onClose={() => setScanning(false)}/>}
  </section>;
}