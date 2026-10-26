import { describe, expect, it } from 'vitest';
import { REPORT_ARTICLES, REPORT_WAREHOUSES, reportRows } from '@/lib/reports-data';

describe('warehouse report fixtures', () => {
  it('exposes ten products per warehouse so the details dialog shows a full page', () => {
    expect(REPORT_ARTICLES).toHaveLength(10);
    for (const warehouse of REPORT_WAREHOUSES) {
      expect(reportRows('articles', '', warehouse)).toHaveLength(10);
    }
  });

  it('keeps exhausted batches a subset of the same articles', () => {
    const exhausted = reportRows('exhausted');
    expect(exhausted.length).toBeGreaterThan(0);
    expect(exhausted.length).toBeLessThan(REPORT_ARTICLES.length * REPORT_WAREHOUSES.length);
    expect(exhausted.every(row => row.quantity === 0)).toBe(true);
  });
});
