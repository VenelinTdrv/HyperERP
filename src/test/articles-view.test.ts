import { describe, expect, it } from 'vitest';
import { ARTICLE_INFLUENCERS, articleViewCapabilities } from '@/routes/_workspace/articles';
import { SELLERS } from '@/lib/sellers';

describe('Articles preview as Админ / Инфлуенсър', () => {
  it('offers only real influencers, never the wholesale trader', () => {
    expect(ARTICLE_INFLUENCERS).toEqual(['Виктория Григорова', 'Елена Петрова', 'Мария Иванова']);
    expect(ARTICLE_INFLUENCERS.every(id => SELLERS.find(s => s.id === id)?.type === 'Инфлуенсър')).toBe(true);
  });

  it('keeps catalog management, selection and audit details in the admin view only', () => {
    expect(articleViewCapabilities('admin')).toEqual({ manage: true, audit: true, select: true });
    expect(articleViewCapabilities('influencer')).toEqual({ manage: false, audit: false, select: false });
  });
});
