import { type Order, subtotal, total } from '@/lib/orders-store';

const money = (v: number) => `${v.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const date = (v: string) => new Date(`${v}T12:00:00`).toLocaleDateString('bg-BG');
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] ?? c));

const deliveryMethod = (o: Order) => o.address.toLowerCase().startsWith('офис') ? `До офис на ${o.courier}` : `До адрес с ${o.courier}`;

function pageHtml(o: Order, page: number, pages: number) {
  const rows = o.items.map((it, i) => `<tr><td>${i + 1}</td><td>${esc(it.name)}</td><td>${esc(it.sku)}</td><td class="num">${it.quantity}</td><td class="num">${money(it.price)}</td><td class="num">${money(it.quantity * it.price)}</td></tr>`).join('');
  return `<section class="page">
    <div class="head"><div class="brand">hyperERP<small>Еcommerce &amp; складова система</small></div>
      <div class="doc"><h1>Бланка на поръчка ${esc(o.id)}</h1><p>Създадена на ${date(o.created)} · Статус: ${esc(o.status)}</p></div></div>
    <h2>Клиент</h2><div class="grid">
      <div class="row"><dt>Имена</dt><dd>${esc(o.customer)}</dd></div>
      <div class="row"><dt>Телефон</dt><dd>${esc(o.phone)}</dd></div>
      <div class="row"><dt>Населено място</dt><dd>${esc(o.city)}</dd></div>
      <div class="row"><dt>Адрес за доставка</dt><dd>${esc(o.address)}</dd></div>
      <div class="row"><dt>Начин на получаване</dt><dd>${esc(deliveryMethod(o))}</dd></div>
      <div class="row"><dt>Метод на плащане</dt><dd>${esc(o.payment)}</dd></div>
    </div>
    <h2>Продукти</h2>
    <table><thead><tr><th>№</th><th>Продукт</th><th>SKU</th><th class="num">Кол.</th><th class="num">Ед. цена</th><th class="num">Сума</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="totals">
      <div class="row"><span>Междинна сума</span><span>${money(subtotal(o))}</span></div>
      <div class="row"><span>Доставка</span><span>${money(o.shipping)}</span></div>
      <div class="row grand"><span>Общо с ДДС</span><span>${money(total(o))}</span></div>
    </div>
    ${o.note.trim() ? `<div class="note"><strong>Бележка:</strong> ${esc(o.note)}</div>` : ''}
    <div class="foot"><span>Генерирано от hyperERP · демонстрационен документ</span><span>Страница ${page} от ${pages}</span></div>
  </section>`;
}

function blankHtml(orders: Order[]) {
  const pages = orders.map((o, i) => pageHtml(o, i + 1, orders.length)).join('');
  const title = orders.length === 1 ? `Бланка ${esc(orders[0]!.id)}` : `Бланки (${orders.length} поръчки)`;
  return `<!doctype html><html lang="bg"><head><meta charset="utf-8"><title>${title}</title><style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c2430; font-size: 12px; margin: 0; }
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1c2430; padding-bottom: 10px; margin-bottom: 16px; }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: .5px; }
    .brand small { display: block; font-size: 10px; font-weight: 500; color: #5b6675; letter-spacing: 0; margin-top: 2px; }
    .doc { text-align: right; }
    .doc h1 { font-size: 16px; margin: 0 0 4px; }
    .doc p { margin: 0; color: #5b6675; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #5b6675; margin: 18px 0 6px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
    .row { display: flex; gap: 8px; padding: 3px 0; }
    .row dt { min-width: 130px; color: #5b6675; }
    .row dd { margin: 0; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th, td { border: 1px solid #c9d2dd; padding: 6px 8px; text-align: left; }
    th { background: #f0f4f8; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
    .num { text-align: right; }
    .totals { margin-left: auto; width: 240px; margin-top: 10px; }
    .totals .row { justify-content: space-between; border-bottom: 1px dashed #c9d2dd; }
    .totals .row.grand { font-size: 14px; font-weight: 800; border-bottom: 2px solid #1c2430; }
    .note { margin-top: 16px; padding: 8px 10px; background: #f0f4f8; border-radius: 4px; }
    .foot { margin-top: 28px; display: flex; justify-content: space-between; color: #5b6675; font-size: 10px; }
  </style></head><body>
    ${pages}
    <script>window.onload = () => window.print();<\/script>
  </body></html>`;
}

export function openOrderBlank(orders: Order | Order[]) {
  const list = Array.isArray(orders) ? orders : [orders];
  if (list.length === 0) return;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(blankHtml(list));
  w.document.close();
}
