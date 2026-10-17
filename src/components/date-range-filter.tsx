import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { todayIso } from '@/lib/demo-dates';

type Props = { id: string; from: string; to: string; onChange: (from: string, to: string) => void };

/** Shared period filter (от/до + „Днес“) used by list screens that default to the current day. */
export function DateRangeFilter({ id, from, to, onChange }: Props) {
  const today = todayIso();
  const isToday = from === today && to === today;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Период">
      <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
      <div className="field"><label htmlFor={`${id}-from`} className="sr-only">От дата</label><input id={`${id}-from`} type="date" title="От дата" value={from} max={to || undefined} onChange={e => onChange(e.target.value, to)} /></div>
      <span className="text-muted-foreground" aria-hidden>–</span>
      <div className="field"><label htmlFor={`${id}-to`} className="sr-only">До дата</label><input id={`${id}-to`} type="date" title="До дата" value={to} min={from || undefined} onChange={e => onChange(from, e.target.value)} /></div>
      <Button type="button" size="sm" variant={isToday ? 'secondary' : 'outline'} onClick={() => onChange(today, today)}>Днес</Button>
      {(from || to) && <Button type="button" size="sm" variant="ghost" onClick={() => onChange('', '')}>Всички дати</Button>}
    </div>
  );
}
