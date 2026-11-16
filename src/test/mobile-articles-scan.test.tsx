import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-query', () => ({ useSuspenseQuery: () => ({ data: { articles: [
  { id: 'one', name: 'Rose', sku: 'PRF-ROSE-50', stock: 25 },
  { id: 'two', name: 'Rose large', sku: 'PRF-ROSE-500', stock: 7 },
] } }) }));
vi.mock('@/lib/erp-query', () => ({ erpListsQuery: {} }));
vi.mock('@/components/inventory-scanner', () => ({ InventoryScanner: ({ onScan }: { onScan: (code: string) => void }) => <><button onClick={() => onScan(' prf-rose-50 ')}>Known scan</button><button onClick={() => onScan('UNKNOWN')}>Unknown scan</button></> }));
import { MobileArticles } from '@/routes/_workspace/mobile-app.articles';

describe('Mobile article scans', () => {
  it('shows only the exact scanned SKU and its stock', () => {
    render(<MobileArticles/>);
    fireEvent.click(screen.getByRole('button', { name: 'Сканирай продукт' }));
    fireEvent.click(screen.getByRole('button', { name: 'Known scan' }));
    expect(screen.getByRole('heading', { name: 'Rose', exact: true })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Rose large' })).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Продукти и наличности' })).toHaveTextContent('25');
  });
  it('does not show a product for an unknown scanned SKU', () => {
    render(<MobileArticles/>);
    fireEvent.click(screen.getByRole('button', { name: 'Сканирай продукт' }));
    fireEvent.click(screen.getByRole('button', { name: 'Unknown scan' }));
    expect(screen.getByRole('list', { name: 'Продукти и наличности' }).children).toHaveLength(0);
  });
});