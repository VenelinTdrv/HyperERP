import { createFileRoute } from '@tanstack/react-router';
import { StaffTurnoverReport } from '@/components/staff-turnover-report';
import { reportHead } from '@/lib/reports-data';

export const Route = createFileRoute('/_workspace/reports/staff-turnover')({
  head: () => reportHead('staffTurnover'),
  component: () => <StaffTurnoverReport />,
});
