import { type Order, total } from '@/lib/orders-store';

export function orderSheetRows(order: Order): (string | number)[][] {
  return [
    ['Поръчка', order.id],
    ['Статус', order.status],
    ['Създадена на', order.created],
    ['Клиент', order.customer],
    ['Телефон', order.phone],
    ['Населено място', order.city],
    ['Адрес / офис', order.address],
    ['Куриер', order.courier],
    ['Метод на плащане', order.payment],
    [],
    ['№', 'Продукт', 'SKU', 'Количество'],
    ...order.items.map((item, index) => [index + 1, item.name, item.sku, item.quantity]),
    [],
    ['Общо с ДДС (€)', total(order)],
    ['Бележка', order.note],
  ];
}

export async function downloadOrderXls(order: Order) {
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet(orderSheetRows(order));
  sheet['!cols'] = [{ wch: 24 }, { wch: 48 }, { wch: 18 }, { wch: 16 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Поръчка');
  const bytes = XLSX.write(workbook, { bookType: 'biff8', type: 'array' });
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.ms-excel' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `porachka-${order.id}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}