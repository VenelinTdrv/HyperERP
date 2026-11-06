import { describe, expect, it } from 'vitest';
import { ARTICLE_CATEGORIES } from '@/routes/_workspace/articles';
import { initialCategories } from '@/routes/_workspace/categories';
import { getDemoErpLists } from '@/lib/demo-erp';

// „Козметика“ and its whole branch were removed; their articles live in „Некатегоризирани“.
const REMOVED = ['Козметика', 'Парфюми', 'Дезодоранти', 'Креми', 'Дамски парфюми', 'Мъжки парфюми'];

describe('Removed category: Козметика and its whole branch', () => {
  it('keeps no cosmetics category in the articles sidebar', () => {
    expect(ARTICLE_CATEGORIES.some(name => REMOVED.includes(name))).toBe(false);
    expect(ARTICLE_CATEGORIES).toEqual(['Некатегоризирани', 'Техника']);
  });

  it('keeps no cosmetics category in the categories tree and leaves no orphan rows', () => {
    expect(initialCategories.some(row => REMOVED.includes(row.name))).toBe(false);
    const ids = new Set(initialCategories.map(row => row.id));
    expect(initialCategories.filter(row => row.parentId !== null).every(row => ids.has(row.parentId))).toBe(true);
  });

  it('moves every demonstration article out of the removed branch into Некатегоризирани', () => {
    const lists = getDemoErpLists();
    expect(lists.articles.length).toBeGreaterThan(0);
    expect(lists.categories.some(row => REMOVED.includes(row.name))).toBe(false);
    const names = new Map(lists.categories.map(row => [row.id, row.name]));
    expect(lists.articles.every(article => names.get(article.category_id) === 'Некатегоризирани')).toBe(true);
  });
});
