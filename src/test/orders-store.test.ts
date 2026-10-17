import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createOrder, total, useOrders } from '@/lib/orders-store';

describe('New orders in the orders list', () => {
 it('adds the entered order to the shared list as unprocessed', () => {
  const data = { customer: 'Тестов клиент', phone: '0888123456', city: 'Варна', address: 'ул. Морска 5', courier: 'Спиди', shipping: 0, note: 'Бележка', payment: 'Наложен платеж' as const, influencer: 'Елена Петрова', deliveryType: 'address' as const, items: [{ sku: 'PRF-001', name: 'Rose Élixir', quantity: 2, price: 15.5 }, { sku: 'CRM-001', name: 'Hydra Cream', quantity: 1, price: 0 }] };
  const order = createOrder(data);
  const { result, unmount } = renderHook(() => useOrders());
  const saved = result.current[0];
  if (!saved) throw new Error('Created order missing from orders list');
  expect(saved).toEqual({ ...data, id: order.id, status: 'Необработена', created: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Sofia' }).format(new Date()) });
  expect(total(saved)).toBe(31);
  unmount();
 });

 it('assigns a distinct order number on each save', () => {
  const data = { customer: 'Клиент', phone: '0888123456', city: 'София', address: 'Адрес', courier: 'Еконт', shipping: 0, note: '', payment: 'Наложен платеж' as const, items: [{ sku: 'PRF-001', name: 'Rose Élixir', quantity: 1, price: 0 }] };
  const first = createOrder(data);
  const second = createOrder(data);
  expect(second.id).not.toBe(first.id);
  expect(Number(second.id.slice(4))).toBe(Number(first.id.slice(4)) + 1);
 });
});