import { describe, expect, it } from 'vitest';

import { initial, paymentMatches, paymentTotals, SELLER_TYPES, type PaymentFilter } from '@/routes/payments';

const empty: PaymentFilter = { q: '', method: '', source: '', status: '', type: '', agent: '', from: '', to: '' };
const today = new Date().toLocaleDateString('en-CA');

describe('Payments filter by influencer or merchant', () => {
 it('offers exactly the two seller types', () => {
  expect(SELLER_TYPES).toEqual(['Инфлуенсър', 'Търговец на едро']);
 });

 it('drops wholesale payments when the type filter is Инфлуенсър', () => {
  const rows = initial.filter(r => paymentMatches(r, { ...empty, type: 'Инфлуенсър' }));
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(r => r.agent !== 'Козметик Груп ООД')).toBe(true);
 });

 it('keeps only the wholesale merchant when the type filter is Търговец на едро', () => {
  const rows = initial.filter(r => paymentMatches(r, { ...empty, type: 'Търговец на едро' }));
  expect(rows.length).toBeGreaterThan(0);
  expect(new Set(rows.map(r => r.agent))).toEqual(new Set(['Козметик Груп ООД']));
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
  expect(paymentTotals(todays)).toEqual({ total: 597, cash: 373 });
 });
});
