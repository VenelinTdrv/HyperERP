import { createFileRoute } from '@tanstack/react-router';
import { ReportsWorkspace } from '@/components/reports-workspace';
import { reportHead } from '@/lib/reports-data';

export const Route = createFileRoute('/_workspace/reports/warehouse-profit')({
  head: () => reportHead('profit'),
  component: () => <ReportsWorkspace kind="profit" />,
});
