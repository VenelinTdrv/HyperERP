import { queryOptions } from '@tanstack/react-query';
import { getErpLists, getCurrentProfile } from './erp.functions';

export const erpListsQuery = queryOptions({ queryKey: ['erp', 'lists'], queryFn: () => getErpLists(), staleTime: 0 });
export const profileQuery = queryOptions({ queryKey: ['erp', 'profile'], queryFn: () => getCurrentProfile() });