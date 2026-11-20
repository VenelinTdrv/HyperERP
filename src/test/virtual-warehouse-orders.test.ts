import { describe, expect, it } from 'vitest';
import { REPORT_VIRTUAL_ORDERS, REPORT_VIRTUAL_WAREHOUSES, virtualOrderSalesTotal, virtualOrderTotal, virtualWarehouseClientKey, virtualWarehouseClientOrderCounts, virtualWarehouseClientOrders, virtualWarehouseClientTotals, virtualWarehouseOrders, virtualWarehousePeople, virtualWarehousePersonKind } from '@/lib/reports-data';

describe('virtual warehouse orders', () => {
  it('shows only orders that left the warehouse and are not completed', () => {
    const rows = virtualWarehouseOrders();
    expect(rows).toHaveLength(8);
    expect(rows.every(order => order.leftWarehouse && !order.completed)).toBe(true);
    expect(rows.map(order => order.orderNumber)).not.toContain('VW-1007');
    expect(rows.map(order => order.orderNumber)).not.toContain('VW-1008');
  });

  it('includes both paid and unpaid unfinished orders', () => {
    const rows = virtualWarehouseOrders();
    expect(rows.some(order => order.paid)).toBe(true);
    expect(rows.some(order => !order.paid)).toBe(true);
  });

  it('calculates the Perлана example total from minimum prices', () => {
    const order = virtualWarehouseOrders('Перлана')[0]!;
    expect(order.orderNumber).toBe('VW-1001');
    expect(order.items).toHaveLength(2);
    expect(virtualOrderTotal(order)).toBe(38);
  });

  it('prices every item at a sales price above its minimum price', () => {
    for (const order of REPORT_VIRTUAL_ORDERS) {
      for (const item of order.items) {
        expect(item.salesPrice).toBeGreaterThan(item.minimumPrice);
      }
    }
  });

  it('calculates the Perлана example sales price total', () => {
    const order = virtualWarehouseOrders('Перлана')[0]!;
    expect(virtualOrderSalesTotal(order)).toBe(64);
    expect(virtualOrderSalesTotal(order)).toBeGreaterThan(virtualOrderTotal(order));
  });

  it('finds a client by name', () => {
    expect(virtualWarehouseOrders('перлана').map(order => order.orderNumber)).toEqual(['VW-1001', 'VW-1009', 'VW-1010']);
  });

  it('finds a client by phone number without formatting', () => {
    expect(virtualWarehouseOrders('888245610').map(order => order.orderNumber)).toEqual(['VW-1001', 'VW-1009', 'VW-1010']);
    expect(virtualWarehouseOrders('000000000')).toHaveLength(0);
  });

  it('finds orders by virtual warehouse or order number in the same text field', () => {
    expect(virtualWarehouseOrders('Виртуален — Виктория').map(order => order.orderNumber)).toEqual(['VW-1002', 'VW-1005']);
    expect(virtualWarehouseOrders('vw-1003').map(order => order.orderNumber)).toEqual(['VW-1003']);
  });

  it('finds orders by the influencer or employee credited with them', () => {
    expect(virtualWarehouseOrders('Виктория Григорова').map(order => order.orderNumber)).toEqual(['VW-1001', 'VW-1002', 'VW-1006', 'VW-1009']);
    expect(virtualWarehouseOrders('Цветан Стоянов').map(order => order.orderNumber)).toEqual(['VW-1010']);
  });

  it('lists influencers before employees with counts and share of all orders', () => {
    const people = virtualWarehousePeople(virtualWarehouseOrders(), 8);
    expect(people.map(person => person.name)).toEqual(['Виктория Григорова', 'Елена Петрова', 'Мария Иванова', 'Венелин Тодоров', 'Цветан Стоянов']);
    expect(people[0]).toEqual({ name: 'Виктория Григорова', kind: 'Инфлуенсър', orders: 4, share: 50 });
    expect(virtualWarehousePersonKind('Венелин Тодоров')).toBe('Служител');
    expect(virtualWarehousePersonKind('Виктория Григорова')).toBe('Инфлуенсър');
  });

  it('totals both price types for a client with multiple orders', () => {
    const totals = virtualWarehouseClientTotals(virtualWarehouseOrders('Перлана'));
    expect(totals).toEqual([{
      client: 'Перлана',
      phone: '+359 888 245 610',
      orderCount: 3,
      minimumTotal: 122,
      salesTotal: 182,
    }]);
  });

  it('does not show a client total for a single matching order', () => {
    expect(virtualWarehouseClientTotals(virtualWarehouseOrders('Мария Георгиева'))).toEqual([]);
    expect(virtualWarehouseClientTotals(virtualWarehouseOrders('Перлана', 'Виртуален — Виктория'))).toEqual([]);
  });

  it('counts the orders of every client in the result set', () => {
    const counts = virtualWarehouseClientOrderCounts(virtualWarehouseOrders());
    const perla = virtualWarehouseOrders('Перлана')[0]!;
    const maria = virtualWarehouseOrders('Мария Георгиева')[0]!;
    expect(counts.get(virtualWarehouseClientKey(perla))).toBe(3);
    expect(counts.get(virtualWarehouseClientKey(maria))).toBe(1);
  });

  it('lists every order of a client for the details dialog', () => {
    const rows = virtualWarehouseOrders();
    const perlaOrders = virtualWarehouseClientOrders(rows, rows.find(order => order.orderNumber === 'VW-1001')!);
    expect(perlaOrders.map(order => order.orderNumber)).toEqual(['VW-1001', 'VW-1009', 'VW-1010']);
    expect(virtualWarehouseClientOrders(rows, rows.find(order => order.orderNumber === 'VW-1002')!)).toHaveLength(1);
  });

  it('counts only the orders left after filtering by payment', () => {
    const rows = virtualWarehouseOrders('Перлана', '', 'paid');
    const counts = virtualWarehouseClientOrderCounts(rows);
    expect(counts.get(virtualWarehouseClientKey(rows[0]!))).toBe(1);
  });

  it('keeps virtual warehouses isolated from physical warehouses', () => {
    for (const warehouse of REPORT_VIRTUAL_WAREHOUSES) {
      expect(virtualWarehouseOrders('', warehouse).every(order => order.warehouse === warehouse)).toBe(true);
    }
    expect(virtualWarehouseOrders('', 'Склад Главен')).toHaveLength(0);
  });
});
