import { createFileRoute } from '@tanstack/react-router';
import { ReportsWorkspace } from '@/components/reports-workspace';
import { reportHead } from '@/lib/reports-data';

export const Route = createFileRoute('/_workspace/reports/exhausted-batches')({
  head: () => reportHead('exhausted'),
  component: () => <ReportsWorkspace kind="exhausted" />,
});
