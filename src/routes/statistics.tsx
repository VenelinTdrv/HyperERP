import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { CalendarDays, Info, Package, RotateCcw, ShieldCheck, ShoppingBag, Wallet, CheckCircle2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/statistics')({
  head: () => ({ meta: [
    { title: 'HyperERP · Статистика' },
    { name: 'description', content: 'Статистика за поръчки, продажби, среден брой артикули и средна цена на поръчка за текущия месец и последните 12 месеца.' },
    { property: 'og:title', content: 'HyperERP · Статистика' },
    { property: 'og:description', content: 'Цифрова и графична статистика за поръчки и продажби с филтър по инфлуенсър и търговец.' },
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
const MONTHS = ['Ное 25', 'Дек 25', 'Яну 26', 'Фев 26', 'Мар 26', 'Апр 26', 'Май 26', 'Юни 26', 'Юли 26', 'Авг 26', 'Сеп 26', 'Окт 26'];
// Deterministic demo base totals per month (all sellers)
const BASE = [182, 264, 151, 176, 205, 219, 240, 228, 211, 233, 248, 196];
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

type Row = { month: string; orders: number; paid: number; returned: number; returnPct: number; items: number; avgItems: number; avgPrice: number; revenue: number };

function build(seller: string, settlement: string): Row[] {
  const sellers = seller ? SELLERS.filter(s => s.id === seller) : SELLERS;
  const st = settlement ? SETTLEMENTS.find(x => x.id === settlement) : null;
  return MONTHS.map((month, i) => {
    let orders = 0, returned = 0, items = 0, revenue = 0, paid = 0;
    sellers.forEach((s, k) => {
      const sf = st ? st.weight * (0.92 + ((i * 7 + k * 3) % 5) * 0.04) : 1;
      const o = Math.round(BASE[i]! * s.weight * sf * (s.type === 'Търговец на едро' ? 0.5 : 1));
      const r = Math.round(o * (0.04 + ((i + k) % 5) * 0.012));
      const unp = Math.round(o * 0.06);
      const per = s.type === 'Търговец на едро' ? 6.5 + (i % 3) * 0.4 : 1.6 + ((i + k) % 4) * 0.15;
      orders += o; returned += r; paid += o - r - unp;
      items += Math.round(o * per);
      revenue += Math.round(o * per * (44 + ((i * 3 + k) % 6) * 2.5));
    });
    return { month, orders, paid, returned, returnPct: orders ? +(returned / orders * 100).toFixed(1) : 0, items, avgItems: orders ? +(items / orders).toFixed(2) : 0, avgPrice: orders ? +(revenue / orders).toFixed(2) : 0, revenue };
  });
}

const money = (v: number) => `${v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const ordersCfg = { paid: { label: 'Платени', color: 'var(--primary)' }, returned: { label: 'Върнати', color: 'var(--destructive)' }, orders: { label: 'Всички', color: 'var(--info)' } } satisfies ChartConfig;
const salesCfg = { paid: { label: 'Продажби (платени)', color: 'var(--primary)' } } satisfies ChartConfig;
const itemsCfg = { avgItems: { label: 'Ср. артикули', color: 'var(--info)' } } satisfies ChartConfig;
const priceCfg = { avgPrice: { label: 'Ср. цена', color: 'var(--warning)' } } satisfies ChartConfig;
const returnCfg = { returnPct: { label: '% върнати', color: 'var(--destructive)' } } satisfies ChartConfig;

function Statistics() {
  const [type, setType] = useState('');
  const [seller, setSeller] = useState('');
  const [settlement, setSettlement] = useState('');
  const options = SELLERS.filter(s => !type || s.type === type);
  const data = useMemo(() => {
    const ids = seller ? [seller] : type ? SELLERS.filter(s => s.type === type).map(s => s.id) : [''];
    const parts = ids.map(id => build(id, settlement));
    return MONTHS.map((month, i) => {
      const rs = parts.map(p => p[i]!);
      const orders = rs.reduce((a, r) => a + r.orders, 0), returned = rs.reduce((a, r) => a + r.returned, 0), items = rs.reduce((a, r) => a + r.items, 0), revenue = rs.reduce((a, r) => a + r.revenue, 0), paid = rs.reduce((a, r) => a + r.paid, 0);
      return { month, orders, paid, returned, returnPct: orders ? +(returned / orders * 100).toFixed(1) : 0, items, avgItems: orders ? +(items / orders).toFixed(2) : 0, avgPrice: orders ? +(revenue / orders).toFixed(2) : 0, revenue };
    });
  }, [type, seller, settlement]);
  const cur = data[data.length - 1]!;
  const paidPct = cur.orders ? (cur.paid / cur.orders * 100).toFixed(1) : '0';

  const kpis = [
    { icon: ShoppingBag, label: 'Брой поръчки', value: cur.orders.toString(), sub: `${cur.paid} платени · ${cur.returned} върнати (${cur.returnPct}%)` },
    { icon: CheckCircle2, label: 'Брой продажби (платени)', value: cur.paid.toString(), sub: `${paidPct}% от всички поръчки` },
    { icon: Package, label: 'Среден брой артикули', value: cur.avgItems.toLocaleString('bg-BG'), sub: `${cur.items} артикула общо` },
    { icon: Wallet, label: 'Средна цена на поръчка', value: money(cur.avgPrice), sub: `Оборот ${money(cur.revenue)}` },
  ];
  const axis = <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />;

  return <WorkspaceShell active="Статистика"><div className="page-content deliveries-content orders-content">
    <div className="page-heading"><div><h1>Статистика<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва екранът"><Info /></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Показатели за текущия месец и графики за последните 12 месеца. Филтрирай по тип, инфлуенсър или търговец и по населено място.</TooltipContent></Tooltip></TooltipProvider></h1></div></div>
    <div className="suppliers-filters transfers-filters">
      <div className="search-box"><CalendarDays /><input className="search-input" aria-label="Период" readOnly value="01.10.2026 – 31.10.2026" /></div>
      <div className="search-box"><select className="search-input" aria-label="Тип" value={type} onChange={e => { setType(e.target.value); setSeller(''); }}><option value="">Всички типове</option><option>Инфлуенсър</option><option>Търговец на едро</option></select></div>
      <div className="search-box"><select className="search-input" aria-label="Инфлуенсър / Търговец" value={seller} onChange={e => setSeller(e.target.value)}><option value="">Всички инфлуенсъри и търговци</option>{options.map(s => <option key={s.id} value={s.id}>{s.id} · {s.type}</option>)}</select></div>
      <div className="search-box"><select className="search-input" aria-label="Населено място" value={settlement} onChange={e => setSettlement(e.target.value)}><option value="">Всички населени места</option>{SETTLEMENTS.map(s => <option key={s.id} value={s.id}>{s.id} · {settlementStats[s.id]!.orders} поръчки · {settlementStats[s.id]!.pct}%</option>)}</select></div>
    </div>

    <section aria-label="Текущ месец" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-4">
      {kpis.map(k => <div key={k.label} className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><k.icon size={15} className="text-primary" />{k.label}</div>
        <div className="mt-2 text-2xl font-semibold text-foreground">{k.value}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{k.sub}</div>
      </div>)}
    </section>

    <h2 className="text-sm font-semibold mb-2 text-foreground">Последните 12 месеца</h2>
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
