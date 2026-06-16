import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAuthenticatedQuery(queryKey, url, params = undefined, options = {}) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      const response = await api.get(url, params ? { params } : undefined);
      return response.data.data;
    },
    ...options,
  });
}
