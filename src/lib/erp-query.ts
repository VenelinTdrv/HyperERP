import { queryOptions } from '@tanstack/react-query';
import { getDemoErpLists } from './demo-erp';

export const erpListsQuery = queryOptions({ queryKey: ['demo', 'erp', 'lists'], queryFn: getDemoErpLists, staleTime: 0 });
export const profileQuery = queryOptions({ queryKey: ['demo', 'erp', 'profile'], queryFn: () => ({ name: 'Демо преглед', role: 'Примерни данни' }) });