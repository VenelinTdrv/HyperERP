import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';

import { routeTree } from '@/routeTree.gen';

const BACK_LABEL = 'Назад към менюто на мобилното приложение';
const NAV_NAME = 'Меню на мобилното приложение';

function renderAt(path: '/mobile-app' | '/mobile-app/articles') {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient: new QueryClient() },
  });
  return render(<RouterProvider router={router} />);
}

describe('Mobile app menu', () => {
  it('shows the three menu buttons only on the menu screen', async () => {
    renderAt('/mobile-app');
    const nav = await screen.findByRole('navigation', { name: NAV_NAME });
    expect(Array.from(nav.querySelectorAll('a')).map(a => a.textContent?.trim())).toEqual(['Артикули', 'Доставки', 'Ревизия']);
    expect(screen.queryByLabelText(BACK_LABEL)).toBeNull();
  });

  it('hides the menu buttons and offers a back arrow inside a chosen screen', async () => {
    renderAt('/mobile-app/articles');
    expect(await screen.findByLabelText(BACK_LABEL)).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: NAV_NAME })).toBeNull();
    for (const title of ['Артикули', 'Доставки', 'Ревизия']) {
      expect(screen.queryByRole('button', { name: title })).toBeNull();
    }
  });
});
