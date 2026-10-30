import type { DemoInvoice } from '@/lib/invoices-store';

const esc = (s: string) => s.replace(/&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;').replace(/"/g, '&' + 'quot;');
const money = (v: number) => `${v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const date = (v: string) => v.split('-').reverse().join('.');

export function invoicesTableHtml(list: DemoInvoice[]): string {
  const head = ['Фактура №', 'Дата', 'Статус', 'Клиент', 'ЕИК', 'Поръчка', 'Общо с ДДС'];
  const body = list.map(r => `<tr><td>${esc(r.id)}</td><td>${date(r.date)}</td><td>${esc(r.status)}</td><td>${esc(r.sale.customer)}</td><td>${esc(r.sale.eik || '—')}</td><td>${esc(r.sale.id)}</td><td class="num">${money(r.total)}</td></tr>`).join('');
  return `<table border="1" cellpadding="4" style="border-collapse:collapse;font-family:sans-serif;font-size:11px"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}

export function openInvoicesPrint(list: DemoInvoice[], title = 'Фактури') {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4 landscape;margin:12mm}</style></head><body><h2 style="font-family:sans-serif">${esc(title)}</h2><p style="font-family:sans-serif;font-size:11px">Примерни фактури · не са официални счетоводни документи</p>${invoicesTableHtml(list)}<script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}
