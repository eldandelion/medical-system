import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead, NotificationDto } from '../api/notifications';

export function useNotifications(token?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(token!),
    enabled: !!token,
    refetchInterval: 30000, // Poll every 30s
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => markNotificationRead(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: query.data || [],
    unreadCount: query.data?.filter((n: NotificationDto) => !n.isRead).length || 0,
    isLoading: query.isLoading,
    markAsRead: markAsRead.mutate
  };
}
