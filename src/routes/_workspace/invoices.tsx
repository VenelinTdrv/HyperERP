import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Pagination } from '@/components/pagination';

export const Route = createFileRoute('/_workspace/invoices')({
  head: () => ({
    meta: [
      { title: 'Фактури | HyperERP' },
      { name: 'description', content: 'Фактури в работното пространство на HyperERP.' },
      { property: 'og:title', content: 'Фактури | HyperERP' },
      { property: 'og:description', content: 'Преглед на фактурите в HyperERP.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  return (
    <WorkspaceShell active="Фактури">
      <div className="page-content orders-content deliveries-content">
        <div className="page-heading"><h1>Фактури</h1></div>
        <section className="delivery-list" aria-label="Списък с фактури">
          <div className="delivery-list-heading"><h2>Фактури <span>0</span></h2></div>
          <div className="delivery-table-scroll">
            <table className="delivery-table orders-table">
              <thead><tr>
                <th>Фактура №</th><th>Дата</th><th>Клиент</th><th>Поръчка</th><th>Общо с ДДС</th>
                <th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th>
              </tr></thead>
              <tbody />
            </table>
          </div>
          <div className="delivery-empty"><FileText size={28} /><h3>Няма фактури</h3></div>
          <Pagination total={0} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="invoices-page-size" />
        </section>
      </div>
    </WorkspaceShell>
  );
}