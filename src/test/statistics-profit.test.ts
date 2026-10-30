import { describe, expect, it } from 'vitest';
import { SELLERS, buildDays } from '@/routes/_workspace/statistics';

// The "Печалба по месеци" bar chart is built from the same demo days as the
// order charts, so profit must always stay a sensible share of the turnover.
describe('monthly profit in Статистика', () => {
  const days = buildDays(SELLERS[0]!, 0, null);
  const oct2026 = days.filter(p => p.d.getFullYear() === 2026 && p.d.getMonth() === 9);

  it('has a profit row for every day of the demo window', () => {
    expect(days.length).toBeGreaterThan(365);
    expect(oct2026.length).toBe(31);
  });

  it('keeps profit positive but never above the turnover', () => {
    for (const p of oct2026) {
      expect(p.profit).toBeGreaterThan(0);
      expect(p.profit).toBeLessThan(p.revenue);
    }
  });

  it('lands inside the demo gross margin band once returns are taken off', () => {
    const revenue = oct2026.reduce((a, p) => a + p.revenue, 0);
    const profit = oct2026.reduce((a, p) => a + p.profit, 0);
    const share = profit / revenue;
    expect(share).toBeGreaterThan(0.25);
    expect(share).toBeLessThan(0.6);
  });

  it('does not invent profit for a seller with no orders', () => {
    const quiet = buildDays(SELLERS[0]!, 0, { weight: 0 });
    expect(quiet.reduce((a, p) => a + p.profit, 0)).toBe(0);
  });
});
