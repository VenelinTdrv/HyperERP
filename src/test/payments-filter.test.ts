import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { initial, paymentMatches, paymentTotals, sellerShare, SELLERS, type PaymentFilter } from '@/routes/payments';
import { useOrders } from '@/lib/orders-store';

const empty: PaymentFilter = { q: '', method: '', source: '', status: '', agent: '', from: '', to: '' };
const today = new Date().toLocaleDateString('en-CA');

describe('Payments filter by influencer or merchant', () => {
 it('lists sellers of both kinds in the single person select', () => {
  expect(SELLERS.map(s => s.type)).toEqual(['Инфлуенсър', 'Инфлуенсър', 'Инфлуенсър', 'Търговец на едро']);
  expect(initial.every(r => SELLERS.some(s => s.id === r.agent))).toBe(true);
 });

 it('keeps only the payments of the chosen person', () => {
  const rows = initial.filter(r => paymentMatches(r, { ...empty, agent: 'Елена Петрова' }));
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(r => r.agent === 'Елена Петрова')).toBe(true);
 });

 it('finds a person by name typed in the search field', () => {
  const rows = initial.filter(r => paymentMatches(r, { ...empty, q: 'козметик груп' }));
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(r => r.agent === 'Козметик Груп ООД')).toBe(true);
 });

 it('shows ten payments on the default screen of today', () => {
  expect(initial.filter(r => paymentMatches(r, { ...empty, from: today, to: today })).length).toBe(10);
 });

 it('totals the filtered payments shown in the summary under the table', () => {
  const todays = initial.filter(r => paymentMatches(r, { ...empty, from: today, to: today }));
  const { result, unmount } = renderHook(() => useOrders());
  const shipping = Object.fromEntries(result.current.map(o => [o.id, o.shipping]));
  expect(paymentTotals(todays, shipping)).toEqual({ total: 811.6, cash: 416, shipping: 49, margin: 762.6 });
  unmount();
 });
});

describe('Payments seller share labels', () => {
 const todays: PaymentFilter = { ...empty, from: today, to: today };

 it('shows each seller sales amount and percentage of all sellers', () => {
  const share = sellerShare(initial, todays);
  expect(share).toEqual({
   'Виктория Григорова': { amount: 278.6, pct: '34.3' },
   'Елена Петрова': { amount: 154.4, pct: '19.0' },
   'Мария Иванова': { amount: 146.8, pct: '18.1' },
   'Козметик Груп ООД': { amount: 231.8, pct: '28.6' },
  });
 });

 it('keeps the same amounts and percentages when a person is already chosen', () => {
  expect(sellerShare(initial, { ...todays, agent: 'Елена Петрова' })).toEqual(sellerShare(initial, todays));
 });

 it('recounts amounts and percentages for another period', () => {
  const share = sellerShare(initial, { ...empty, from: today, to: today });
  const week = sellerShare(initial, { ...empty });
  expect(week['Виктория Григорова']!.amount).toBeGreaterThan(share['Виктория Григорова']!.amount);
  expect(SELLERS.every(s => Number(week[s.id]!.pct) > 0)).toBe(true);
 });
});
