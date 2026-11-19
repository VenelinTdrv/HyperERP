
export const REPORTS = {
  warehouses: 'Наличност по складове',
  articles: 'Наличност по артикули',
  batches: 'Наличност по партиди',
  profit: 'Печалба по складове',
  exhausted: 'Изчерпани партиди',
  virtual: 'Виртуални складове',
} as const;
export type ReportKind = keyof typeof REPORTS;
export const REPORT_WAREHOUSES = ['Склад Главен', 'Склад София', 'Склад Варна'];
export const REPORT_VIRTUAL_WAREHOUSES = ['Виртуален — Ема', 'Виртуален — Виктория', 'Виртуален — Връщания'];
// Isolated demonstration catalogue for the reports, independent from order entry.
export const REPORT_ARTICLES = [
  { sku: 'PRF-ROSE-50', name: 'Rose Élixir', price: 49 },
  { sku: 'PRF-VELV-50', name: 'Velvet Bloom', price: 69 },
  { sku: 'PRF-PURE-30', name: 'Pure Essence', price: 35 },
  { sku: 'CRM-HYDR-50', name: 'Hydra Cream', price: 29 },
  { sku: 'CRM-NIGH-50', name: 'Night Repair', price: 59 },
  { sku: 'SER-VITA-30', name: 'Vitamin C Serum', price: 45 },
  { sku: 'OIL-ARGA-100', name: 'Argan Oil', price: 39 },
  { sku: 'MLS-SPF-50', name: 'Sun Fluid SPF 50', price: 33 },
  { sku: 'MST-BODY-200', name: 'Body Butter', price: 24 },
  { sku: 'TON-MICE-250', name: 'Micellar Water', price: 19 },
];
// Isolated demonstration allocations and costs, not operational inventory.
export const REPORT_BATCHES = REPORT_ARTICLES.flatMap((article, index) => REPORT_WAREHOUSES.map((warehouse, position) => ({
  ...article, id: `${article.sku}-${position}`, batch: `B-${101 + index * 3 + position}`,
  warehouse, quantity: position === 2 && index % 2 === 0 ? 0 : 10 + index * 5 + position * 3,
  cost: Math.round(article.price * 0.6 * 100) / 100, sold: 3 + index + position,
})));
export type VirtualWarehouseOrderItem = { sku: string; name: string; quantity: number; minimumPrice: number; salesPrice: number };
export type VirtualWarehouseOrder = {
  orderNumber: string;
  client: string;
  phone: string;
  warehouse: string;
  status: string;
  leftWarehouse: boolean;
  completed: boolean;
  paid: boolean;
  items: VirtualWarehouseOrderItem[];
};
export type VirtualOrderPayment = 'all' | 'paid' | 'unpaid';

// Isolated demonstration orders; no operational orders or stock are read or changed.
export const REPORT_VIRTUAL_ORDERS: VirtualWarehouseOrder[] = [
  { orderNumber: 'VW-1001', client: 'Перлана', phone: '+359 888 245 610', warehouse: 'Виртуален — Ема', status: 'Изпратена', leftWarehouse: true, completed: false, paid: false, items: [
    { sku: 'CRM-HYDR-50', name: 'Hydra Cream', quantity: 1, minimumPrice: 29, salesPrice: 45 },
    { sku: 'TON-MICE-250', name: 'Micellar Water', quantity: 1, minimumPrice: 9, salesPrice: 19 },
  ] },
  { orderNumber: 'VW-1002', client: 'Мария Георгиева', phone: '+359 887 112 402', warehouse: 'Виртуален — Виктория', status: 'В доставка', leftWarehouse: true, completed: false, paid: true, items: [
    { sku: 'PRF-VELV-50', name: 'Velvet Bloom', quantity: 1, minimumPrice: 69, salesPrice: 89 },
    { sku: 'MST-BODY-200', name: 'Body Butter', quantity: 1, minimumPrice: 24, salesPrice: 34 },
  ] },
  { orderNumber: 'VW-1003', client: 'Арома Трейд ЕООД', phone: '+359 2 491 2080', warehouse: 'Виртуален — Ема', status: 'Изпратена', leftWarehouse: true, completed: false, paid: false, items: [
    { sku: 'SER-VITA-30', name: 'Vitamin C Serum', quantity: 2, minimumPrice: 45, salesPrice: 65 },
  ] },
  { orderNumber: 'VW-1004', client: 'Елена Петрова', phone: '+359 889 734 155', warehouse: 'Виртуален — Връщания', status: 'В доставка', leftWarehouse: true, completed: false, paid: true, items: [
    { sku: 'OIL-ARGA-100', name: 'Argan Oil', quantity: 1, minimumPrice: 39, salesPrice: 55 },
    { sku: 'MLS-SPF-50', name: 'Sun Fluid SPF 50', quantity: 1, minimumPrice: 33, salesPrice: 45 },
  ] },
  { orderNumber: 'VW-1005', client: 'Николай Иванов', phone: '+359 886 410 377', warehouse: 'Виртуален — Виктория', status: 'Изпратена', leftWarehouse: true, completed: false, paid: false, items: [
    { sku: 'CRM-NIGH-50', name: 'Night Repair', quantity: 1, minimumPrice: 59, salesPrice: 79 },
    { sku: 'TON-MICE-250', name: 'Micellar Water', quantity: 1, minimumPrice: 19, salesPrice: 29 },
  ] },
  { orderNumber: 'VW-1006', client: 'Студио Лотос', phone: '+359 878 302 644', warehouse: 'Виртуален — Връщания', status: 'Изпратена', leftWarehouse: true, completed: false, paid: true, items: [
    { sku: 'PRF-PURE-30', name: 'Pure Essence', quantity: 2, minimumPrice: 35, salesPrice: 49 },
  ] },
  { orderNumber: 'VW-1007', client: 'Приключена поръчка', phone: '+359 888 000 007', warehouse: 'Виртуален — Ема', status: 'Завършена', leftWarehouse: true, completed: true, paid: true, items: [
    { sku: 'PRF-ROSE-50', name: 'Rose Élixir', quantity: 1, minimumPrice: 49, salesPrice: 69 },
  ] },
  { orderNumber: 'VW-1008', client: 'Неначална заявка', phone: '+359 888 000 008', warehouse: 'Виртуален — Ема', status: 'Подготвя се', leftWarehouse: false, completed: false, paid: false, items: [
    { sku: 'PRF-ROSE-50', name: 'Rose Élixir', quantity: 1, minimumPrice: 49, salesPrice: 69 },
  ] },
  { orderNumber: 'VW-1009', client: 'Перлана', phone: '+359 888 245 610', warehouse: 'Виртуален — Ема', status: 'Изпратена', leftWarehouse: true, completed: false, paid: true, items: [
    { sku: 'PRF-PURE-30', name: 'Pure Essence', quantity: 1, minimumPrice: 35, salesPrice: 49 },
  ] },
];

