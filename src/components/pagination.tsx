import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Records per page: 25 by default, plus 50 / 100 and „Всички“ (ALL_ROWS, a large finite number so slice math stays valid).
export const ALL_ROWS = 1_000_000;
export const PAGE_SIZES = [25, 50, 100, ALL_ROWS];

type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  noun?: string;
  id?: string;
  className?: string;
  middle?: ReactNode;
};

export function Pagination({
  total,
  page,
  pageSize,
  onPage,
  onPageSize,
  noun,
  id = 'page-size',
  className,
  middle,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(page, pages);
  const from = total ? (cur - 1) * pageSize + 1 : 0;
  const to = Math.min(cur * pageSize, total);

  return (
    <div className={cn('delivery-pagination', className)}>
      <span>{total ? `${from}–${to} от ${total}${noun ? ` ${noun}` : ''}` : '0 резултата'}</span>
      {middle}
      <div className="delivery-pagination-controls">
        <label htmlFor={id}>На страница</label>
        <select
          id={id}
          aria-label="Брой записи на страница"
          value={pageSize}
          onChange={(e) => {
            onPageSize(Number(e.target.value));
            onPage(1);
          }}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n === ALL_ROWS ? 'Всички' : n}
            </option>
          ))}
        </select>
        <Button variant="ghost" size="icon" aria-label="Първа страница" disabled={cur <= 1} onClick={() => onPage(1)}>
          <ChevronsLeft />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Предишна страница" disabled={cur <= 1} onClick={() => onPage(cur - 1)}>
          <ChevronLeft />
        </Button>
        <span>
          {cur} / {pages}
        </span>
        <Button variant="ghost" size="icon" aria-label="Следваща страница" disabled={cur >= pages} onClick={() => onPage(cur + 1)}>
          <ChevronRight />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Последна страница" disabled={cur >= pages} onClick={() => onPage(pages)}>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
