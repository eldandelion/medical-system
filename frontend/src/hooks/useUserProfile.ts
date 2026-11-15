import { useQuery } from '@tanstack/react-query';
import { UserProfileDto } from '../types';

/** Fetch the currently authenticated user's full profile (including numeric user id). */
export const useUserProfile = (token?: string) => {
  return useQuery<UserProfileDto | null>({
    queryKey: ['/api/user/profile', token],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/user/profile`.replace('//api', '/api'), {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
          },
        });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: !!token,
    retry: false,
  });
};
