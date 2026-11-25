import { describe, expect, it } from 'vitest';
import { applyStockEvent, evaluateAlert, freePercent, freeQty, initialLowStockItems, isLowStock, lowStockLevel, type LowStockItem } from '@/lib/low-stock';

const item = (o: Partial<LowStockItem>): LowStockItem => ({ sku: 'X', name: 'X', category: 'c', brand: 'b', warehouse: 'Ямбол', reference: 100, physical: 40, reserved: 10, sold: 60, lastDelivery: '', alert: 'none', ...o });

describe('Намаляващи наличности показва само артикули от Ямбол с до 30% свободна наличност', () => {
  it('An article with 31% free stock is not in the report', () => expect(isLowStock(item({ physical: 41 }))).toBe(false));
  it('An article with exactly 30% free stock is in the report', () => expect(isLowStock(item({}))).toBe(true));
  it('An article in another warehouse is never in the Ямбол report', () => expect(isLowStock(item({ warehouse: 'София', physical: 10 }))).toBe(false));
  it('The sample shows Khamrah 30%, Asad 15%, Afnan 9PM 0%', () => {
    const p = Object.fromEntries(initialLowStockItems().filter(i => i.warehouse === 'Ямбол').map(i => [i.name, freePercent(i)]));
    expect([p['Lattafa Khamrah'], p['Lattafa Asad'], p['Afnan 9PM']]).toEqual([30, 15, 0]);
  });
  it('A zero reference quantity gives 0% without an error', () => expect(freePercent(item({ reference: 0, physical: 0, reserved: 0 }))).toBe(0));
  it('Colours are yellow above 15%, orange above 0% and red at 0%', () => expect([lowStockLevel(30), lowStockLevel(15), lowStockLevel(0)]).toEqual(['yellow', 'orange', 'red']));
});

describe('Свободното количество следва резервациите и доставките', () => {
  it('A reservation lowers free stock', () => expect(freeQty(applyStockEvent(item({}), { type: 'reserve', qty: 5 }))).toBe(25));
  it('Cancelling an order frees the reserved quantity', () => expect(freeQty(applyStockEvent(item({}), { type: 'cancel', qty: 10 }))).toBe(40));
  it('Shipping reserved goods does not lower free stock twice', () => expect(freeQty(applyStockEvent(item({}), { type: 'ship', qty: 10 }))).toBe(30));
  it('A delivery of 100 on 40 physical and 10 reserved gives reference 140 and 92.86%', () => {
    const d = applyStockEvent(item({}), { type: 'delivery', qty: 100, date: '2026-11-25' });
    expect([d.reference, freeQty(d), freePercent(d), d.sold, d.reserved, isLowStock(d)]).toEqual([140, 130, 92.86, 0, 10, false]);
  });
});

describe('Известия за намаляваща наличност', () => {
  it('Reaching 30% creates a notification', () => expect(evaluateAlert(item({})).notice).toBe('low'));
  it('Falling from 30% to 20% sends no second notification', () => expect(evaluateAlert(item({ physical: 30, alert: 'low' })).notice).toBeNull());
  it('Reaching 0% creates an extra notification', () => expect(evaluateAlert(item({ physical: 10, alert: 'low' })).notice).toBe('out'));
  it('Recovering above 30% resets the warning so the next drop notifies again', () => {
    const up = evaluateAlert(item({ physical: 80, alert: 'low' })).item;
    expect(up.alert).toBe('none');
    expect(evaluateAlert({ ...up, physical: 40 }).notice).toBe('low');
  });
});
