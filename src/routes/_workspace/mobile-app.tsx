import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Smartphone, Package, Truck, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';

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

const MENU_PATH = '/mobile-app';

function MobileApp() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const onMenu = pathname === MENU_PATH || pathname === `${MENU_PATH}/`;
  return <WorkspaceShell active="Мобилно приложение">
    <div className="page-content orders-content">
      <div className="page-heading">
        <div>
          {!onMenu && <Link to="/mobile-app" aria-label="Назад към менюто на мобилното приложение" className="mb-2 flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft size={14} aria-hidden="true"/>Меню</Link>}
          <h1><Smartphone size={23} aria-hidden="true"/>Мобилно приложение</h1>
        </div>
      </div>
      {onMenu && <nav aria-label="Меню на мобилното приложение" className="mb-5 grid grid-cols-1 gap-2 max-w-xl">
        {[
          { title: 'Артикули', to: '/mobile-app/articles' as const, icon: Package },
          { title: 'Доставки', to: '/mobile-app/deliveries' as const, icon: Truck },
          { title: 'Ревизия', to: '/mobile-app/inventory' as const, icon: ClipboardCheck },
        ].map(item => <Button key={item.to} asChild variant="outline" className="h-16 min-w-0 flex-col gap-1 px-2 text-xs">
          <Link to={item.to} activeProps={{ className: 'bg-accent text-accent-foreground border-primary', 'aria-current': 'page' }}><item.icon size={19}/>{item.title}</Link>
        </Button>)}
      </nav>}
      <Outlet/>
    </div>
  </WorkspaceShell>;
}
