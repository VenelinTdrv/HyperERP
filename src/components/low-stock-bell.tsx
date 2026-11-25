import { useSyncExternalStore } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { lowStockSnapshot, lowStockSubscribe, markNoticeRead, LOW_STOCK_WAREHOUSE } from '@/lib/low-stock';

export function LowStockBell() {
  const { notices } = useSyncExternalStore(lowStockSubscribe, lowStockSnapshot, lowStockSnapshot);
  const unread = notices.filter(n => !n.read).length;
  return <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" className="relative" aria-label={`Известия${unread ? ` (${unread} непрочетени)` : ''}`} title="Известия"><Bell size={17} />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">{unread}</span>}</Button></PopoverTrigger>
    <PopoverContent align="end" className="w-80 p-0"><div className="flex items-center justify-between border-b border-border px-3 py-2"><strong className="text-sm">Известия</strong><Button variant="ghost" size="sm" disabled={!unread} onClick={() => markNoticeRead()}>Маркирай всички</Button></div>
      <div className="max-h-80 overflow-y-auto">{notices.map(n => <div key={n.id} className={`border-b border-border px-3 py-2 text-xs ${n.read ? 'opacity-60' : ''}`}>
        <div className="flex justify-between gap-2"><strong className={n.kind === 'out' ? 'text-destructive' : 'text-warning'}>{n.kind === 'out' ? 'Изчерпана свободна наличност' : 'Намаляваща наличност'}</strong>{!n.read && <button type="button" className="text-primary hover:underline" onClick={() => markNoticeRead(n.id)}>Прочетено</button>}</div>
        <Link to="/reports/low-stock" search={{ sku: n.sku }} className="font-semibold text-primary hover:underline" onClick={() => markNoticeRead(n.id)}>{n.name}</Link>
        <div className="text-muted-foreground">Склад: {LOW_STOCK_WAREHOUSE} · Общо: {n.reference} бр. · Резервирани: {n.reserved} бр. · Свободни: {n.free} бр. ({n.percent}%)</div>
      </div>)}{!notices.length && <p className="p-3 text-xs text-muted-foreground">Няма нови известия.</p>}</div>
    </PopoverContent></Popover>;
}
