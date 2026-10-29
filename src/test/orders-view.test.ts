import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOrders } from '@/lib/orders-store';
import { SELLERS } from '@/lib/sellers';
import { INFLUENCERS, emptyFilters, orderMatches, viewSeller } from '@/routes/_workspace/orders';

const demoOrders = () => { const { result, unmount } = renderHook(() => useOrders()); const rows = result.current; unmount(); return rows; };

describe('Orders preview as Админ / Инфлуенсър', () => {
  it('offers only real influencers to preview as, never the wholesale trader', () => {
    expect(INFLUENCERS).toEqual(['Виктория Григорова', 'Елена Петрова', 'Мария Иванова']);
    expect(INFLUENCERS.every(id => SELLERS.find(s => s.id === id)?.type === 'Инфлуенсър')).toBe(true);
  });

  it('locks the list to the chosen influencer, while the admin keeps every order', () => {
    const all = demoOrders();
    const asInfluencer = all.filter(row => orderMatches(row, { ...emptyFilters, seller: viewSeller('influencer', 'Елена Петрова') }));
    expect(asInfluencer.map(row => row.id)).toEqual(['ORD-0023', 'ORD-0019', 'ORD-0015']);
    expect(asInfluencer.every(row => row.influencer === 'Елена Петрова')).toBe(true);
    expect(all.filter(row => orderMatches(row, { ...emptyFilters, seller: viewSeller('admin', 'Елена Петрова') })).length).toBe(all.length);
  });

  it('keeps the other filters working inside the influencer preview', () => {
    const asInfluencer = demoOrders().filter(row => orderMatches(row, { ...emptyFilters, city: 'София', seller: viewSeller('influencer', 'Виктория Григорова') }));
    expect(asInfluencer.map(row => row.id)).toEqual(['ORD-0024', 'ORD-0021', 'ORD-0018']);
  });
});
