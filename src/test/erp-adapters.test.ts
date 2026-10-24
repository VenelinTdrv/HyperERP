import { describe, expect, it } from 'vitest';
import { categoryPathFromDatabase, orderFromDatabase, saleFromDatabase } from '@/lib/erp-adapters';

describe('Cloud-backed data adapters', () => {
  it('preserves Необработена and the selected seller when reading an order', () => {
    const row = orderFromDatabase({ id:'db-id',order_number:'ORD-0024',status:'Необработена',customer:'Клиент',phone:'0888123456',city:'София',address:'Адрес',courier:'Еконт',delivery_type:'office',note:'',payment_method:'Наложен платеж',shipping:4.9,seller_name:'Елена Петрова',client_id:null,owner_user_id:null,created_by:'Администратор',created_at:'2026-10-24T08:00:00Z',edited_by:'',edited_at:null,processed_by:'',processed_at:null,order_items:[] });
    expect(row.status).toBe('Необработена');
    expect(row.influencer).toBe('Елена Петрова');
    expect(row.processed).toBe('');
  });
  it('preserves the Доставена sales status rather than resetting it to unprocessed', () => {
    const row = saleFromDatabase({id:'db-sale',sale_number:'ORD-0021',status:'Доставена',customer:'Клиент',phone:'',city:'',address:'',courier:'',product_name:'Парфюм',quantity:2,price:49,shipping:4.9,seller_name:'Елена Петрова',owner_user_id:null,created_by:'Администратор',created_at:'2026-10-24T08:00:00Z',processed_by:'',processed_at:null});
    expect(row.status).toBe('Доставена');
    expect(row.quantity*row.price+row.shipping).toBe(102.9);
  });
  it('reconstructs the category hierarchy used by article filtering', () => {
    expect(categoryPathFromDatabase([{id:'parent',name:'Козметика',parent_id:null},{id:'child',name:'Парфюми',parent_id:'parent'}],'child')).toBe('Козметика › Парфюми');
  });
});