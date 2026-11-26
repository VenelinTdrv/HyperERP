import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { StaffTurnoverReport } from '@/components/staff-turnover-report';

vi.mock('@/components/workspace-shell', () => ({
  WorkspaceShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const open = () => render(<StaffTurnoverReport today={new Date(2026, 10, 26)} />);
const table = () => within(screen.getByRole('table'));

describe('Оборотът се филтрира с общо поле за търсене и избор на инфлуенсър или служител', () => {
  it('Потребителят избира служител от списъка и вижда само неговия оборот', () => {
    open();
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: /Цветан Стоянов/ }));
    expect(table().getByText('Цветан Стоянов')).toBeInTheDocument();
    expect(table().queryByText('Мария Иванова')).not.toBeInTheDocument();
  });

  it('Потребителят търси инфлуенсър по част от името в същото поле', () => {
    open();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Мария' } });
    expect(screen.getByRole('option', { name: /Мария Иванова/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Цветан Стоянов/ })).not.toBeInTheDocument();
    expect(table().getByText('Мария Иванова')).toBeInTheDocument();
    expect(table().queryByText('Цветан Стоянов')).not.toBeInTheDocument();
  });

  it('Потребителят избира всички и възстановява оборота на всички хора', () => {
    open();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Мария' } });
    fireEvent.click(screen.getByRole('option', { name: 'Всички инфлуенсъри и служители' }));
    expect(table().getByText('Мария Иванова')).toBeInTheDocument();
    expect(table().getByText('Цветан Стоянов')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
});