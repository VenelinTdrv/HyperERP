import { describe, expect, it } from 'vitest';
import { REPORT_VIRTUAL_WAREHOUSES, virtualOrderTotal, virtualWarehouseOrders } from '@/lib/reports-data';

describe('virtual warehouse orders', () => {
  it('shows only orders that left the warehouse and are not completed', () => {
    const rows = virtualWarehouseOrders();
    expect(rows).toHaveLength(6);
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

  it('finds a client by name', () => {
    expect(virtualWarehouseOrders('перлана').map(order => order.orderNumber)).toEqual(['VW-1001']);
  });

  it('finds a client by phone number without formatting', () => {
    expect(virtualWarehouseOrders('888245610').map(order => order.orderNumber)).toEqual(['VW-1001']);
    expect(virtualWarehouseOrders('000000000')).toHaveLength(0);
  });

  it('keeps virtual warehouses isolated from physical warehouses', () => {
    for (const warehouse of REPORT_VIRTUAL_WAREHOUSES) {
      expect(virtualWarehouseOrders('', warehouse).every(order => order.warehouse === warehouse)).toBe(true);
    }
    expect(virtualWarehouseOrders('', 'Склад Главен')).toHaveLength(0);
  });
});
