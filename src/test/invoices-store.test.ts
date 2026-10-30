import { describe, expect, it } from 'vitest';
import { buildDemoInvoice, generateDemoInvoice, selectedInvoiceSale } from '@/lib/invoices-store';

const sale = { id: 'ORD-INVOICE-TEST', customer: 'Тест клиент', phone: '0888123456', city: 'София', address: 'Тест адрес', product: 'Rose Élixir', quantity: 2, price: 49, shipping: 4.9 };
const other = { ...sale, id: 'ORD-OTHER' };

describe('Demo invoice generation', () => {
  it('requires exactly one checkbox-selected sale', () => {
    expect(selectedInvoiceSale([], [sale, other])).toBeUndefined();
    expect(selectedInvoiceSale([sale.id, other.id], [sale, other])).toBeUndefined();
    expect(selectedInvoiceSale([sale.id], [sale, other])).toEqual(sale);
    expect(selectedInvoiceSale(['missing'], [sale])).toBeUndefined();
    expect(() => generateDemoInvoice([], [sale])).toThrow('Изберете една продажба.');
  });
  it('takes customer, product, quantity and total from the selected sale', () => {
    const invoice = buildDemoInvoice(sale, 1, new Date('2026-10-30T08:22:00Z'));
    expect(invoice.sale).toEqual(sale);
    expect(invoice.sale).not.toBe(sale);
    expect(invoice.total).toBe(102.9);
    expect(invoice.date).toBe('2026-10-30');
  });
  it('reuses the session invoice for the same sale', () => {
    const first = generateDemoInvoice([sale.id], [sale]);
    expect(generateDemoInvoice([sale.id], [sale])).toBe(first);
  });
});