import { describe, expect, it } from 'vitest';
import { createInventory, getInventories, inventoryLines, findInventoryProducts, inventoryProductByCode } from '@/lib/inventory-store';
import { REPORT_BATCHES } from '@/lib/reports-data';

describe('Demonstration stocktakes', () => {
  it('finds products by entered name or SKU', () => {
    expect(findInventoryProducts('Склад Главен', 'rose').map(line => line.sku)).toEqual(['PRF-ROSE-50']);
    expect(findInventoryProducts('Склад Главен', 'prf-velv').map(line => line.sku)).toEqual(['PRF-VELV-50']);
  });
  it('resolves scanned SKU and rejects unknown codes', () => {
    expect(inventoryProductByCode('Склад Главен', ' PRF-ROSE-50 ')?.name).toBe('Rose Élixir');
    expect(inventoryProductByCode('Склад Главен', 'unknown')).toBeUndefined();
  });
  it('saves only added products without duplicate SKU rows', () => {
    const revision = createInventory({ warehouse: 'Склад Главен', date: '2026-11-16', note: '', counts: { 'PRF-ROSE-50': '2' }, skus: ['PRF-ROSE-50', 'PRF-ROSE-50'] });
    expect(revision.lines).toEqual([{ sku: 'PRF-ROSE-50', name: 'Rose Élixir', expected: 10, counted: 2 }]);
  });
  it('rejects empty or unknown selections', () => {
    const input = { warehouse: 'Склад Главен', date: '2026-11-16', note: '', counts: {} };
    expect(() => createInventory({ ...input, skus: [] })).toThrow();
    expect(() => createInventory({ ...input, skus: ['unknown'] })).toThrow();
  });
  it('creates a revision with warehouse stock snapshots and entered quantities', () => {
    const before = JSON.stringify(REPORT_BATCHES);
    const revision = createInventory({ warehouse: 'Склад Главен', date: '2026-11-16', note: 'Проверка', counts: { 'PRF-ROSE-50': '8', 'PRF-VELV-50': '0' } });
    expect(getInventories()).toContain(revision);
    expect(revision).toMatchObject({ warehouse: 'Склад Главен', status: 'В процес', date: '2026-11-16' });
    expect(revision.lines.find(line => line.sku === 'PRF-ROSE-50')).toMatchObject({ expected: 10, counted: 8 });
    expect(revision.lines.find(line => line.sku === 'PRF-VELV-50')?.counted).toBe(0);
    expect(revision.lines.find(line => line.sku === 'PRF-PURE-30')?.counted).toBeNull();
    expect(JSON.stringify(REPORT_BATCHES)).toBe(before);
  });
  it('rejects missing warehouses, invalid dates and negative or fractional counts', () => {
    const input = { warehouse: 'Склад Главен', date: '2026-11-16', note: '', counts: {} };
    expect(() => createInventory({ ...input, warehouse: '' })).toThrow();
    expect(() => createInventory({ ...input, date: '2026-02-30' })).toThrow();
    for (const value of ['-1', '1.5', 'не число']) expect(() => createInventory({ ...input, counts: { 'PRF-ROSE-50': value } })).toThrow();
  });
  it('includes zero stock and isolates the selected warehouse', () => {
    expect(inventoryLines('Склад Варна').find(line => line.sku === 'PRF-ROSE-50')?.expected).toBe(0);
    expect(inventoryLines('Склад Главен').find(line => line.sku === 'PRF-ROSE-50')?.expected).toBe(10);
  });
});