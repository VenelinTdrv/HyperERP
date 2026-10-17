export type PaymentRow = {
  id: string;
  orderId: string;
  saleId: string;
  client: string;
  agent: string;
  method: string;
  source: string;
  reference: string;
  amount: string | number;
  date: string;
  status: string;
};

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"' }[c] ?? c));
const money = (v: number | string) => `${Number(v).toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const date = (v: string) => v.split('-').reverse().join('.');

export function paymentsTableHtml(list: PaymentRow[]): string {
  const head = ['Плащане', 'Поръчка', 'Продажба', 'Клиент', 'Инфлуенсър / Търговец', 'Вид', 'Източник', 'Референция', 'Сума', 'Дата', 'Статус'];
  const body = list.map(r => `<tr><td>${esc(r.id)}</td><td>${esc(r.orderId)}</td><td>${esc(r.saleId)}</td><td>${esc(r.client)}</td><td>${esc(r.agent)}</td><td>${esc(r.method)}</td><td>${esc(r.source)}</td><td>${esc(r.reference)}</td><td class="num">${money(r.amount)}</td><td>${date(r.date)}</td><td>${esc(r.status)}</td></tr>`).join('');
  return `<table border="1" cellpadding="4" style="border-collapse:collapse;font-family:sans-serif;font-size:11px"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>`;
}

export function downloadPaymentsXls(list: PaymentRow[]) {
  const html = `<html><head><meta charset="utf-8"></head><body>${paymentsTableHtml(list)}</body></html>`;
  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plashtaniya.xls';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function openPaymentsPrint(list: PaymentRow[], title = 'Плащания') {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4 landscape;margin:12mm}</style></head><body><h2 style="font-family:sans-serif">${esc(title)}</h2>${paymentsTableHtml(list)}<script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}
