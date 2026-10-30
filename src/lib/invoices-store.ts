import { useSyncExternalStore } from 'react';

export type InvoiceSale = {
  id: string; customer: string; phone: string; city: string; address: string;
  product: string; quantity: number; price: number; shipping: number; eik?: string;
};
export const INVOICE_STATUSES = ['Издадена', 'Платена', 'Анулирана'] as const;
export type InvoiceStatus = typeof INVOICE_STATUSES[number];
export type DemoInvoice = {
  id: string; date: string; sale: InvoiceSale; total: number; status: InvoiceStatus;
};

export function filterInvoices(rows: DemoInvoice[], from: string, to: string, status: string) {
  return rows.filter(row => (!from || row.date >= from) && (!to || row.date <= to) && (!status || row.status === status));
}

export function selectedInvoiceSale(selection: string[], sales: InvoiceSale[]) {
  return selection.length === 1 ? sales.find(sale => sale.id === selection[0]) : undefined;
}

export function buildDemoInvoice(sale: InvoiceSale, number: number, now = new Date()): DemoInvoice {
  return {
    id: `DEMO-${String(number).padStart(6, '0')}`,
    date: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Sofia' }).format(now),
    status: 'Издадена',
    sale: { ...sale },
    total: Math.round((sale.quantity * sale.price + sale.shipping) * 100) / 100,
  };
}

export function createExampleInvoices(now = new Date()): DemoInvoice[] {
  const examples: { customer: string; city: string; product: string; quantity: number; price: number; days: number; status: InvoiceStatus }[] = [
    { customer: 'Мария Георгиева', city: 'София', product: 'Rose Élixir', quantity: 2, price: 49, days: 0, status: 'Издадена' },
    { customer: 'Ивана Петрова', city: 'Пловдив', product: 'Крем за лице', quantity: 1, price: 38, days: 0, status: 'Платена' },
    { customer: 'Козметик Груп ООД', city: 'Варна', product: 'Серум с витамин C', quantity: 5, price: 42, days: 1, status: 'Издадена' },
    { customer: 'Елена Димитрова', city: 'Бургас', product: 'Хидратираща маска', quantity: 3, price: 18, days: 2, status: 'Платена' },
    { customer: 'Николай Стоянов', city: 'Русе', product: 'Rose Élixir', quantity: 1, price: 49, days: 4, status: 'Анулирана' },
    { customer: 'Анна Николова', city: 'Стара Загора', product: 'Почистващ гел', quantity: 2, price: 24, days: 7, status: 'Платена' },
  ];
  return examples.map((example, index) => {
    const issued = new Date(now);
    issued.setUTCDate(issued.getUTCDate() - example.days);
    return { ...buildDemoInvoice({
      id: `DEMO-SALE-${index + 1}`, customer: example.customer, phone: '—', city: example.city,
      address: 'Примерен адрес', product: example.product, quantity: example.quantity, price: example.price, shipping: 4.9,
    }, index + 1, issued), status: example.status };
  });
}

let invoices: DemoInvoice[] = createExampleInvoices();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const useInvoices = () => useSyncExternalStore(subscribe, () => invoices, () => invoices);

export function generateDemoInvoice(selection: string[], sales: InvoiceSale[]) {
  const sale = selectedInvoiceSale(selection, sales);
  if (!sale) throw new Error('Изберете една продажба.');
  const existing = invoices.find(invoice => invoice.sale.id === sale.id);
  if (existing) return existing;
  const invoice = buildDemoInvoice(sale, invoices.length + 1);
  invoices = [invoice, ...invoices];
  listeners.forEach(listener => listener());
  return invoice;
}