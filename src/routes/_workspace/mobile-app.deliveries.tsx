import { createFileRoute } from '@tanstack/react-router';
import { MobileAppScreen } from '@/components/mobile-app-screen';

export const Route = createFileRoute('/_workspace/mobile-app/deliveries')({
  head: () => ({ meta: [
    { title: 'HyperERP · Мобилно приложение · Доставки' },
    { name: 'description', content: 'Мобилен екран за доставки в HyperERP.' },
    { property: 'og:title', content: 'HyperERP · Мобилни доставки' },
    { property: 'og:description', content: 'Доставки в мобилното приложение на HyperERP.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <MobileAppScreen screen="deliveries"/>,
});