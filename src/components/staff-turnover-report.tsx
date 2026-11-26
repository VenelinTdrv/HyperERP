import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, Download, Search, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceShell } from '@/components/workspace-shell';
import { REPORTS } from '@/lib/reports-data';
import { currentMonthRange, staffTurnoverRows, turnoverOrders, type TurnoverRow } from '@/lib/staff-turnover';

const money = (value: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const bgDate = (value: string) => value ? value.split('-').reverse().join('.') : '…';

export function StaffTurnoverReport({ today = new Date() }: { today?: Date }) {
  const orders = useMemo(() => turnoverOrders(today), [today]);
  const initial = currentMonthRange(today);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const q = query.trim().toLocaleLowerCase('bg-BG');
  const people = staffTurnoverRows(orders, today, from, to);
  const rows = people.filter(row => !q || row.name.toLocaleLowerCase('bg-BG').includes(q)).sort((a, b) => b.period - a.period);
  const suggestions = people.filter(row => !q || row.name.toLocaleLowerCase('bg-BG').includes(q));
  const options = ['', ...suggestions.map(person => person.name)];
  const choose = (name: string) => { setQuery(name); setOpen(false); setActive(-1); };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { setOpen(false); setActive(-1); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    }
    const option = options[active];
    if (event.key === 'Enter' && open && option !== undefined) { event.preventDefault(); choose(option); }
  };
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!boxRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);
  useEffect(() => {
    if (active >= 0) document.getElementById(`turnover-person-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);
  const total = rows.reduce((acc, r) => ({ month: acc.month + r.month, year: acc.year + r.year, period: acc.period + r.period }), { month: 0, year: 0, period: 0 });
  const headers = ['Служител / Инфлуенсър', 'Текущ месец', 'Текуща година', 'Избран период'];
  const line = (r: Pick<TurnoverRow, 'month' | 'year' | 'period'>, name: string) => [name, money(r.month), money(r.year), money(r.period)];
  const exportCsv = () => {
    const data = [[`Избран период: ${bgDate(from)} – ${bgDate(to)}`], headers, ...rows.map(r => line(r, r.name)), line(total, 'Общо')];
    const csv = '\uFEFF' + data.map(l => l.map(v => `"${v.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'oborot-po-sluzhiteli.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const reset = () => { setFrom(initial.from); setTo(initial.to); choose(''); };
  return <WorkspaceShell active={REPORTS.staffTurnover}><div className="page-content orders-content deliveries-content">
    <div className="page-heading"><h1>{REPORTS.staffTurnover}</h1><Button variant="outline" size="icon" aria-label="Експорт в Excel" title="Експорт в Excel" onClick={exportCsv}><Download /></Button></div>
    <div className="reports-filters !grid-cols-1 min-[701px]:!grid-cols-[minmax(0,260px)_140px_140px_auto] min-[701px]:items-center min-[701px]:justify-start">
      <div className="reports-combobox" ref={boxRef}>
        <div className="search-box"><Search /><input className="search-input" role="combobox" aria-label="Търсене по служител или инфлуенсър" aria-expanded={open} aria-haspopup="listbox" aria-controls="turnover-people" aria-autocomplete="list" aria-activedescendant={open && active >= 0 ? `turnover-person-${active}` : undefined} placeholder="Всички инфлуенсъри и служители" autoComplete="off" value={query} onFocus={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setActive(-1); setOpen(true); }} onKeyDown={onKeyDown} /><Button type="button" variant="ghost" size="icon" className="reports-combobox-caret" aria-label={open ? 'Затвори списъка' : 'Отвори списъка'} title={open ? 'Затвори списъка' : 'Отвори списъка'} onClick={() => { setOpen(value => !value); setActive(-1); }}><ChevronDown /></Button></div>
        {open && <div className="reports-combobox-panel" id="turnover-people" role="listbox" aria-label="Инфлуенсъри и служители">
          <Button type="button" variant="ghost" role="option" id="turnover-person-0" aria-selected={query === ''} className={`reports-combobox-option h-auto whitespace-normal ${active === 0 ? 'is-active' : ''}`} onClick={() => choose('')}><span>Всички инфлуенсъри и служители</span></Button>
          {suggestions.map((person, index) => <Button key={person.name} type="button" variant="ghost" role="option" id={`turnover-person-${index + 1}`} aria-selected={query === person.name} className={`reports-combobox-option h-auto whitespace-normal ${active === index + 1 ? 'is-active' : ''}`} onClick={() => choose(person.name)}><span>{person.name}<small>{person.kind}</small></span></Button>)}
          {!suggestions.length && <p className="reports-combobox-empty">Няма намерени инфлуенсъри или служители.</p>}
        </div>}
      </div>
      <div className="field"><input type="date" aria-label="Период от" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} /></div>
      <div className="field"><input type="date" aria-label="Период до" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} /></div>
      <Button variant="outline" onClick={reset}><X />Изчисти</Button>
    </div>
    <section className="delivery-list" aria-label={REPORTS.staffTurnover}>
      <div className="delivery-list-heading"><h2>Избран период: {bgDate(from)} – {bgDate(to)}</h2><span className="text-muted-foreground text-xs">Оборот по минимални цени</span></div>
      <div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr>{headers.map((h, i) => <th key={h} className={i ? 'text-right' : undefined}>{h}</th>)}</tr></thead>
        <tbody>{rows.map(r => <tr key={r.name}><td><div className="font-semibold">{r.name}</div><div className="text-xs text-muted-foreground">{r.kind}</div></td><td className="text-right tabular-nums">{money(r.month)}</td><td className="text-right tabular-nums">{money(r.year)}</td><td className="text-right tabular-nums font-semibold text-primary">{money(r.period)}</td></tr>)}</tbody>
        {rows.length > 0 && <tfoot><tr className="font-bold border-t-2 border-border"><td>Общо</td><td className="text-right tabular-nums">{money(total.month)}</td><td className="text-right tabular-nums">{money(total.year)}</td><td className="text-right tabular-nums text-primary">{money(total.period)}</td></tr></tfoot>}
      </table></div>
      {!rows.length && <div className="delivery-empty"><Search size={28} /><h3>Няма намерени служители</h3><Button variant="outline" onClick={reset}>Изчисти</Button></div>}
    </section>
    <div className="demo-caption mt-4"><ShieldCheck size={13} />Примерни данни · оборот = количество × минимална цена; броят се само доставени и платени поръчки</div>
  </div></WorkspaceShell>;
}
