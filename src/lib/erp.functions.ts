import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getErpLists = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [orders, sales, articles, categories] = await Promise.all([
      context.supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      context.supabase.from('sales').select('*').order('created_at', { ascending: false }),
      context.supabase.from('articles').select('*').order('created_at', { ascending: false }),
      context.supabase.from('categories').select('id, name, parent_id'),
    ]);
    if (orders.error || sales.error || articles.error || categories.error) throw new Error('Данните не могат да бъдат заредени. Опитайте отново.');
    return { orders: orders.data ?? [], sales: sales.data ?? [], articles: articles.data ?? [], categories: categories.data ?? [] };
  });

export const getCurrentProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, roles] = await Promise.all([
      context.supabase.from('profiles').select('display_name').eq('id', context.userId).single(),
      context.supabase.from('user_roles').select('role').eq('user_id', context.userId),
    ]);
    if (profile.error || roles.error) throw new Error('Профилът не може да бъде зареден.');
    const role = roles.data?.some(r => r.role === 'admin') ? 'Администратор' : roles.data?.some(r => r.role === 'wholesale') ? 'Търговец на едро' : 'Инфлуенсър';
    return { name: profile.data.display_name, role };
  });