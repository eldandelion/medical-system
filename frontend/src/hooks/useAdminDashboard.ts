import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { fetchAdminDashboard } from '../api/admin';

export function useAdminDashboard() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'admin', session.token],
    queryFn: () => fetchAdminDashboard(session.token),
    enabled: !!session.token && session.role === 'admin',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
