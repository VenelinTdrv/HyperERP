import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { ClientEditorForm, type ClientFormData } from '@/components/client-editor';
import { createClient, setClientNotice, useClients, clientName } from '@/lib/clients-store';

export const Route = createFileRoute('/_workspace/clients_.new')({
 head: () => ({ meta: [
  { title: 'HyperERP · Нов клиент' },
  { name: 'description', content: 'Създаване на клиент — физическо или юридическо лице с телефони и адреси за доставка в HyperERP.' },
  { property: 'og:title', content: 'HyperERP · Нов клиент' },
  { property: 'og:description', content: 'Екран за добавяне на клиент с данни за контакт, фирмени данни и адреси.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
 ] }),
 component: ClientNew,
});

function ClientNew(){
  const navigate = useNavigate({ from: '/clients/new' });
  const rows = useClients();
  const back = () => navigate({ to: '/clients' });
  const submit = (data: ClientFormData) => {
    createClient(data);
    setClientNotice(`${clientName(data)} · Клиентът е добавен само в демонстрацията.`);
    back();
  };
  return <WorkspaceShell active="Клиенти"><div className="page-content deliveries-content client-editor-page">
    <div className="page-heading"><div>
      <Link to="/clients" className="text-xs text-muted-foreground inline-flex items-center gap-1"><ArrowLeft size={13}/>Клиенти</Link>
      <h1>Нов клиент</h1>
      <p>Попълнете данните за контакт и адресите за доставка.</p>
    </div></div>
    <section className="delivery-list client-editor-panel" aria-label="Данни за клиента">
      <div className="delivery-list-heading"><h2>Данни на клиента</h2></div>
      <div className="client-editor-body">
        <ClientEditorForm editing={null} phones={rows.map(r => r.phone)} submitLabel="Добави клиента" onSubmit={submit} onCancel={back}/>
      </div>
    </section>
    <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни данни · без реално записване</div>
  </div></WorkspaceShell>;
}
