import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { SearchResultDto } from '../types/search';

export function useGlobalSearchQuery(rawQuery: string, limit: number = 5) {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery.trim());
  const { session } = useAuth();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(rawQuery.trim());
    }, 250);

    return () => clearTimeout(handler);
  }, [rawQuery]);

  const queryResult = useQuery<SearchResultDto>({
    queryKey: ['/api/search', debouncedQuery, limit, session?.token],
    queryFn: async ({ signal }) => {
      const url = `${import.meta.env.BASE_URL}api/search?q=${encodeURIComponent(debouncedQuery)}&limit=${limit}`.replace(
        '//api',
        '/api'
      );

      const res = await fetch(url, {
        signal,
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Global search request failed');
      }

      return res.json();
    },
    enabled: debouncedQuery.length > 0 && !!session?.token,
    staleTime: 30_000,
    retry: 1,
  });

  return {
    ...queryResult,
    debouncedQuery,
  };
}
