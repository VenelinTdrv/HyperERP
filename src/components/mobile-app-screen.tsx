import { Package, Truck, ClipboardCheck } from 'lucide-react';

const screens = {
  articles: { title: 'Артикули', icon: Package },
  deliveries: { title: 'Доставки', icon: Truck },
  inventory: { title: 'Ревизия', icon: ClipboardCheck },
};

export function MobileAppScreen({ screen }: { screen: keyof typeof screens }) {
  const { title, icon: Icon } = screens[screen];
  return <section className="border-t border-border py-6" aria-label={title}>
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
      <Icon size={40} strokeWidth={1.25} aria-hidden="true"/>
      <p className="text-sm">Няма добавени записи.</p>
    </div>
  </section>;
}