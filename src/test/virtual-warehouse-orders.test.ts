import { describe, expect, it } from 'vitest';
import { REPORT_VIRTUAL_ORDERS, REPORT_VIRTUAL_WAREHOUSES, virtualOrderSalesTotal, virtualOrderTotal, virtualWarehouseClientTotals, virtualWarehouseOrders } from '@/lib/reports-data';

describe('virtual warehouse orders', () => {
  it('shows only orders that left the warehouse and are not completed', () => {
    const rows = virtualWarehouseOrders();
    expect(rows).toHaveLength(7);
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
    expect(virtualWarehouseOrders('перлана').map(order => order.orderNumber)).toEqual(['VW-1001', 'VW-1009']);
  });

  it('finds a client by phone number without formatting', () => {
    expect(virtualWarehouseOrders('888245610').map(order => order.orderNumber)).toEqual(['VW-1001', 'VW-1009']);
    expect(virtualWarehouseOrders('000000000')).toHaveLength(0);
  });

  it('totals both price types for a client with multiple orders', () => {
    const totals = virtualWarehouseClientTotals(virtualWarehouseOrders('Перлана'));
    expect(totals).toEqual([{
      client: 'Перлана',
      phone: '+359 888 245 610',
      orderCount: 2,
      minimumTotal: 73,
      salesTotal: 113,
    }]);
  });

  it('does not show a client total for a single matching order', () => {
    expect(virtualWarehouseClientTotals(virtualWarehouseOrders('Мария Георгиева'))).toEqual([]);
    expect(virtualWarehouseClientTotals(virtualWarehouseOrders('Перлана', 'Виртуален — Виктория'))).toEqual([]);
  });

  it('keeps virtual warehouses isolated from physical warehouses', () => {
    for (const warehouse of REPORT_VIRTUAL_WAREHOUSES) {
      expect(virtualWarehouseOrders('', warehouse).every(order => order.warehouse === warehouse)).toBe(true);
    }
    expect(virtualWarehouseOrders('', 'Склад Главен')).toHaveLength(0);
  });
});
