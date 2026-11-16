import { createFileRoute } from '@tanstack/react-router';
import { Smartphone } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';

export const Route = createFileRoute('/_workspace/mobile-app')({
  head: () => ({ meta: [
    { title: 'HyperERP · Мобилно приложение' },
    { name: 'description', content: 'Работно пространство за екраните на мобилното приложение на HyperERP.' },
    { property: 'og:title', content: 'HyperERP · Мобилно приложение' },
    { property: 'og:description', content: 'Екрани на мобилното приложение на HyperERP.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: MobileApp,
});

function MobileApp() {
  return <WorkspaceShell active="Мобилно приложение">
    <div className="page-content orders-content">
      <div className="page-heading">
        <div><h1><Smartphone size={23} aria-hidden="true"/>Мобилно приложение</h1></div>
      </div>
      <section aria-label="Екрани" className="border-t border-border py-6">
        <h2 className="text-sm font-semibold text-foreground">Екрани</h2>
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
          <Smartphone size={40} strokeWidth={1.25} aria-hidden="true"/>
          <p className="text-sm">Няма добавени екрани.</p>
        </div>
      </section>
    </div>
  </WorkspaceShell>;
}