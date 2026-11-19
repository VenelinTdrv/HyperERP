import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

// The shell only wraps the screen in navigation, which this test does not exercise.
vi.mock('@/components/workspace-shell', () => ({
  WorkspaceShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const { VirtualWarehouseOrders } = await import('@/components/virtual-warehouse-orders');

const EXPANDER = /^Разгъни поръчките на/;

async function renderReport() {
  render(<VirtualWarehouseOrders />);
  await screen.findAllByText('Перлана');
}

describe('Virtual warehouse client order expander', () => {
  it('offers an expander only for the client with more than one order', async () => {
    await renderReport();
    const expanders = screen.getAllByRole('button', { name: EXPANDER });
    expect(expanders).toHaveLength(3);
    for (const expander of expanders) {
      expect(expander.getAttribute('aria-label')).toBe('Разгъни поръчките на Перлана');
      expect(expander).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('shows every order of the client under the row when expanded', async () => {
    await renderReport();
    fireEvent.click(screen.getAllByRole('button', { name: EXPANDER })[0]!);
    const heading = await screen.findByText(/Всички поръчки към Перлана/);
    expect(heading.textContent).toContain('(3)');
    const block = heading.closest('.reports-client-block') as HTMLElement;
    const labels = new Set(within(block).getAllByRole('button', { name: /^Преглед VW-/ }).map(button => button.getAttribute('aria-label')));
    expect([...labels].sort()).toEqual(['Преглед VW-1001', 'Преглед VW-1009', 'Преглед VW-1010']);
    // Per-order totals are listed; the aggregate for the client stays in the summary cards above.
    expect(within(block).queryByText(/122,00/)).toBeNull();
    expect(within(block).getAllByText(/38,00/).length).toBeGreaterThan(0);
  });

  it('hides the order list again when the expander is pressed a second time', async () => {
    await renderReport();
    fireEvent.click(screen.getAllByRole('button', { name: EXPANDER })[0]!);
    await screen.findByText(/Всички поръчки към Перлана/);
    fireEvent.click(screen.getByRole('button', { name: 'Свий поръчките на Перлана' }));
    expect(screen.queryByText(/Всички поръчки към Перлана/)).toBeNull();
    expect(screen.getAllByRole('button', { name: EXPANDER })[0]).toHaveAttribute('aria-expanded', 'false');
  });
});
