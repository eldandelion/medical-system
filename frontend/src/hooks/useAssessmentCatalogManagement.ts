import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { toggleScaleAvailability } from '../api/admin';
import { AssessmentCatalogItemDto } from '../types';

const fetchCatalog = async (token?: string): Promise<AssessmentCatalogItemDto[]> => {
  const url = `${import.meta.env.BASE_URL}/api/assessments/catalog`.replace('//api', '/api');
  const response = await fetch(url, {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch assessment catalog');
  }

  return response.json();
};

export function useAssessmentCatalogManagement() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const query = useQuery({
    queryKey: ['assessments', 'catalog', session.token],
    queryFn: () => fetchCatalog(session.token),
    enabled: !!session.token
  });

  const toggleMutation = useMutation({
    mutationFn: ({ batteryCode, isAvailable }: { batteryCode: string; isAvailable: boolean }) =>
      toggleScaleAvailability(session.token, batteryCode, { isAvailable }),
    onSuccess: (data) => {
      showSnackbar({
        message: data.isEnabled ? `量表 ${data.title} 已设为可用` : `量表 ${data.title} 已隐藏/下线`,
        duration: 3000
      });
      queryClient.invalidateQueries({ queryKey: ['assessments', 'catalog'] });
    },
    onError: (err: any) => {
      showSnackbar({
        message: err.message || '更新量表状态失败',
        duration: 3000
      });
    }
  });

  return {
    catalog: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    toggleAvailability: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending
  };
}
