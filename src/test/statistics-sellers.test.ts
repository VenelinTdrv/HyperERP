import { describe, expect, it } from 'vitest';
import { pickSellers, sellerShareStats } from '@/routes/statistics';

// The seller dropdown in Статистика covers both roles on its own, so a separate
// "type" filter is not allowed to narrow it again.
describe('seller list in Статистика', () => {
  it('lists every influencer and wholesale trader when nobody is chosen', () => {
    expect(pickSellers('').map(s => s.id)).toEqual([
      'Виктория Григорова',
      'Елена Петрова',
      'Мария Иванова',
      'Козметик Груп ООД',
    ]);
  });

  it('narrows to the chosen seller only', () => {
    expect(pickSellers('Елена Петрова').map(s => s.id)).toEqual(['Елена Петрова']);
  });
});

// The seller dropdown labels show each seller's order count and share of the
// period total, in the same format as the settlement dropdown.
describe('seller share stats in Статистика', () => {
  const from = new Date(2026, 9, 1);
  const to = new Date(2026, 9, 31);

  it('covers every seller with a count and a percentage', () => {
    const stats = sellerShareStats('', from, to);
    expect(Object.keys(stats)).toEqual(['Виктория Григорова', 'Елена Петрова', 'Мария Иванова', 'Козметик Груп ООД']);
    for (const s of Object.values(stats)) {
      expect(s.orders).toBeGreaterThan(0);
      expect(s.pct).toMatch(/^\d+(\.\d)?$/);
    }
  });

  it('makes the percentages add up to 100%', () => {
    const stats = sellerShareStats('', from, to);
    const total = Object.values(stats).reduce((a, s) => a + s.orders, 0);
    const pctSum = Object.values(stats).reduce((a, s) => a + Number(s.pct), 0);
    expect(Math.abs(pctSum - 100)).toBeLessThanOrEqual(0.2);
    expect(total).toBeGreaterThan(0);
  });

  it('narrows counts when one settlement is chosen', () => {
    const all = sellerShareStats('', from, to);
    const jambol = sellerShareStats('Ямбол', from, to);
    expect(jambol['Виктория Григорова']!.orders).toBeLessThan(all['Виктория Григорова']!.orders);
  });
});
