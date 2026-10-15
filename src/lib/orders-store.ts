import { useSyncExternalStore } from 'react';

export const ORDER_STATUSES = ['Необработена', 'Обработена', 'Анулирана'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderItem = { sku: string; name: string; quantity: number; price: number };
export const PAYMENT_METHODS = ['Наложен платеж', 'Банкова карта', 'Банков превод'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type Order = { id: string; status: OrderStatus; customer: string; phone: string; city: string; address: string; courier: string; created: string; items: OrderItem[]; shipping: number; note: string; payment: PaymentMethod; edited?: string };

export const CATALOG: Omit<OrderItem, 'quantity'>[] = [
  { sku: 'PRF-ROSE-50', name: 'Rose Élixir', price: 49 },
  { sku: 'PRF-VELV-50', name: 'Velvet Bloom', price: 69 },
  { sku: 'PRF-PURE-30', name: 'Pure Essence', price: 35 },
  { sku: 'CRM-HYDR-50', name: 'Hydra Cream', price: 29 },
];
const item = (i: number, quantity: number): OrderItem => ({ ...CATALOG[i]!, quantity });

let orders: Order[] = [
  { id:'ORD-0024', status:'Необработена', customer:'Мария Иванова', phone:'0888 123 456', city:'София', address:'ул. „Оборище“ 12', courier:'Еконт', created:'2026-10-14', items:[item(0,2)], shipping:4.9, note:'' },
  { id:'ORD-0023', status:'Необработена', customer:'Елена Петрова', phone:'0888 234 567', city:'Пловдив', address:'Офис · Център', courier:'Спиди', created:'2026-10-14', items:[item(1,1)], shipping:4.9, note:'' },
  { id:'ORD-0022', status:'Необработена', customer:'Иван Георгиев', phone:'0888 345 678', city:'Варна', address:'Офис · Център', courier:'Еконт', created:'2026-10-13', items:[item(2,3)], shipping:4.9, note:'' },
  { id:'ORD-0021', status:'Необработена', customer:'Десислава Николова', phone:'0888 456 789', city:'София', address:'ул. „Искър“ 18', courier:'Спиди', created:'2026-10-13', items:[item(0,1)], shipping:4.9, note:'' },
  { id:'ORD-0020', status:'Необработена', customer:'Петър Димитров', phone:'0888 567 890', city:'Бургас', address:'Офис · Център', courier:'Еконт', created:'2026-10-12', items:[item(1,2)], shipping:4.9, note:'' },
  { id:'ORD-0019', status:'Необработена', customer:'Анна Стоянова', phone:'0888 678 901', city:'Пловдив', address:'Офис · Център', courier:'Спиди', created:'2026-10-12', items:[item(2,1)], shipping:4.9, note:'' },
];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export const useOrders = () => useSyncExternalStore(subscribe, () => orders, () => orders);
export const saveOrder = (next: Order) => { orders = orders.map(o => o.id === next.id ? { ...next, edited: new Date().toISOString() } : o); emit(); };
export const setOrderStatus = (id: string, status: OrderStatus) => { const o = orders.find(x => x.id === id); if (o) saveOrder({ ...o, status }); };
export const subtotal = (o: Pick<Order, 'items'>) => o.items.reduce((s, i) => s + i.quantity * i.price, 0);
export const total = (o: Pick<Order, 'items' | 'shipping'>) => subtotal(o) + o.shipping;
export const itemCount = (o: Pick<Order, 'items'>) => o.items.reduce((s, i) => s + i.quantity, 0);
