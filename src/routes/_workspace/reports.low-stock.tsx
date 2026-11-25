import { createFileRoute } from '@tanstack/react-router';
import { LowStockReport } from '@/components/low-stock-report';
import { reportHead } from '@/lib/reports-data';

export const Route = createFileRoute('/_workspace/reports/low-stock')({
  validateSearch: (search: Record<string, unknown>): { sku?: string } => (typeof search['sku'] === 'string' ? { sku: search['sku'] } : {}),
  head: () => reportHead('lowStock'),
  component: LowStockRoute,
});

function LowStockRoute() {
  const { sku } = Route.useSearch();
  return <LowStockReport openSku={sku} />;
}
