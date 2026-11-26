// Session-only demonstration data for the "Оборот по служители" report.
// Turnover is always quantity × minimum price, regardless of the price charged to the client.
export type TurnoverStatus = 'Доставена' | 'Изпратена' | 'Обработена' | 'Отказана' | 'Върната';
export type TurnoverItem = { sku: string; name: string; quantity: number; salePrice: number; minPrice: number };
export type TurnoverOrder = { id: string; seller: string; date: string; status: TurnoverStatus; paid: boolean; items: TurnoverItem[] };

// People allowed to create orders: influencers and employees.
export const TURNOVER_PEOPLE = [
  { name: 'Мария Иванова', kind: 'Инфлуенсър' },
  { name: 'Елена Петрова', kind: 'Инфлуенсър' },
  { name: 'Виктория Григорова', kind: 'Инфлуенсър' },
  { name: 'Венелин Тодоров', kind: 'Служител' },
  { name: 'Цветан Стоянов', kind: 'Служител' },
] as const;


export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const shift = (today: Date, days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return iso(d); };

const CATALOG = [
  { sku: 'PRF-VELV-50', name: 'Velvet Oud 50 ml', salePrice: 64, minPrice: 38 },
  { sku: 'LAT-KHAM-100', name: 'Lattafa Khamrah 100 ml', salePrice: 55, minPrice: 32 },
  { sku: 'AFN-9PM-100', name: 'Afnan 9PM 100 ml', salePrice: 48, minPrice: 29 },
  { sku: 'LAT-ASAD-100', name: 'Lattafa Asad 100 ml', salePrice: 42, minPrice: 25 },
];
const STATUSES: TurnoverStatus[] = ['Доставена', 'Доставена', 'Изпратена', 'Обработена', 'Доставена', 'Отказана', 'Доставена', 'Върната'];

// Demo orders spread over the last ~14 months, generated relative to today.
export function turnoverOrders(today = new Date()): TurnoverOrder[] {
  const orders: TurnoverOrder[] = [];
  let n = 0;
  TURNOVER_PEOPLE.forEach((person, p) => {
    const every = 3 + p; // busier people first
    for (let day = p; day < 420; day += every) {
      const items = [0, 1].slice(0, 1 + (n % 2)).map(k => {
        const product = CATALOG[(n + k + p) % CATALOG.length]!;
        return { ...product, quantity: 1 + ((n + k) % 3) };
      });
      orders.push({ id: `ORD-T${String(++n).padStart(4, '0')}`, seller: person.name, date: shift(today, day), status: STATUSES[n % STATUSES.length]!, paid: n % 4 !== 0, items });
    }
  });
  return orders;
}

export const itemTurnover = (item: TurnoverItem) => item.quantity * item.minPrice;
export const orderTurnover = (order: TurnoverOrder) => order.items.reduce((sum, item) => sum + itemTurnover(item), 0);
// Only completed orders count: delivered and paid.
export const countsForTurnover = (order: TurnoverOrder) => order.status === 'Доставена' && order.paid;

export function sellerTurnover(orders: TurnoverOrder[], seller: string, from: string, to: string) {
  return orders.filter(o => o.seller === seller && countsForTurnover(o) && (!from || o.date >= from) && (!to || o.date <= to)).reduce((sum, o) => sum + orderTurnover(o), 0);
}

export type TurnoverRow = { name: string; kind: string; month: number; year: number; period: number };
export function staffTurnoverRows(orders: TurnoverOrder[], today: Date, from: string, to: string): TurnoverRow[] {
  const now = iso(today);
  const monthStart = iso(new Date(today.getFullYear(), today.getMonth(), 1));
  const yearStart = iso(new Date(today.getFullYear(), 0, 1));
  return TURNOVER_PEOPLE.map(person => ({
    name: person.name,
    kind: person.kind,
    month: sellerTurnover(orders, person.name, monthStart, now),
    year: sellerTurnover(orders, person.name, yearStart, now),
    period: sellerTurnover(orders, person.name, from, to),
  }));
}

export const previousMonthRange = (today = new Date()) => ({
  from: iso(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
  to: iso(new Date(today.getFullYear(), today.getMonth(), 0)),
});
