import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'HyperERP · Преглед' }, { name: 'description', content: 'Преглед на HyperERP с примерни данни без вход.' },
    { property: 'og:title', content: 'HyperERP · Преглед' }, { property: 'og:description', content: 'Работно пространство на HyperERP с примерни данни.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  beforeLoad: () => { throw redirect({ to: '/', replace: true }); },
});