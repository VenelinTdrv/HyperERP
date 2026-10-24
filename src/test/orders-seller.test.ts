import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOrders } from '@/lib/orders-store';
import { SELLERS, sellerType } from '@/lib/sellers';
import { emptyFilters, orderMatches, sellerShare } from '@/routes/_authenticated/orders';

describe('Orders seller column', () => {
  it('gives every demo order a known influencer or wholesale trader', () => {
    const { result, unmount } = renderHook(() => useOrders());
    const rows = result.current;
    unmount();
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => SELLERS.some(s => s.id === row.influencer))).toBe(true);
  });

  it('shows the seller type used by the column', () => {
    expect(sellerType('Козметик Груп ООД')).toBe('Търговец на едро');
    expect(sellerType('Виктория Григорова')).toBe('Инфлуенсър');
    expect(sellerType('Неизвестен')).toBe('');
  });
});

const demoOrders = () => { const { result, unmount } = renderHook(() => useOrders()); const rows = result.current; unmount(); return rows; };

describe('Orders „Всички инфлуенсъри и търговци" filter', () => {
  it('keeps only the chosen person\'s orders, and everyone when nothing is chosen', () => {
    const all = demoOrders();
    expect(all.filter(row => orderMatches(row, emptyFilters)).length).toBe(all.length);
    expect(all.filter(row => orderMatches(row, { ...emptyFilters, seller: 'Елена Петрова' })).map(row => row.id))
      .toEqual(['ORD-0023', 'ORD-0019', 'ORD-0015']);
    expect(all.filter(row => orderMatches(row, { ...emptyFilters, seller: 'Козметик Груп ООД' })).map(row => row.id))
      .toEqual(['ORD-0022', 'ORD-0016']);
  });

  it('labels each seller with order count and share that add up, unchanged by the chosen person', () => {
    const all = demoOrders();
    const share = sellerShare(all, emptyFilters);
    expect(share['Виктория Григорова']).toEqual({ count: 3, pct: '30.0' });
    expect(share['Мария Иванова']).toEqual({ count: 2, pct: '20.0' });
    expect(Object.values(share).reduce((a, s) => a + s.count, 0)).toBe(all.length);
    expect(sellerShare(all, { ...emptyFilters, seller: 'Елена Петрова' })).toEqual(share);
  });
});
