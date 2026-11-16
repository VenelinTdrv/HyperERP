import { useSyncExternalStore } from 'react';

// Shared frontend demonstration data only; no inventory mutations.
export type Status = 'Очаквана'|'В транзит'|'Получена'|'Отказана';
export type Delivery = {id:string;status:Status;supplier:string;warehouse:string;expected:string;received:string;created:string;createdBy:string;edited:string;editedBy:string;quantity:number;product:string;note:string};
export const suppliers=['Maison Beauty','Bloom Cosmetics','Essence Lab'] as const;
export const warehouses=['Основен склад · София','Склад · Пловдив'] as const;
export const products=['Rose Élixir','Velvet Bloom','Pure Essence'] as const;
export const statuses:Status[]=['Очаквана','В транзит','Получена','Отказана'];
const fixtureRows:Delivery[]=[
 {id:'DEL-0018',status:'В транзит',supplier:suppliers[0],warehouse:warehouses[0],expected:'2026-10-15',received:'',created:'2026-10-12',createdBy:'Венелин Тодоров',edited:'2026-10-14',editedBy:'Венелин Тодоров',quantity:48,product:products[0],note:'Доставка до основния склад.'},
 {id:'DEL-0017',status:'Очаквана',supplier:suppliers[1],warehouse:warehouses[0],expected:'2026-10-16',received:'',created:'2026-10-12',createdBy:'Венелин Тодоров',edited:'',editedBy:'',quantity:32,product:products[1],note:''},
 {id:'DEL-0016',status:'Очаквана',supplier:suppliers[2],warehouse:warehouses[1],expected:'2026-10-19',received:'',created:'2026-10-11',createdBy:'Венелин Тодоров',edited:'',editedBy:'',quantity:24,product:products[2],note:''},
 {id:'DEL-0015',status:'Получена',supplier:suppliers[0],warehouse:warehouses[0],expected:'2026-10-13',received:'2026-10-13',created:'2026-10-09',createdBy:'Венелин Тодоров',edited:'2026-10-13',editedBy:'Венелин Тодоров',quantity:60,product:products[0],note:'Получена без забележки.'},
 {id:'DEL-0014',status:'Получена',supplier:suppliers[1],warehouse:warehouses[1],expected:'2026-10-12',received:'2026-10-12',created:'2026-10-08',createdBy:'Венелин Тодоров',edited:'2026-10-12',editedBy:'Венелин Тодоров',quantity:36,product:products[1],note:''},
 {id:'DEL-0013',status:'Отказана',supplier:suppliers[2],warehouse:warehouses[0],expected:'2026-10-10',received:'',created:'2026-10-07',createdBy:'Венелин Тодоров',edited:'2026-10-09',editedBy:'Венелин Тодоров',quantity:20,product:products[2],note:'Отказана от доставчика.'},
 {id:'DEL-0012',status:'В транзит',supplier:suppliers[1],warehouse:warehouses[1],expected:'2026-10-17',received:'',created:'2026-10-13',createdBy:'Венелин Тодоров',edited:'2026-10-15',editedBy:'Венелин Тодоров',quantity:54,product:products[2],note:'Пратката е поета от куриера.'},
 {id:'DEL-0011',status:'Очаквана',supplier:suppliers[0],warehouse:warehouses[0],expected:'2026-10-20',received:'',created:'2026-10-14',createdBy:'Венелин Тодоров',edited:'',editedBy:'',quantity:40,product:products[0],note:''},
 {id:'DEL-0010',status:'Получена',supplier:suppliers[2],warehouse:warehouses[0],expected:'2026-10-11',received:'2026-10-11',created:'2026-10-06',createdBy:'Венелин Тодоров',edited:'2026-10-11',editedBy:'Венелин Тодоров',quantity:72,product:products[1],note:'Получена без забележки.'},
 {id:'DEL-0009',status:'Отказана',supplier:suppliers[1],warehouse:warehouses[1],expected:'2026-10-09',received:'',created:'2026-10-05',createdBy:'Венелин Тодоров',edited:'2026-10-08',editedBy:'Венелин Тодоров',quantity:18,product:products[2],note:'Отказана — доставчикът не потвърди наличност.'},
];

export function deliveryToday() {
 return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Sofia' }).format(new Date());
}
function relativeDate(value: string) {
 if (!value) return '';
 const offset = Math.round((Date.parse(value + 'T12:00:00Z') - Date.parse('2026-10-14T12:00:00Z')) / 86400000);
 const day = new Date(deliveryToday() + 'T12:00:00Z');
 day.setUTCDate(day.getUTCDate() + offset);
 return day.toISOString().slice(0, 10);
}
let rows: Delivery[] = fixtureRows.map(row => ({ ...row, expected: relativeDate(row.expected), received: relativeDate(row.received), created: relativeDate(row.created), edited: relativeDate(row.edited) }));
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getDeliveries = () => rows;
export function deliveryByCode(code: string): Delivery | undefined {
 return rows.find(row => row.id.toLowerCase() === code.trim().toLowerCase());
}
export const useDeliveries = () => useSyncExternalStore(subscribe, getDeliveries, getDeliveries);
export function setDeliveries(update: Delivery[] | ((previous: Delivery[]) => Delivery[])) {
 rows = typeof update === 'function' ? update(rows) : update;
 listeners.forEach(listener => listener());
}
export function deliveryTransitions(status: Status): Status[] {
 if (status === 'Очаквана') return ['В транзит', 'Получена', 'Отказана'];
 if (status === 'В транзит') return ['Получена', 'Отказана'];
 return [];
}
export function processDelivery(id: string, status: Status) {
 const row = rows.find(item => item.id === id);
 if (!row || !deliveryTransitions(row.status).includes(status)) throw new Error('Промяната на този статус не е разрешена.');
 setDeliveries(previous => previous.map(item => item.id === id ? { ...item, status, received: status === 'Получена' ? deliveryToday() : '', edited: deliveryToday(), editedBy: 'Демо оператор' } : item));
}
