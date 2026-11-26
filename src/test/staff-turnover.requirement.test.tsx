import { describe, expect, it } from 'vitest';
import { sellerTurnover, staffTurnoverRows, type TurnoverOrder } from '@/lib/staff-turnover';

const item = (quantity: number, salePrice: number, minPrice: number) => ({ sku: 'X', name: 'X', quantity, salePrice, minPrice });
const orders: TurnoverOrder[] = [
  { id: 'A', seller: 'Мария Иванова', date: '2026-11-10', status: 'Доставена', paid: true, items: [item(2, 64, 38), item(1, 55, 32)] },
  { id: 'B', seller: 'Мария Иванова', date: '2026-10-15', status: 'Доставена', paid: true, items: [item(1, 48, 29)] },
  { id: 'C', seller: 'Мария Иванова', date: '2026-11-12', status: 'Отказана', paid: true, items: [item(5, 48, 29)] },
  { id: 'D', seller: 'Мария Иванова', date: '2025-12-20', status: 'Доставена', paid: true, items: [item(1, 48, 29)] },
];

describe('Turnover per influencer or employee is counted at minimum prices', () => {
  it('An order of 2 × €38 and 1 × €32 minimum price counts as €108, not the sale price', () => {
    expect(sellerTurnover(orders.slice(0, 1), 'Мария Иванова', '', '')).toBe(108);
  });
  it('A cancelled order does not add to the turnover', () => {
    expect(sellerTurnover(orders, 'Мария Иванова', '2026-11-01', '2026-11-30')).toBe(108);
  });
  it('A delivered but unpaid order and a paid order still on its way do not count', () => {
    const open: TurnoverOrder[] = [
      { id: 'E', seller: 'Мария Иванова', date: '2026-11-11', status: 'Доставена', paid: false, items: [item(1, 64, 38)] },
      { id: 'F', seller: 'Мария Иванова', date: '2026-11-11', status: 'Изпратена', paid: true, items: [item(1, 64, 38)] },
    ];
    expect(sellerTurnover(open, 'Мария Иванова', '', '')).toBe(0);
  });
  it('Current month, current year and the chosen period are counted separately', () => {
    const row = staffTurnoverRows(orders, new Date(2026, 10, 26), '2026-10-01', '2026-10-31').find(r => r.name === 'Мария Иванова')!;
    expect(row).toMatchObject({ month: 108, year: 137, period: 29 });
  });
});
