import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';

vi.mock('@/components/workspace-shell', () => ({
  WorkspaceShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const { Route } = await import('@/routes/_workspace/mobile-app');

const BACK_LABEL = 'Назад към менюто на мобилното приложение';
const NAV_NAME = 'Меню на мобилното приложение';

function renderAt(path: string) {
  const root = createRootRoute({ component: () => <Outlet /> });
  const parent = createRoute({ getParentRoute: () => root, path: '/mobile-app', component: Route.options.component as () => ReactNode });
  const screens = ['articles', 'deliveries', 'inventory'].map(name => createRoute({ getParentRoute: () => parent, path: name, component: () => <div /> }));
  const router = createRouter({
    routeTree: root.addChildren([parent.addChildren(screens)]),
    history: createMemoryHistory({ initialEntries: [path] }),
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
  });
});
