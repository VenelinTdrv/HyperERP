import { useSyncExternalStore } from 'react';

export type InvoiceSale = {
  id: string; customer: string; phone: string; city: string; address: string;
  product: string; quantity: number; price: number; shipping: number;
};
export type DemoInvoice = {
  id: string; date: string; sale: InvoiceSale; total: number;
};

export function selectedInvoiceSale(selection: string[], sales: InvoiceSale[]) {
  return selection.length === 1 ? sales.find(sale => sale.id === selection[0]) : undefined;
}

export function buildDemoInvoice(sale: InvoiceSale, number: number, now = new Date()): DemoInvoice {
  return {
    id: `DEMO-${String(number).padStart(6, '0')}`,
    date: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Sofia' }).format(now),
    sale: { ...sale },
    total: Math.round((sale.quantity * sale.price + sale.shipping) * 100) / 100,
  };
}

let invoices: DemoInvoice[] = [];
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