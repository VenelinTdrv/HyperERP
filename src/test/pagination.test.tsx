import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PAGE_SIZES, Pagination } from '@/components/pagination';

describe('Records per page', () => {
  it('offers 25, 50, 100 and Всички records per page', () => {
    render(<Pagination total={120} page={1} pageSize={25} onPage={() => {}} onPageSize={() => {}} />);

    expect(PAGE_SIZES).toEqual([25, 50, 100, 0]);
    const select = screen.getByLabelText('Брой записи на страница');
    expect(Array.from(select.querySelectorAll('option')).map((o) => o.textContent)).toEqual([
      '25',
      '50',
      '100',
      'Всички',
    ]);
  });

  it('resets to the first page when the size changes', () => {
    const onPage = vi.fn();
    const onPageSize = vi.fn();
    render(
      <Pagination total={120} page={4} pageSize={25} onPage={onPage} onPageSize={onPageSize} noun="клиента" />,
    );

    expect(screen.getByText('76–100 от 120 клиента')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Брой записи на страница'), { target: { value: '0' } });

    expect(onPageSize).toHaveBeenCalledWith(0);
    expect(onPage).toHaveBeenCalledWith(1);
  });

  it('shows every record when Всички is chosen', () => {
    render(<Pagination total={120} page={4} pageSize={0} onPage={() => {}} onPageSize={() => {}} />);

    expect(screen.getByText('1–120 от 120')).toBeTruthy();
    expect(screen.getByText('1 / 1')).toBeTruthy();
  });

  it('clamps a page past the end and reports zero results', () => {
    render(<Pagination total={8} page={9} pageSize={25} onPage={() => {}} onPageSize={() => {}} />);

    expect(screen.getByText('1–8 от 8')).toBeTruthy();
    expect(screen.getByText('1 / 1')).toBeTruthy();
  });
});
