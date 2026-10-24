import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SELLERS } from '@/lib/sellers';
import { useOrders } from '@/lib/orders-store';
import { emptyFilters, initialRows, saleMatches, sellerShare } from '@/routes/_workspace/index';

const byId = (rows: { id: string; influencer?: string }[]) => Object.fromEntries(rows.map(r => [r.id, r.influencer]));

describe('Продажби „Всички инфлуенсъри и търговци" filter', () => {
  it('keeps only the chosen person\'s sales, and everyone when nothing is chosen', () => {
    expect(initialRows.filter(row => saleMatches(row, emptyFilters)).length).toBe(10);
    expect(initialRows.filter(row => saleMatches(row, { ...emptyFilters, seller: 'Елена Петрова' })).map(row => row.id))
      .toEqual(['ORD-0023', 'ORD-0019', 'ORD-0015']);
    expect(initialRows.filter(row => saleMatches(row, { ...emptyFilters, seller: 'Козметик Груп ООД' })).map(row => row.id))
      .toEqual(['ORD-0022', 'ORD-0016']);
  });

  it('labels each seller with sale count and share that add up, unchanged by the chosen person', () => {
    const share = sellerShare(initialRows, emptyFilters);
    expect(share['Виктория Григорова']).toEqual({ count: 3, pct: '30.0' });
    expect(share['Козметик Груп ООД']).toEqual({ count: 2, pct: '20.0' });
    expect(Object.values(share).reduce((a, s) => a + s.count, 0)).toBe(initialRows.length);
    expect(sellerShare(initialRows, { ...emptyFilters, seller: 'Елена Петрова' })).toEqual(share);
  });

  it('credits every sale to a known seller and to the same person as the matching order', () => {
    expect(initialRows.every(row => SELLERS.some(s => s.id === row.influencer))).toBe(true);
    const { result, unmount } = renderHook(() => useOrders());
    const orders = result.current;
    unmount();
    expect(byId(initialRows)).toEqual(byId(orders));
  });
});
