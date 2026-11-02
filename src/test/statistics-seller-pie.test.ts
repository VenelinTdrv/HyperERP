import { describe, expect, it } from 'vitest';
import { sellerPieData } from '@/routes/_workspace/statistics';

// The pie in Статистика shows order count and share of all per influencer / trader
// for the period chosen in the calendar.
describe('orders per seller pie in Статистика', () => {
  const from = new Date(2026, 9, 1);
  const to = new Date(2026, 9, 31);

  it('gives every seller a slice with a count, a share and a colour key', () => {
    const rows = sellerPieData('', from, to);
    expect(rows).toHaveLength(4);
    for (const r of rows) {
      expect(r.key).toMatch(/^s\d$/);
      expect(r.orders).toBeGreaterThan(0);
      expect(r.pct).toBeGreaterThan(0);
    }
  });

  it('ranks slices from most to fewest orders and the shares add up to 100%', () => {
    const rows = sellerPieData('', from, to);
    const counts = rows.map(r => r.orders);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
    const total = counts.reduce((a, b) => a + b, 0);
    expect(Math.abs(rows.reduce((a, r) => a + r.pct, 0) - 100)).toBeLessThanOrEqual(0.2);
    expect(rows[0]!.pct).toBeCloseTo((rows[0]!.orders / total) * 100, 1);
  });

  it('follows the chosen settlement and the chosen period', () => {
    const all = sellerPieData('', from, to).reduce((a, r) => a + r.orders, 0);
    const jambol = sellerPieData('Ямбол', from, to).reduce((a, r) => a + r.orders, 0);
    const quarter = sellerPieData('', new Date(2026, 6, 1), new Date(2026, 8, 30)).reduce((a, r) => a + r.orders, 0);
    expect(jambol).toBeGreaterThan(0);
    expect(jambol).toBeLessThan(all);
    expect(quarter).not.toBe(all);
  });
});
