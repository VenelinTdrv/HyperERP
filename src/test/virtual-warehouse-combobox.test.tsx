import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

// The shell only wraps the screen in navigation, which this test does not exercise.
vi.mock('@/components/workspace-shell', () => ({
  WorkspaceShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const { VirtualWarehouseOrders } = await import('@/components/virtual-warehouse-orders');

const FIELD = 'Търсене или избор на инфлуенсър или служител';
const ALL = 'Всички инфлуенсъри и служители';

async function renderReport() {
  render(<VirtualWarehouseOrders />);
  await screen.findAllByText('Перлана');
  return screen.getByRole('combobox', { name: FIELD }) as HTMLInputElement;
}

// The eye button of every visible row; its label carries the order number.
const rows = () => screen.getAllByRole('button', { name: /^Преглед VW-/ }).map(button => button.getAttribute('aria-label'));

describe('Virtual warehouse single search-and-pick filter', () => {
  it('leaves exactly one filter, which is a text field with a dropdown', async () => {
    await renderReport();
    const filterRow = screen.getByRole('combobox', { name: FIELD }).closest('.reports-filters') as HTMLElement;
    expect(within(filterRow).getAllByRole('combobox')).toHaveLength(1);
    // The old warehouse picker is gone; only the records-per-page select outside this row remains.
    expect(screen.queryByRole('combobox', { name: 'Склад' })).toBeNull();
    expect(within(filterRow).queryAllByRole('listbox')).toHaveLength(0);
    expect(screen.getByRole('combobox', { name: FIELD })).toHaveAttribute('aria-expanded', 'false');
  });

  it('offers every influencer and employee to pick from', async () => {
    const field = await renderReport();
    fireEvent.focus(field);
    const list = await screen.findByRole('listbox');
    expect(within(list).getByRole('option', { name: new RegExp(ALL) })).toBeTruthy();
    expect(within(list).getByText('Инфлуенсъри')).toBeTruthy();
    expect(within(list).getByText('Служители')).toBeTruthy();
    expect(within(list).getByRole('option', { name: /^Виктория Григорова/ })).toHaveTextContent('4 поръчки · 50%');
    expect(within(list).getByRole('option', { name: /^Венелин Тодоров/ })).toHaveTextContent('Служител');
    expect(field).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the text search and narrows the people list with it', async () => {
    const field = await renderReport();
    fireEvent.change(field, { target: { value: 'Перлана' } });
    const list = screen.getByRole('listbox');
    // Only the two people credited with Перлана's orders remain; their share is still of all orders.
    expect(within(list).getAllByRole('option')).toHaveLength(3);
    expect(within(list).getByRole('option', { name: /^Виктория Григорова/ })).toHaveTextContent('2 поръчки · 25%');
    expect(rows()).toEqual(['Преглед VW-1001', 'Преглед VW-1009', 'Преглед VW-1010']);
  });

  it('applies the picked influencer', async () => {
    const field = await renderReport();
    fireEvent.focus(field);
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: /^Виктория Григорова/ }));
    expect(field.value).toBe('Виктория Григорова');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(rows()).toEqual(['Преглед VW-1001', 'Преглед VW-1002', 'Преглед VW-1006', 'Преглед VW-1009']);
  });

  it('applies a picked employee through the same field', async () => {
    const field = await renderReport();
    fireEvent.focus(field);
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: /^Цветан Стоянов/ }));
    expect(field.value).toBe('Цветан Стоянов');
    expect(rows()).toEqual(['Преглед VW-1010']);
  });

  it('shows who is credited with every order', async () => {
    const field = await renderReport();
    fireEvent.change(field, { target: { value: 'Перлана' } });
    // Close the panel first, so the names are only counted in the table.
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.getAllByText('Виктория Григорова')).toHaveLength(2);
    expect(screen.getByText('Цветан Стоянов')).toBeTruthy();
  });

  it('moves the highlight with the arrow keys and applies it with Enter', async () => {
    const field = await renderReport();
    fireEvent.focus(field);
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    // Scoped to the panel: the records-per-page select below also exposes options.
    expect(within(screen.getByRole('listbox')).getByRole('option', { selected: true })).toHaveTextContent(ALL);
    fireEvent.keyDown(field, { key: 'ArrowDown' });
    expect(within(screen.getByRole('listbox')).getByRole('option', { selected: true })).toHaveTextContent('Виктория Григорова');
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(field.value).toBe('Виктория Григорова');
    expect(rows()).toHaveLength(4);
  });

  it('returns to everybody from the list and clears with Изчисти', async () => {
    const field = await renderReport();
    fireEvent.change(field, { target: { value: 'Виктория' } });
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: new RegExp(ALL) }));
    expect(field.value).toBe('');
    expect(rows()).toHaveLength(8);
    fireEvent.change(field, { target: { value: 'Перлана' } });
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Изчисти' }));
    expect(field.value).toBe('');
    expect(rows()).toHaveLength(8);
  });
});
