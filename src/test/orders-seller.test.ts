import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOrders } from '@/lib/orders-store';
import { SELLERS, sellerType } from '@/lib/sellers';

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
