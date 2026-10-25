import { describe, expect, it } from 'vitest';
import { paymentsTableHtml } from '@/lib/payments-export';

const row = {
  id: 'PAY-00023',
  orderId: 'ORD-0024',
  saleId: 'SAL-0024',
  client: 'Мария Иванова',
  agent: 'Виктория Григорова',
  method: 'Банков път',
  source: 'Pigeon',
  reference: 'PG-77166',
  amount: '73.90',
  date: '2026-10-17',
  status: 'Получено',
};

describe('paymentsTableHtml', () => {
  it('renders one data row per payment', () => {
    const html = paymentsTableHtml([row, { ...row, id: 'PAY-00024', amount: 48.9 }]);
    expect(html).toContain('PAY-00023');
    expect(html).toContain('PAY-00024');
    expect(html.match(/<tr><td>/g)).toHaveLength(2);
  });

  it('formats sums and dates for the Bulgarian locale', () => {
    const html = paymentsTableHtml([row]);
    expect(html).toContain('73,90 €');
    expect(html).toContain('17.10.2026');
  });

  it('shows the editing admin with date and time after status', () => {
    const html = paymentsTableHtml([{ ...row, edited: '2026-10-17T11:20', editedBy: 'Венелин Тодоров' }, row]);
    expect(html.match(/<th>/g)).toHaveLength(12);
    expect(html).toContain('17.10.2026');
    expect(html).toContain('11:20 · Венелин Тодоров');
    expect(html).toContain('<td>—</td>');
  });

  it('escapes HTML in field values', () => {
    const html = paymentsTableHtml([{ ...row, client: 'A<B>&C' }]);
    expect(html).toContain('A' + '&' + 'lt;B' + '&' + 'gt;' + '&' + 'amp;C');
    expect(html).not.toContain('A<B>&C');
  });
});
