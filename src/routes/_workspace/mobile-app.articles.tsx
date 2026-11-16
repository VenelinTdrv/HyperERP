import { createFileRoute } from '@tanstack/react-router';
import { MobileAppScreen } from '@/components/mobile-app-screen';

export const Route = createFileRoute('/_workspace/mobile-app/articles')({
  head: () => ({ meta: [
    { title: 'HyperERP · Мобилно приложение · Артикули' },
    { name: 'description', content: 'Мобилен екран за артикули в HyperERP.' },
    { property: 'og:title', content: 'HyperERP · Мобилни артикули' },
    { property: 'og:description', content: 'Артикули в мобилното приложение на HyperERP.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: () => <MobileAppScreen screen="articles"/>,
});