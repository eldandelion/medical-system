import { useQuery } from '@tanstack/react-query';
import { fetchRecentActivity } from '../api/dashboard';
import { useAuth } from '../contexts/AuthContext';

export function useDashboardActivity() {
  const { session } = useAuth();
  
  return useQuery({
    queryKey: ['/api/dashboard/activity', session?.token],
    queryFn: () => {
      if (!session?.token) throw new Error('No auth token');
      return fetchRecentActivity(session.token);
    },
    enabled: !!session?.token,
  });
}
