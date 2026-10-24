import { CATALOG, getDemoOrders } from './orders-store';
import type { getErpLists } from './erp.functions';

type Lists = Awaited<ReturnType<typeof getErpLists>>;

// Public preview fixtures only. Never read operational data for this workspace.
export function getDemoErpLists(): Lists {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Sofia' }).format(new Date());
  const timestamp = `${today}T09:00:00Z`;
  const orders: Lists['orders'] = getDemoOrders().map((order, index) => ({
    id: `demo-order-${index}`, order_number: order.id, status: order.status,
    customer: order.customer, phone: order.phone, city: order.city, address: order.address,
    courier: order.courier, delivery_type: order.deliveryType ?? 'address', note: order.note,
    payment_method: order.payment, shipping: order.shipping, seller_name: order.influencer ?? '',
    client_id: null, owner_user_id: null, created_by: 'Демо', created_at: timestamp,
    edited_by: '', edited_at: null, processed_by: '', processed_at: null,
    order_items: order.items.map((item, position) => ({
      id: `demo-item-${index}-${position}`, order_id: `demo-order-${index}`,
      sku: item.sku, name: item.name, quantity: item.quantity, price: item.price, position,
    })),
  }));
  const statuses = ['Необработена', 'Обработена', 'Изпратена', 'Доставена', 'Отказана'];
  return {
    orders,
    sales: orders.map((order, index) => {
      const item = order.order_items[0];
      return {
        id: `demo-sale-${index}`, sale_number: order.order_number,
        status: statuses[index % statuses.length] ?? 'Необработена',
        customer: order.customer, phone: order.phone, city: order.city, address: order.address,
        courier: order.courier, product_name: item?.name ?? '', quantity: item?.quantity ?? 1,
        price: item?.price ?? 0, shipping: order.shipping, seller_name: order.seller_name,
        created_by: 'Демо', created_at: timestamp, processed_by: '', processed_at: null, owner_user_id: null,
      };
    }),
    articles: CATALOG.map((article, index) => ({
      id: `demo-article-${index}`, sku: article.sku, name: article.name, price: article.price,
      stock: 25, category_id: 'demo-perfumes', created_by: 'Демо', created_at: timestamp,
      edited_by: '', edited_at: null,
    })),
    categories: [
      { id: 'demo-cosmetics', name: 'Козметика', parent_id: null },
      { id: 'demo-perfumes', name: 'Парфюми', parent_id: 'demo-cosmetics' },
    ],
  };
}