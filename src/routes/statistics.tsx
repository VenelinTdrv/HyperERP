import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { CalendarDays, CheckCircle2, ChevronDown, Info, Package, RotateCcw, ShieldCheck, ShoppingBag, Wallet } from 'lucide-react';
import { endOfMonth, format, startOfDay, startOfMonth, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/statistics')({
  head: () => ({ meta: [
    { title: 'HyperERP · Статистика' },
    { name: 'description', content: 'Статистика за поръчки, продажби, среден брой артикули и средна цена на поръчка с избор на период от календара.' },
    { property: 'og:title', content: 'HyperERP · Статистика' },
    { property: 'og:description', content: 'Цифрова и графична статистика с избор на период, инфлуенсър, търговец и населено място.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Statistics,
});

const SELLERS = [
  { id: 'Виктория Григорова', type: 'Инфлуенсър', weight: 0.38 },
  { id: 'Елена Петрова', type: 'Инфлуенсър', weight: 0.27 },
  { id: 'Мария Иванова', type: 'Инфлуенсър', weight: 0.2 },
  { id: 'Козметик Груп ООД', type: 'Търговец на едро', weight: 0.15 },
] as const;
// Demo settlement weights, matching the nomenclature on /settlements
const SETTLEMENTS = [
  { id: 'Ямбол', weight: 0.22 },
  { id: 'София', weight: 0.18 },
  { id: 'Пловдив', weight: 0.13 },
  { id: 'Варна', weight: 0.12 },
  { id: 'Бургас', weight: 0.09 },
  { id: 'Ловеч', weight: 0.07 },
  { id: 'Шумен', weight: 0.06 },
  { id: 'Стралджа', weight: 0.05 },
  { id: 'Казанлък', weight: 0.04 },
  { id: 'Велинград', weight: 0.04 },
] as const;

// Demo data exists only inside this window; the calendar cannot leave it.
const DEMO_FROM = new Date(2025, 0, 1);
const DEMO_TO = new Date(2026, 9, 31);
const DEFAULT_PERIOD = { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) };
const MONTH_SHORT = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];
// Weekday demand profile, Sunday first
const DAY_WEIGHT = [0.62, 1.14, 1.1, 1.06, 1, 0.92, 0.74];
const BASE_MONTHS: Record<string, number> = {
  '2025-10': 182, '2025-11': 264, '2026-0': 151, '2026-1': 176, '2026-2': 205, '2026-3': 219,
  '2026-4': 240, '2026-5': 228, '2026-6': 211, '2026-7': 233, '2026-8': 248, '2026-9': 196,
};

const PRESETS = [
  { id: 'this', label: 'Този месец' },
  { id: 'last', label: 'Миналия месец' },
  { id: '3', label: '3 месеца' },
  { id: '6', label: '6 месеца' },
  { id: '12', label: '12 месеца' },
  { id: 'ytd', label: 'Тази година' },
];

type Seller = (typeof SELLERS)[number];
type DayRow = { d: Date; orders: number; paid: number; returned: number; items: number; revenue: number };

const money = (v: number) => `${v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const fmt = (d: Date) => format(d, 'dd.MM.yyyy');
const minD = (a: Date, b: Date) => (+a <= +b ? a : b);
const maxD = (a: Date, b: Date) => (+a >= +b ? a : b);
// Demo history stops at 31.10.2026, so presets are anchored there once real time passes it.
const TODAY = +new Date() > +DEMO_TO ? DEMO_TO : new Date();

function presetRange(id: string): { from: Date; to: Date } {
  const to = minD(endOfMonth(TODAY), DEMO_TO);
  if (id === 'last') { const p = subMonths(TODAY, 1); return { from: maxD(startOfMonth(p), DEMO_FROM), to: minD(endOfMonth(p), DEMO_TO) }; }
  if (id === '3') return { from: maxD(startOfMonth(subMonths(TODAY, 2)), DEMO_FROM), to };
  if (id === '6') return { from: maxD(startOfMonth(subMonths(TODAY, 5)), DEMO_FROM), to };
  if (id === '12') return { from: maxD(startOfMonth(subMonths(TODAY, 11)), DEMO_FROM), to };
  if (id === 'ytd') return { from: maxD(new Date(TODAY.getFullYear(), 0, 1), DEMO_FROM), to };
  return { from: maxD(startOfMonth(TODAY), DEMO_FROM), to };
}

function monthTotal(y: number, m: number) {
  const known = BASE_MONTHS[`${y}-${m}`];
  if (known != null) return known;
  return 170 + ((y * 7 + m * 13 + 5) % 96);
}

// Deterministic demo days for one seller (and optionally one settlement)
function buildDays(s: Seller, k: number, st: { weight: number } | null): DayRow[] {
  const out: DayRow[] = [];
  const y0 = DEMO_FROM.getFullYear(), m0 = DEMO_FROM.getMonth();
  const y1 = DEMO_TO.getFullYear(), m1 = DEMO_TO.getMonth();
  const wholesale = s.type === 'Търговец на едро';
  for (let y = y0; y <= y1; y++) {
    for (let m = y === y0 ? m0 : 0; m <= (y === y1 ? m1 : 11); m++) {
      const dim = new Date(y, m + 1, 0).getDate();
      const f: number[] = [];
      let sum = 0;
      for (let d = 1; d <= dim; d++) {
        const v = DAY_WEIGHT[new Date(y, m, d).getDay()]! * (0.9 + ((d * 13 + m * 7 + y * 3) % 11) * 0.02);
        f.push(v);
        sum += v;
      }
      const sf = st ? st.weight * (0.92 + ((m * 7 + k * 3) % 5) * 0.04) : 1;
      const total = monthTotal(y, m) * s.weight * sf * (wholesale ? 0.5 : 1);
      const per = wholesale ? 6.5 + (m % 3) * 0.4 : 1.6 + ((m + k) % 4) * 0.15;
      const retRate = 0.04 + ((m + k) % 5) * 0.012;
      const price = 44 + ((m * 3 + k) % 6) * 2.5;
      for (let d = 1; d <= dim; d++) {
        const o = Math.round((total * f[d - 1]!) / sum);
        const r = Math.round(o * retRate);
        const unp = Math.round(o * 0.06);
        out.push({ d: new Date(y, m, d), orders: o, paid: Math.max(0, o - r - unp), returned: r, items: Math.round(o * per), revenue: Math.round(o * per * price) });
      }
    }
  }
  return out;
}

function pickSellers(type: string, seller: string): Seller[] {
  return seller ? SELLERS.filter(s => s.id === seller) : type ? SELLERS.filter(s => s.type === type) : [...SELLERS];
}

const ordersCfg = { paid: { label: 'Платени', color: 'var(--primary)' }, returned: { label: 'Върнати', color: 'var(--destructive)' }, orders: { label: 'Всички', color: 'var(--info)' } } satisfies ChartConfig;
const salesCfg = { paid: { label: 'Продажби (платени)', color: 'var(--primary)' } } satisfies ChartConfig;
const itemsCfg = { avgItems: { label: 'Ср. артикули', color: 'var(--info)' } } satisfies ChartConfig;
const priceCfg = { avgPrice: { label: 'Ср. цена', color: 'var(--warning)' } } satisfies ChartConfig;
const returnCfg = { returnPct: { label: '% върнати', color: 'var(--destructive)' } } satisfies ChartConfig;

function Statistics() {
  const [type, setType] = useState('');
  const [seller, setSeller] = useState('');
  const [settlement, setSettlement] = useState('');
  const [from, setFrom] = useState(DEFAULT_PERIOD.from);
  const [to, setTo] = useState(DEFAULT_PERIOD.to);
  const [open, setOpen] = useState(false);
  const options = SELLERS.filter(s => !type || s.type === type);

  const days = useMemo(() => {
    const st = settlement ? SETTLEMENTS.find(x => x.id === settlement) ?? null : null;
    const map = new Map<number, DayRow>();
    pickSellers(type, seller).forEach((s, k) => buildDays(s, k, st).forEach(p => {
      const key = +p.d;
      const cur = map.get(key) ?? { d: p.d, orders: 0, paid: 0, returned: 0, items: 0, revenue: 0 };
      cur.orders += p.orders; cur.paid += p.paid; cur.returned += p.returned; cur.items += p.items; cur.revenue += p.revenue;
      map.set(key, cur);
    }));
    return [...map.values()].sort((a, b) => +a.d - +b.d);
  }, [type, seller, settlement]);

  const period = useMemo(() => {
    const f = +from, t = +to;
    let orders = 0, paid = 0, returned = 0, items = 0, revenue = 0, count = 0;
    for (const p of days) if (+p.d >= f && +p.d <= t) { orders += p.orders; paid += p.paid; returned += p.returned; items += p.items; revenue += p.revenue; count++; }
    return {
      orders, paid, returned, items, revenue, daysCount: count,
      returnPct: orders ? +(returned / orders * 100).toFixed(1) : 0,
      avgItems: orders ? +(items / orders).toFixed(2) : 0,
      avgPrice: orders ? +(revenue / orders).toFixed(2) : 0,
    };
  }, [days, from, to]);

  // Monthly trend always covers the 12 months ending with the period's last month
  const data = useMemo(() => {
    const endKey = +new Date(to.getFullYear(), to.getMonth(), 1);
    const byMonth = new Map<number, DayRow & { y: number; m: number }>();
    for (const p of days) {
      const y = p.d.getFullYear(), m = p.d.getMonth(), key = +new Date(y, m, 1);
      if (key > endKey) continue;
      const cur = byMonth.get(key) ?? { d: new Date(y, m, 1), y, m, orders: 0, paid: 0, returned: 0, items: 0, revenue: 0 };
      cur.orders += p.orders; cur.paid += p.paid; cur.returned += p.returned; cur.items += p.items; cur.revenue += p.revenue;
      byMonth.set(key, cur);
    }
    return [...byMonth.values()].sort((a, b) => a.y - b.y || a.m - b.m).slice(-12).map(r => ({
      month: `${MONTH_SHORT[r.m]} ${String(r.y).slice(2)}`,
      orders: r.orders, paid: r.paid, returned: r.returned, items: r.items, revenue: r.revenue,
      returnPct: r.orders ? +(r.returned / r.orders * 100).toFixed(1) : 0,
      avgItems: r.orders ? +(r.items / r.orders).toFixed(2) : 0,
      avgPrice: r.orders ? +(r.revenue / r.orders).toFixed(2) : 0,
    }));
  }, [days, to]);

  const settlementStats = useMemo(() => {
    const sellers = pickSellers(type, seller);
    const f = +from, t = +to;
    const rows = SETTLEMENTS.map(st => ({ id: st.id, orders: sellers.reduce((a, s, k) => a + buildDays(s, k, st).reduce((b, p) => b + (+p.d >= f && +p.d <= t ? p.orders : 0), 0), 0) }));
    const total = rows.reduce((a, r) => a + r.orders, 0);
    return Object.fromEntries(rows.map(r => [r.id, { orders: r.orders, pct: total ? (r.orders / total * 100).toFixed(1) : '0' }])) as Record<string, { orders: number; pct: string }>;
  }, [type, seller, from, to]);

  const paidPct = period.orders ? (period.paid / period.orders * 100).toFixed(1) : '0';
  const activePreset = PRESETS.find(p => { const r = presetRange(p.id); return +r.from === +from && +r.to === +to; })?.id;
  const windowLabel = data.length ? `${data[0]!.month} – ${data[data.length - 1]!.month}` : '';
  const kpis = [
    { icon: ShoppingBag, label: 'Брой поръчки', value: period.orders.toString(), sub: `${period.paid} платени · ${period.returned} върнати (${period.returnPct}%)` },
    { icon: CheckCircle2, label: 'Брой продажби (платени)', value: period.paid.toString(), sub: `${paidPct}% от всички поръчки` },
    { icon: Package, label: 'Среден брой артикули', value: period.avgItems.toLocaleString('bg-BG'), sub: `${period.items} артикула общо` },
    { icon: Wallet, label: 'Средна цена на поръчка', value: money(period.avgPrice), sub: `Оборот ${money(period.revenue)}` },
  ];
  const axis = <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />;

  const pick = (r: DateRange | undefined) => {
    const f = r?.from, t = r?.to;
    if (!f) return;
    setFrom(startOfDay(f));
    setTo(startOfDay(t ?? f));
  };
  const applyPreset = (id: string) => { const r = presetRange(id); setFrom(r.from); setTo(r.to); };

  return <WorkspaceShell active="Статистика"><div className="page-content deliveries-content orders-content">
    <div className="page-heading"><div><h1>Статистика<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва екранът"><Info /></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Избери период от календара – с две кликвания или с бърз филтър. Картите показват избрания период, а графиките – 12-те месеца до края му. Филтрирай по тип, инфлуенсър или търговец и по населено място.</TooltipContent></Tooltip></TooltipProvider></h1></div></div>
    <div className="suppliers-filters transfers-filters">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="period-trigger">
            <CalendarDays /><span className="tabular-nums">{fmt(from)} – {fmt(to)}</span><ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <div className="period-presets">
            {PRESETS.map(p => <button key={p.id} type="button" onClick={() => applyPreset(p.id)} className={p.id === activePreset ? 'is-active' : ''}>{p.label}</button>)}
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            captionLayout="dropdown"
            startMonth={DEMO_FROM}
            endMonth={DEMO_TO}
            defaultMonth={startOfMonth(subMonths(to, 1))}
            selected={{ from, to }}
            onSelect={pick}
            disabled={[{ before: DEMO_FROM }, { after: DEMO_TO }]}
            showOutsideDays={false}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          <div className="period-footer">
            <span>{fmt(from)} – {fmt(to)} · {period.daysCount} дни</span>
            <Button size="sm" onClick={() => setOpen(false)}>Готово</Button>
          </div>
        </PopoverContent>
      </Popover>
      <div className="search-box"><select className="search-input" aria-label="Тип" value={type} onChange={e => { setType(e.target.value); setSeller(''); }}><option value="">Всички типове</option><option>Инфлуенсър</option><option>Търговец на едро</option></select></div>
      <div className="search-box"><select className="search-input" aria-label="Инфлуенсър / Търговец" value={seller} onChange={e => setSeller(e.target.value)}><option value="">Всички инфлуенсъри и търговци</option>{options.map(s => <option key={s.id} value={s.id}>{s.id} · {s.type}</option>)}</select></div>
      <div className="search-box"><select className="search-input" aria-label="Населено място" value={settlement} onChange={e => setSettlement(e.target.value)}><option value="">Всички населени места</option>{SETTLEMENTS.map(s => <option key={s.id} value={s.id}>{s.id} · {settlementStats[s.id]!.orders} поръчки · {settlementStats[s.id]!.pct}%</option>)}</select></div>
    </div>

    <h2 className="text-sm font-semibold mb-2 text-foreground">Избран период<span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">{fmt(from)} – {fmt(to)}</span></h2>
    <section aria-label="Избран период" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-4">
      {kpis.map(k => <div key={k.label} className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><k.icon size={15} className="text-primary" />{k.label}</div>
        <div className="mt-2 text-2xl font-semibold text-foreground">{k.value}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{k.sub}</div>
      </div>)}
    </section>

    <h2 className="text-sm font-semibold mb-2 text-foreground">Последните 12 месеца{windowLabel ? <span className="ml-2 text-xs font-normal text-muted-foreground">{windowLabel}</span> : null}</h2>
    <div className="grid gap-3 lg:grid-cols-2">
      <Card title="Брой поръчки (платени и върнати)"><ChartContainer config={ordersCfg} className="h-56 w-full"><BarChart data={data}><CartesianGrid vertical={false} />{axis}<YAxis fontSize={10} width={30} /><ChartTooltip content={<ChartTooltipContent />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="paid" stackId="a" fill="var(--color-paid)" /><Bar dataKey="returned" stackId="a" fill="var(--color-returned)" radius={[3, 3, 0, 0]} /></BarChart></ChartContainer></Card>
      <Card title="Върнати поръчки, % от всички"><ChartContainer config={returnCfg} className="h-56 w-full"><LineChart data={data}><CartesianGrid vertical={false} />{axis}<YAxis fontSize={10} width={30} unit="%" /><ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="returnPct" stroke="var(--color-returnPct)" strokeWidth={2} dot={false} /></LineChart></ChartContainer></Card>
      <Card title="Брой продажби (платени)"><ChartContainer config={salesCfg} className="h-56 w-full"><BarChart data={data}><CartesianGrid vertical={false} />{axis}<YAxis fontSize={10} width={30} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="paid" fill="var(--color-paid)" radius={[3, 3, 0, 0]} /></BarChart></ChartContainer></Card>
      <Card title="Среден брой артикули в поръчка"><ChartContainer config={itemsCfg} className="h-56 w-full"><LineChart data={data}><CartesianGrid vertical={false} />{axis}<YAxis fontSize={10} width={30} /><ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="avgItems" stroke="var(--color-avgItems)" strokeWidth={2} dot={false} /></LineChart></ChartContainer></Card>
      <Card title="Средна цена на поръчка (€)" wide><ChartContainer config={priceCfg} className="h-56 w-full"><LineChart data={data}><CartesianGrid vertical={false} />{axis}<YAxis fontSize={10} width={40} /><ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="avgPrice" stroke="var(--color-avgPrice)" strokeWidth={2} dot={false} /></LineChart></ChartContainer></Card>
    </div>
    <div className="demo-caption mt-4"><ShieldCheck size={13} />Примерни статистически данни · <RotateCcw size={12} /> не са свързани с реални поръчки</div>
  </div></WorkspaceShell>;
}

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <section className={`rounded-lg border border-border bg-card p-4 ${wide ? 'lg:col-span-2' : ''}`}><h3 className="text-xs font-semibold text-foreground mb-2">{title}</h3>{children}</section>;
}
