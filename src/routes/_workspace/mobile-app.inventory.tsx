import { createFileRoute } from '@tanstack/react-router';
import { MobileAppScreen } from '@/components/mobile-app-screen';

export const Route = createFileRoute('/_workspace/mobile-app/inventory')({
  head: () => ({ meta: [
    { title: 'HyperERP · Мобилно приложение · Ревизия' },
    { name: 'description', content: 'Мобилен екран за ревизия в HyperERP.' },
    { property: 'og:title', content: 'HyperERP · Мобилна ревизия' },
    { property: 'og:description', content: 'Ревизия в мобилното приложение на HyperERP.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <MobileAppScreen screen="inventory"/>,
});