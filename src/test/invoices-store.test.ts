import { describe, expect, it } from 'vitest';
import { buildDemoInvoice, createExampleInvoices, filterInvoices, generateDemoInvoice, selectedInvoiceSale } from '@/lib/invoices-store';

const sale = { id: 'ORD-INVOICE-TEST', customer: 'Тест клиент', phone: '0888123456', city: 'София', address: 'Тест адрес', product: 'Rose Élixir', quantity: 2, price: 49, shipping: 4.9 };
const other = { ...sale, id: 'ORD-OTHER' };

describe('Demo invoice generation', () => {
  it('provides several example invoices with dates relative to today', () => {
    const rows = createExampleInvoices(new Date('2026-10-30T11:35:00Z'));
    expect(rows).toHaveLength(6);
    expect(rows[0].date).toBe('2026-10-30');
    expect(rows[5].date).toBe('2026-10-23');
    expect(new Set(rows.map(row => row.id)).size).toBe(6);
  });
  it('filters an inclusive date period and supports open-ended dates', () => {
    const rows = createExampleInvoices(new Date('2026-10-30T11:35:00Z'));
    expect(filterInvoices(rows, '2026-10-28', '2026-10-29', '').map(row => row.id)).toEqual(['DEMO-000003', 'DEMO-000004']);
    expect(filterInvoices(rows, '2026-10-30', '', '')).toHaveLength(2);
    expect(filterInvoices(rows, '', '2026-10-23', '')).toHaveLength(1);
  });
  it('combines status and date filters', () => {
    const rows = createExampleInvoices(new Date('2026-10-30T11:35:00Z'));
    expect(filterInvoices(rows, '', '', 'Платена')).toHaveLength(3);
    expect(filterInvoices(rows, '2026-10-29', '2026-10-30', 'Платена').map(row => row.id)).toEqual(['DEMO-000002']);
    expect(filterInvoices(rows, '2026-10-30', '', 'Анулирана')).toHaveLength(0);
  });
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