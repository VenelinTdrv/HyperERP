import { describe, expect, it } from 'vitest';
import { orderSheetRows } from '@/lib/order-export';
import type { Order } from '@/lib/orders-store';

describe('Order spreadsheet export', () => {
  it('exports the current products and only the VAT-inclusive total', () => {
    const order: Order = {
      id: 'ORD-0025', status: 'Необработена', customer: 'Мария Иванова',
      phone: '0888123456', city: 'София', address: 'ул. Витоша 15',
      courier: 'Еконт', created: '2026-10-17', shipping: 4.9, note: '',
      payment: 'Наложен платеж',
      items: [{ sku: 'PRF-001', name: 'Rose Élixir', quantity: 2, price: 15.5 }],
    };
    const rows = orderSheetRows(order);
    expect(rows).toContainEqual([1, 'Rose Élixir', 'PRF-001', 2]);
    expect(rows).toContainEqual(['Общо с ДДС (€)', 35.9]);
    expect(rows.flat()).not.toContain(15.5);
    expect(rows.flat()).not.toContain(4.9);
  });
});