import { describe, expect, it } from 'vitest';
import { ARTICLE_CATEGORIES } from '@/routes/_workspace/articles';
import { initialCategories } from '@/routes/_workspace/categories';

describe('Renamed category: LEGO → Некатегоризирани', () => {
  it('uses Некатегоризирани in the articles catalog and never LEGO', () => {
    expect(ARTICLE_CATEGORIES).toContain('Некатегоризирани');
    expect(ARTICLE_CATEGORIES.some(name => /lego/i.test(name))).toBe(false);
  });

  it('uses Некатегоризирани as a top-level category in the categories screen', () => {
    const renamed = initialCategories.find(row => row.name === 'Некатегоризирани');
    expect(renamed).toBeDefined();
    expect(renamed?.parentId).toBeNull();
    expect(initialCategories.some(row => /lego/i.test(row.name))).toBe(false);
  });
});
