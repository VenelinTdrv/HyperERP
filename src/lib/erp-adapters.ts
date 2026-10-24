import type { Database } from '@/integrations/supabase/types';
import { ORDER_STATUSES, PAYMENT_METHODS, type Order } from './orders-store';

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export function orderFromDatabase(row: Row<'orders'> & { order_items: Row<'order_items'>[] }): Order {
  const status = ORDER_STATUSES.find(s => s === row.status);
  const payment = PAYMENT_METHODS.find(p => p === row.payment_method);
  if (!status || !payment) throw new Error('Непознат статус или метод на плащане.');
  return { id: row.order_number, status, customer: row.customer, phone: row.phone, city: row.city, address: row.address, courier: row.courier,
    created: row.created_at.slice(0, 10), items: [...row.order_items].sort((a,b) => a.position-b.position).map(i => ({ sku:i.sku,name:i.name,quantity:i.quantity,price:Number(i.price) })),
    shipping:Number(row.shipping), note:row.note, payment, influencer:row.seller_name, deliveryType:row.delivery_type === 'office' ? 'office' : 'address', edited:row.edited_at ?? undefined, processed:row.processed_at ?? undefined, processedBy:row.processed_by, createdBy:row.created_by };
}
const SALE_STATUSES = ['Необработена','Обработена','Изпратена','Доставена','Отказана'] as const;
export function saleFromDatabase(row: Row<'sales'>) {
  const status = SALE_STATUSES.find(s => s === row.status);
  if (!status) throw new Error('Непознат статус на продажба.');
  return { id:row.sale_number,status,customer:row.customer,phone:row.phone,city:row.city,address:row.address,courier:row.courier,created:row.created_at.slice(0,10),product:row.product_name,quantity:row.quantity,price:Number(row.price),shipping:Number(row.shipping),influencer:row.seller_name,processed:row.processed_at ?? undefined,processedBy:row.processed_by,createdBy:row.created_by };
}
export function categoryPathFromDatabase(categories: Pick<Row<'categories'>,'id'|'name'|'parent_id'>[], id: string | null): string {
  const parts:string[] = []; const seen = new Set<string>();
  while (id && !seen.has(id)) { seen.add(id); const row = categories.find(c => c.id === id); if (!row) break; parts.unshift(row.name); id = row.parent_id; }
  return parts.join(' › ');
}