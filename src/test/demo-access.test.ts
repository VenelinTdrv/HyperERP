import { describe, expect, it, vi } from 'vitest';

const privateRead = vi.fn(() => { throw new Error('Private access is forbidden'); });
vi.mock('@/lib/erp.functions', () => ({ getErpLists: privateRead, getCurrentProfile: privateRead }));

describe('Workspace without login', () => {
  it('loads sales, orders and articles without calling private services', async () => {
    const { erpListsQuery } = await import('@/lib/erp-query');
    const result = await erpListsQuery.queryFn?.({} as never);
    expect(result?.orders.length).toBe(13);
    expect(result?.sales.length).toBe(13);
    expect(result?.articles.length).toBe(4);
    expect(privateRead).not.toHaveBeenCalled();
    expect(erpListsQuery.queryKey).toEqual(['demo', 'erp', 'lists']);
  });

  it('uses a demo identity instead of requesting a real profile', async () => {
    const { profileQuery } = await import('@/lib/erp-query');
    const result = await profileQuery.queryFn?.({} as never);
    expect(result).toEqual({ name: 'Демо преглед', role: 'Примерни данни' });
    expect(privateRead).not.toHaveBeenCalled();
  });
});