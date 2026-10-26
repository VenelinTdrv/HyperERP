import { CATALOG } from './orders-store';

export const REPORTS = {
  warehouses: 'Наличност по складове',
  articles: 'Наличност по артикули',
  batches: 'Наличност по партиди',
  profit: 'Печалба по складове',
  exhausted: 'Изчерпани партиди',
} as const;
export type ReportKind = keyof typeof REPORTS;
export const REPORT_WAREHOUSES = ['Склад Главен', 'Склад София', 'Склад Варна'];
// Isolated demonstration allocations and costs, not operational inventory.
export const REPORT_BATCHES = CATALOG.flatMap((article, index) => REPORT_WAREHOUSES.map((warehouse, position) => ({
  ...article, id: `${article.sku}-${position}`, batch: `B-${101 + index * 3 + position}`,
  warehouse, quantity: position === 2 && index % 2 === 0 ? 0 : 10 + index * 5 + position * 3,
  cost: Math.round(article.price * 0.6 * 100) / 100, sold: 3 + index + position,
})));
export type ReportRow = { id: string; name: string; sku?: string; warehouse?: string; batch?: string; quantity: number; value: number; revenue?: number; cost?: number };
export function reportRows(kind: ReportKind, query = '', warehouse = ''): ReportRow[] {
  const q = query.trim().toLocaleLowerCase('bg-BG');
  const batches = REPORT_BATCHES.filter(row => (!warehouse || row.warehouse === warehouse) && (!q || `${row.name} ${row.sku} ${row.batch} ${row.warehouse}`.toLocaleLowerCase('bg-BG').includes(q)));
  if (kind === 'batches' || kind === 'exhausted') return batches.filter(row => kind !== 'exhausted' || row.quantity === 0).map(row => ({ ...row, value: row.quantity * row.cost }));
  const grouped = new Map<string, ReportRow>();
  for (const row of batches) {
    const key = kind === 'articles' ? row.sku : row.warehouse;
    const group = grouped.get(key) ?? { id: key, name: kind === 'articles' ? row.name : row.warehouse, sku: kind === 'articles' ? row.sku : undefined, quantity: 0, value: 0, revenue: 0, cost: 0 };
    group.quantity += kind === 'profit' ? row.sold : row.quantity;
    group.revenue = (group.revenue ?? 0) + row.sold * row.price;
    group.cost = (group.cost ?? 0) + row.sold * row.cost;
    group.value += kind === 'profit' ? row.sold * (row.price - row.cost) : row.quantity * row.cost;
    grouped.set(key, group);
  }
  return [...grouped.values()];
}
export function reportHead(kind: ReportKind) {
  const title = `HyperERP · ${REPORTS[kind]}`;
  const description = `${REPORTS[kind]} — справка с примерни данни в HyperERP.`;
  return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}
