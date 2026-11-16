import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';

import { Route as MobileAppRoute } from '@/routes/_workspace/mobile-app';
import { Route as MobileArticlesRoute } from '@/routes/_workspace/mobile-app.articles';

const BACK_LABEL = 'Назад към менюто на мобилното приложение';

function renderAt(path: '/mobile-app' | '/mobile-app/articles') {
  const root = createRootRoute({ component: () => <Outlet /> });
  const parent = createRoute({ getParentRoute: () => root, path: '/mobile-app', component: MobileAppRoute.options.component });
  const child = createRoute({ getParentRoute: () => parent, path: 'articles', component: MobileArticlesRoute.options.component });
  const routeTree = root.addChildren([parent.addChildren([child])]);
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
    const nav = await screen.findByRole('navigation', { name: 'Меню на мобилното приложение' });
    expect(nav.querySelectorAll('a').length).toBe(3);
    expect(screen.queryByLabelText(BACK_LABEL)).toBeNull();
  });

  it('hides the menu buttons and offers a back arrow inside a chosen screen', async () => {
    renderAt('/mobile-app/articles');
    expect(await screen.findByLabelText(BACK_LABEL)).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Меню на мобилното приложение' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Артикули' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Доставки' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Ревизия' })).toBeNull();
  });
});
