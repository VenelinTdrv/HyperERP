import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES, useOrders } from '@/lib/orders-store';
import { SELLERS, ASSISTANTS, assistantWorksFor } from '@/lib/sellers';
import { INFLUENCERS, emptyFilters, orderMatches, viewSeller, displayStatus, statusOptions } from '@/routes/_workspace/orders';

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
    expect(asInfluencer.map(row => row.id)).toEqual(['ORD-0027', 'ORD-0024', 'ORD-0021', 'ORD-0018']);
  });

  it('every assistant works for a real influencer', () => {
    expect(ASSISTANTS.length).toBeGreaterThan(0);
    expect(ASSISTANTS.every(a => INFLUENCERS.includes(a.worksFor))).toBe(true);
  });

  it('the assistant preview shows the orders of the influencer they work for', () => {
    const all = demoOrders();
    const asAssistant = all.filter(row => orderMatches(row, { ...emptyFilters, seller: viewSeller('assistant', 'Десислава Колева') }));
    expect(assistantWorksFor('Десислава Колева')).toBe('Виктория Григорова');
    expect(asAssistant.map(row => row.id)).toEqual(['ORD-0027', 'ORD-0026', 'ORD-0025', 'ORD-0024', 'ORD-0021', 'ORD-0018']);
    expect(asAssistant.every(row => row.influencer === 'Виктория Григорова')).toBe(true);
  });

  it('shows unprocessed orders as „Записана" only in the assistant preview', () => {
    expect(displayStatus('assistant', 'Необработена')).toBe('Записана');
    expect(displayStatus('assistant', 'Обработена')).toBe('Обработена');
    expect(displayStatus('assistant', 'Анулирана')).toBe('Анулирана');
    expect(displayStatus('influencer', 'Необработена')).toBe('Необработена');
    expect(displayStatus('admin', 'Необработена')).toBe('Необработена');
  });

  it('keeps „Записана" a real status of its own, with three saved orders in the influencer preview', () => {
    expect(ORDER_STATUSES).toContain('Записана');
    const saved = demoOrders().filter(row => row.status === 'Записана');
    expect(saved.map(row => row.id)).toEqual(['ORD-0027', 'ORD-0026', 'ORD-0025']);
    expect(saved.every(row => row.influencer === 'Виктория Григорова')).toBe(true);
    expect(displayStatus('influencer', 'Записана')).toBe('Записана');
    expect(displayStatus('assistant', 'Записана')).toBe('Записана');
  });

  it('offers „Записана" in the status choices of every preview, and drops „Необработена" only for the assistant', () => {
    expect(statusOptions('admin')).toEqual(['Записана', 'Необработена', 'Обработена', 'Анулирана']);
    expect(statusOptions('influencer')).toEqual(['Записана', 'Необработена', 'Обработена', 'Анулирана']);
    expect(statusOptions('assistant')).toEqual(['Записана', 'Обработена', 'Анулирана']);
  });

  it('shows exactly the three saved orders when the influencer filters by „Записана"', () => {
    const saved = demoOrders().filter(row => orderMatches(row, { ...emptyFilters, seller: viewSeller('influencer', 'Виктория Григорова') })
      && displayStatus('influencer', row.status) === 'Записана');
    expect(saved.map(row => row.id)).toEqual(['ORD-0027', 'ORD-0026', 'ORD-0025']);
    expect(saved.every(row => row.processed === undefined)).toBe(true);
  });
});