export function virtualOrderTotal(order: VirtualWarehouseOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.minimumPrice, 0);
}

export function virtualOrderSalesTotal(order: VirtualWarehouseOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.salesPrice, 0);
}

export type VirtualWarehouseClientTotal = {
  client: string;
  phone: string;
  orderCount: number;
  minimumTotal: number;
  salesTotal: number;
};

export function virtualWarehouseClientTotals(orders: VirtualWarehouseOrder[]): VirtualWarehouseClientTotal[] {
  const groups = new Map<string, VirtualWarehouseOrder[]>();
  for (const order of orders) {
    const key = `${order.client.toLocaleLowerCase('bg-BG')}|${order.phone.replace(/\D/g, '')}`;
    groups.set(key, [...(groups.get(key) ?? []), order]);
  }
  return [...groups.values()]
    .filter(clientOrders => clientOrders.length > 1)
    .map(clientOrders => ({
      client: clientOrders[0]!.client,
      phone: clientOrders[0]!.phone,
      orderCount: clientOrders.length,
      minimumTotal: clientOrders.reduce((sum, order) => sum + virtualOrderTotal(order), 0),
      salesTotal: clientOrders.reduce((sum, order) => sum + virtualOrderSalesTotal(order), 0),
    }));
}

export function virtualWarehouseOrders(query = '', warehouse = '', payment: VirtualOrderPayment = 'all') {
  const q = query.trim().toLocaleLowerCase('bg-BG');
  const phoneQuery = query.replace(/\D/g, '');
  return REPORT_VIRTUAL_ORDERS.filter(order =>
    order.leftWarehouse && !order.completed &&
    (!warehouse || order.warehouse === warehouse) &&
    (payment === 'all' || (payment === 'paid' ? order.paid : !order.paid)) &&
    (!q || order.client.toLocaleLowerCase('bg-BG').includes(q) || (phoneQuery.length > 0 && order.phone.replace(/\D/g, '').includes(phoneQuery))),
  );
}

export type ReportRow = { id: string; name: string; sku?: string; warehouse?: string; batch?: string; quantity: number; value: number; revenue?: number; cost?: number };
export type StockReportKind = Exclude<ReportKind, 'virtual'>;
export function reportRows(kind: StockReportKind, query = '', warehouse = ''): ReportRow[] {
  const q = query.trim().toLocaleLowerCase('bg-BG');
  const batches = REPORT_BATCHES.filter(row => (!warehouse || row.warehouse === warehouse) && (!q || `${row.name} ${row.sku} ${row.batch} ${row.warehouse}`.toLocaleLowerCase('bg-BG').includes(q)));
  if (kind === 'batches' || kind === 'exhausted') return batches.filter(row => kind !== 'exhausted' || row.quantity === 0).map(row => ({ ...row, value: row.quantity * row.cost }));
  const grouped = new Map<string, ReportRow>();
  for (const row of batches) {
    const key = kind === 'articles' ? row.sku : row.warehouse;
    const group: ReportRow = grouped.get(key) ?? { id: key, name: kind === 'articles' ? row.name : row.warehouse, ...(kind === 'articles' ? { sku: row.sku } : {}), quantity: 0, value: 0, revenue: 0, cost: 0 };
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
