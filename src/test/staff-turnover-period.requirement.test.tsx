import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StaffTurnoverReport } from '@/components/staff-turnover-report';
import { sellerTurnover, staffTurnoverRows, turnoverOrders } from '@/lib/staff-turnover';

vi.mock('@/components/workspace-shell', () => ({
  WorkspaceShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Fixed "today" inside November 2026 so the default period is predictable.
const TODAY = new Date(2026, 10, 26);
const money = (value: number) => new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

const open = () => render(<StaffTurnoverReport today={TODAY} />);
const periodInputs = () => [screen.getByLabelText('Период от'), screen.getByLabelText('Период до')] as const;

describe('The turnover report opens on the current month', () => {
  it('Opening the report on 26 November 2026 shows the period 01.11.2026 – 26.11.2026', () => {
    open();
    const [from, to] = periodInputs();
    expect((from as HTMLInputElement).value).toBe('2026-11-01');
    expect((to as HTMLInputElement).value).toBe('2026-11-26');
    expect(screen.getByRole('heading', { name: /Избран период: 01\.11\.2026 – 26\.11\.2026/ })).toBeInTheDocument();
  });

  it('The turnover shown for the chosen period equals the turnover for November up to today', () => {
    const orders = turnoverOrders(TODAY);
    const expected = staffTurnoverRows(orders, TODAY, '2026-11-01', '2026-11-26').reduce((sum, row) => sum + row.period, 0);
    open();
    const cells = screen.getAllByText(/^Общо$/);
    const totalRow = cells[cells.length - 1]!.closest('tr')!;
    const last = totalRow.querySelector('td:last-child')!;
    expect(last.textContent).toBe(money(expected));
  });

  it('Clearing the filters brings back the current month, not the previous one', () => {
    open();
    const [from, to] = periodInputs();
    fireEvent.change(from, { target: { value: '2026-10-01' } });
    fireEvent.change(to, { target: { value: '2026-10-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Изчисти' }));
    expect((screen.getByLabelText('Период от') as HTMLInputElement).value).toBe('2026-11-01');
    expect((screen.getByLabelText('Период до') as HTMLInputElement).value).toBe('2026-11-26');
  });

  it('The current month is not the previous month: October stays behind the date fields', () => {
    const orders = turnoverOrders(TODAY);
    const october = staffTurnoverRows(orders, TODAY, '2026-10-01', '2026-10-31').reduce((sum, row) => sum + row.period, 0);
    const november = sellerTurnover(orders, 'Мария Иванова', '2026-11-01', '2026-11-26');
    open();
    const cells = screen.getAllByText(/^Общо$/);
    const totalRow = cells[cells.length - 1]!.closest('tr')!;
    expect(totalRow.querySelector('td:last-child')!.textContent).not.toBe(money(october));
    expect(november).toBeGreaterThan(0);
  });
});
