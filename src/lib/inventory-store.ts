import { useSyncExternalStore } from 'react';
import { REPORT_BATCHES, REPORT_WAREHOUSES } from '@/lib/reports-data';

export const INVENTORY_WAREHOUSES = REPORT_WAREHOUSES;
export type InventoryLine = { sku: string; name: string; expected: number; counted: number | null };
export type Inventory = { id: string; warehouse: string; date: string; note: string; status: 'В процес'; lines: InventoryLine[] };
let inventories: Inventory[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getInventories = () => inventories;
export const useInventories = () => useSyncExternalStore(subscribe, getInventories, getInventories);
export const inventoryToday = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Sofia' }).format(new Date());

export function inventoryLines(warehouse: string): InventoryLine[] {
  const grouped = new Map<string, InventoryLine>();
  for (const row of REPORT_BATCHES.filter(row => row.warehouse === warehouse)) {
    const item = grouped.get(row.sku) ?? { sku: row.sku, name: row.name, expected: 0, counted: null };
    item.expected += row.quantity;
    grouped.set(row.sku, item);
  }
  return [...grouped.values()];
}

export function createInventory(input: { warehouse: string; date: string; note: string; counts: Record<string, string> }): Inventory {
  if (!INVENTORY_WAREHOUSES.includes(input.warehouse)) throw new Error('Изберете склад.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(input.date)) || new Date(input.date).toISOString().slice(0, 10) !== input.date) throw new Error('Въведете валидна дата.');
  const lines = inventoryLines(input.warehouse).map(line => {
    const value = input.counts[line.sku]?.trim() ?? '';
    if (value && (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))) throw new Error('Преброените количества трябва да са цели, неотрицателни числа.');
    return { ...line, counted: value ? Number(value) : null };
  });
  const revision: Inventory = { id: `DEMO-REV-${String(inventories.length + 1).padStart(4, '0')}`, warehouse: input.warehouse, date: input.date, note: input.note.trim(), status: 'В процес', lines };
  inventories = [revision, ...inventories];
  listeners.forEach(listener => listener());
  return revision;
}