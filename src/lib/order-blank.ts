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
    <h2>Товарителница</h2>
    <div class="grid">
      <div class="row"><dt>Изпращач</dt><dd>hyperERP — Козметика ЕООД</dd></div>
      <div class="row"><dt>Куриер</dt><dd>${esc(o.courier)}</dd></div>
      <div class="row"><dt>Получател</dt><dd>${esc(o.customer)}, ${esc(o.phone)}</dd></div>
      <div class="row"><dt>Адрес</dt><dd>${esc(o.city)}, ${esc(o.address)}</dd></div>
      <div class="row"><dt>Плащане на транспорта</dt><dd>${esc(o.payment)}</dd></div>
      <div class="row"><dt>Съдържание</dt><dd>Козметика · ${o.items.reduce((s, it) => s + it.quantity, 0)} бр.</dd></div>
      <div class="row"><dt>Брой колети</dt><dd>__________</dd></div>
      <div class="row"><dt>Тегло (кг)</dt><dd>__________</dd></div>
    </div>
    <div class="signatures">
      <div><span>Изпратил (подпис)</span></div>
      <div><span>Получил (подпис и дата)</span></div>
    </div>
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
    .signatures { display: flex; gap: 40px; margin-top: 26px; }
    .signatures > div { flex: 1; border-top: 1px solid #1c2430; padding-top: 4px; text-align: center; color: #5b6675; font-size: 10px; }
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

// ============= PDF download (jsPDF + embedded Cyrillic font) =============

import { jsPDF } from 'jspdf';
import fontDataUri from '@/assets/DejaVuSans.ttf?inline';

const FONT = 'DejaVuSans';
let fontReady = false;

function ensureFont(doc: jsPDF) {
  if (fontReady) return;
  const base64 = fontDataUri.slice(fontDataUri.indexOf(',') + 1);
  doc.addFileToVFS('DejaVuSans.ttf', base64);
  doc.addFont('DejaVuSans.ttf', FONT, 'normal');
  fontReady = true;
}

function drawBlankPage(doc: jsPDF, o: Order, page: number, pages: number) {
  const L = 14, R = 196, W = R - L;
  let y = 18;
  doc.setFont(FONT, 'normal');

  // Header
  doc.setFontSize(18); doc.setTextColor(28, 36, 48);
  doc.text('hyperERP', L, y);
  doc.setFontSize(8); doc.setTextColor(91, 102, 117);
  doc.text('Ecommerce & складова система', L, y + 5);
  doc.setFontSize(13); doc.setTextColor(28, 36, 48);
  doc.text(`Бланка на поръчка ${o.id}`, R, y, { align: 'right' });
  doc.setFontSize(8); doc.setTextColor(91, 102, 117);
  doc.text(`Създадена на ${date(o.created)} · Статус: ${o.status}`, R, y + 5, { align: 'right' });
  y += 10;
  doc.setDrawColor(28, 36, 48); doc.setLineWidth(0.6);
  doc.line(L, y, R, y);
  y += 9;

  // Client
  doc.setFontSize(8); doc.setTextColor(91, 102, 117);
  doc.text('КЛИЕНТ', L, y); y += 5;
  const client: [string, string][] = [
    ['Имена', o.customer], ['Телефон', o.phone], ['Населено място', o.city],
    ['Адрес за доставка', o.address], ['Начин на получаване', deliveryMethod(o)], ['Метод на плащане', o.payment],
  ];
  client.forEach(([label, value], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = L + col * (W / 2), cy = y + row * 6;
    doc.setFontSize(8); doc.setTextColor(91, 102, 117);
    doc.text(label, x, cy);
    doc.setFontSize(9); doc.setTextColor(28, 36, 48);
    doc.text(doc.splitTextToSize(value, W / 2 - 34)[0] ?? '', x + 34, cy);
  });
  y += Math.ceil(client.length / 2) * 6 + 6;

  // Products table
  doc.setFontSize(8); doc.setTextColor(91, 102, 117);
  doc.text('ПРОДУКТИ', L, y); y += 4;
  const cols = [10, 78, 34, 14, 24, 24]; // №, Продукт, SKU, Кол., Ед. цена, Сума
  const heads = ['№', 'Продукт', 'SKU', 'Кол.', 'Ед. цена', 'Сума'];
  const drawRow = (cells: string[], cy: number, header = false) => {
    let x = L;
    cells.forEach((c, i) => {
      if (header) { doc.setFillColor(240, 244, 248); doc.rect(x, cy - 4.4, cols[i]!, 6.4, 'F'); }
      doc.setDrawColor(201, 210, 221); doc.setLineWidth(0.2);
      doc.rect(x, cy - 4.4, cols[i]!, 6.4);
      doc.setFontSize(header ? 7 : 8.5);
      doc.setTextColor(header ? 91 : 28, header ? 102 : 36, header ? 117 : 48);
      const numeric = i >= 3;
      doc.text(c, numeric ? x + cols[i]! - 1.5 : x + 1.5, cy, { align: numeric ? 'right' : 'left' });
      x += cols[i]!;
    });
  };
  drawRow(heads, y, true); y += 6.4;
  o.items.forEach((it, i) => {
    drawRow([String(i + 1), it.name, it.sku, String(it.quantity), money(it.price), money(it.quantity * it.price)], y);
    y += 6.4;
  });
  y += 8;

  // Totals
  const tx = R - 70;
  const totals: [string, string, boolean][] = [
    ['Междинна сума', money(subtotal(o)), false],
    ['Доставка', money(o.shipping), false],
    ['Общо с ДДС', money(total(o)), true],
  ];
  totals.forEach(([label, value, grand]) => {
    doc.setFontSize(grand ? 11 : 9); doc.setTextColor(28, 36, 48);
    doc.text(label, tx, y);
    doc.text(value, R, y, { align: 'right' });
    doc.setDrawColor(201, 210, 221); doc.setLineWidth(grand ? 0.5 : 0.2);
    doc.line(tx, y + 1.8, R, y + 1.8);
    y += grand ? 8 : 6;
  });

  // Note
  if (o.note.trim()) {
    y += 4;
    doc.setFillColor(240, 244, 248);
    doc.rect(L, y - 4, W, 8, 'F');
    doc.setFontSize(8.5); doc.setTextColor(28, 36, 48);
    doc.text(`Бележка: ${o.note}`, L + 2, y + 1);
    y += 10;
  }

  // Товарителница (waybill)
  y += 6;
  doc.setFontSize(8); doc.setTextColor(91, 102, 117);
  doc.text('ТОВАРИТЕЛНИЦА', L, y); y += 5;
  const wb: [string, string][] = [
    ['Изпращач', 'hyperERP — Козметика ЕООД'],
    ['Получател', `${o.customer}, ${o.phone}`],
    ['Куриер', o.courier],
    ['Адрес', `${o.city}, ${o.address}`],
    ['Плащане на транспорта', o.payment],
    ['Съдържание', `Козметика · ${o.items.reduce((s, it) => s + it.quantity, 0)} бр.`],
    ['Брой колети', '__________'],
    ['Тегло (кг)', '__________'],
  ];
  wb.forEach(() => undefined);
  const half = W / 2;
  for (let i = 0; i < wb.length; i += 2) {
    const pair = [wb[i], wb[i + 1]];
    const cy = y;
    pair.forEach((item, col) => {
      if (!item) return;
      const x = L + col * half;
      doc.setFontSize(8); doc.setTextColor(91, 102, 117);
      doc.text(item[0], x, cy);
      doc.setFontSize(9); doc.setTextColor(28, 36, 48);
      doc.text(item[1], x + 42, cy, { maxWidth: half - 46, lineHeightFactor: 1.15 });
    });
    const maxLines = Math.max(...pair.filter(Boolean).map(it => doc.splitTextToSize(it[1], half - 46).length));
    y += Math.max(5.5, maxLines * 4.6);
  }
  y += 12;
  doc.setDrawColor(28, 36, 48); doc.setLineWidth(0.4);
  doc.line(L, y, L + 70, y);
  doc.line(R - 70, y, R, y);
  doc.setFontSize(8); doc.setTextColor(91, 102, 117);
  doc.text('Изпратил (подпис)', L + 35, y + 4, { align: 'center' });
  doc.text('Получил (подпис и дата)', R - 35, y + 4, { align: 'center' });



  // Footer
  doc.setFontSize(7.5); doc.setTextColor(91, 102, 117);
  doc.text('Генерирано от hyperERP · демонстрационен документ', L, 285);
  doc.text(`Страница ${page} от ${pages}`, R, 285, { align: 'right' });
}

export function downloadOrderBlankPdf(orders: Order | Order[]) {
  const list = Array.isArray(orders) ? orders : [orders];
  if (list.length === 0) return;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  ensureFont(doc);
  list.forEach((o, i) => {
    if (i > 0) doc.addPage();
    drawBlankPage(doc, o, i + 1, list.length);
  });
  const name = list.length === 1 ? `blanka-${list[0]!.id}.pdf` : `blanki-${list.length}-porachki.pdf`;
  doc.save(name);
}
