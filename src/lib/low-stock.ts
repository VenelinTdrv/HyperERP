// "Намаляващи наличности": session-only demonstration of the Ямбол low-stock rules.
export const LOW_STOCK_WAREHOUSE = 'Ямбол';
export const LOW_STOCK_THRESHOLD = 30;

export type LowStockItem = {
  sku: string; name: string; category: string; brand: string;
  warehouse: string;
  reference: number; // Общо (референтно) количество
  physical: number;  // физическа наличност (изписаните вече са извадени)
  reserved: number;
  sold: number;      // продадени за периода след последната доставка
  lastDelivery: string;
  alert: 'none' | 'low' | 'out'; // последно известено състояние
};
export type LowStockNotice = { id: string; sku: string; name: string; kind: 'low' | 'out'; reference: number; reserved: number; free: number; percent: number; read: boolean };
export type StockEvent =
  | { type: 'reserve'; qty: number } | { type: 'cancel'; qty: number } | { type: 'ship'; qty: number }
  | { type: 'delivery'; qty: number; date: string } | { type: 'return'; qty: number } | { type: 'adjust'; physical: number };

export const freeQty = (i: Pick<LowStockItem, 'physical' | 'reserved'>) => Math.max(0, i.physical - i.reserved);
// Never divides by zero: a zero reference counts as 0 %.
export const freePercent = (i: Pick<LowStockItem, 'physical' | 'reserved' | 'reference'>) => i.reference > 0 ? Math.round(freeQty(i) / i.reference * 10000) / 100 : 0;
export const lowStockLevel = (p: number) => p <= 0 ? 'red' : p <= 15 ? 'orange' : p <= LOW_STOCK_THRESHOLD ? 'yellow' : 'ok';
export const isLowStock = (i: LowStockItem) => i.warehouse === LOW_STOCK_WAREHOUSE && freePercent(i) <= LOW_STOCK_THRESHOLD;

export function applyStockEvent(item: LowStockItem, e: StockEvent): LowStockItem {
  switch (e.type) {
    case 'reserve': return { ...item, reserved: item.reserved + Math.min(e.qty, freeQty(item)) };
    case 'cancel': return { ...item, reserved: Math.max(0, item.reserved - e.qty) };
    // Shipping reserved goods lowers physical and reserved together, so free stock is not reduced twice.
    case 'ship': { const q = Math.min(e.qty, item.reserved); return { ...item, physical: item.physical - q, reserved: item.reserved - q, sold: item.sold + q }; }
    case 'delivery': return { ...item, reference: item.physical + e.qty, physical: item.physical + e.qty, sold: 0, lastDelivery: e.date };
    case 'return': return { ...item, physical: item.physical + e.qty };
    case 'adjust': return { ...item, physical: Math.max(0, e.physical) };
  }
}

// Notification state machine: one notice on first reaching 30 %, one more at 0 %, reset above 30 %.
export function evaluateAlert(item: LowStockItem): { item: LowStockItem; notice: LowStockNotice['kind'] | null } {
  if (item.warehouse !== LOW_STOCK_WAREHOUSE) return { item, notice: null };
  const p = freePercent(item);
  if (p > LOW_STOCK_THRESHOLD) return { item: { ...item, alert: 'none' }, notice: null };
  if (freeQty(item) === 0) return item.alert === 'out' ? { item, notice: null } : { item: { ...item, alert: 'out' }, notice: 'out' };
  return item.alert === 'none' ? { item: { ...item, alert: 'low' }, notice: 'low' } : { item, notice: null };
}

const seed = (sku: string, name: string, category: string, brand: string, reference: number, sold: number, reserved: number, lastDelivery: string, warehouse = LOW_STOCK_WAREHOUSE): LowStockItem =>
  ({ sku, name, category, brand, warehouse, reference, physical: reference - sold, reserved, sold, lastDelivery, alert: 'none' });
export const initialLowStockItems = (): LowStockItem[] => [
  seed('LAT-KHAM-100', 'Lattafa Khamrah', 'Парфюми', 'Lattafa', 100, 60, 10, '2026-10-02'),
  seed('LAT-ASAD-100', 'Lattafa Asad', 'Парфюми', 'Lattafa', 200, 150, 20, '2026-09-18'),
  seed('AFN-9PM-100', 'Afnan 9PM', 'Парфюми', 'Afnan', 150, 135, 15, '2026-09-05'),
  seed('LAT-YARA-100', 'Lattafa Yara', 'Парфюми', 'Lattafa', 120, 90, 10, '2026-10-10'),
  seed('ARM-CDN-105', 'Armaf Club de Nuit', 'Парфюми', 'Armaf', 80, 60, 8, '2026-10-21'),
  seed('NIV-SOFT-200', 'Nivea Soft крем', 'Кремове', 'Nivea', 300, 120, 20, '2026-11-01'),
  seed('ARM-ODY-100', 'Armaf Odyssey', 'Парфюми', 'Armaf', 60, 10, 5, '2026-11-12'),
  seed('AFN-SUP-100', 'Afnan Supremacy', 'Парфюми', 'Afnan', 0, 0, 0, '—'),
  seed('LAT-KHAM-100', 'Lattafa Khamrah', 'Парфюми', 'Lattafa', 100, 95, 5, '2026-10-02', 'София'),
];

// Session store
type State = { items: LowStockItem[]; notices: LowStockNotice[] };
let n = 0;
const notice = (i: LowStockItem, kind: LowStockNotice['kind']): LowStockNotice => ({ id: `LS-${++n}`, sku: i.sku, name: i.name, kind, reference: i.reference, reserved: i.reserved, free: freeQty(i), percent: freePercent(i), read: false });
function init(): State {
  const notices: LowStockNotice[] = [];
  const items = initialLowStockItems().map(i => { const r = evaluateAlert(i); if (r.notice) notices.unshift(notice(r.item, r.notice)); return r.item; });
  return { items, notices };
}
let state = init();
const listeners = new Set<() => void>();
export const lowStockSubscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const lowStockSnapshot = () => state;
const emit = () => listeners.forEach(l => l());
export function dispatchStockEvent(sku: string, warehouse: string, e: StockEvent) {
  const notices = [...state.notices];
  const items = state.items.map(i => {
    if (i.sku !== sku || i.warehouse !== warehouse) return i;
    const r = evaluateAlert(applyStockEvent(i, e));
    if (r.notice) notices.unshift(notice(r.item, r.notice));
    return r.item;
  });
  state = { items, notices }; emit();
}
export function markNoticeRead(id?: string) { state = { ...state, notices: state.notices.map(x => !id || x.id === id ? { ...x, read: true } : x) }; emit(); }
export function resetLowStock() { n = 0; state = init(); emit(); }
