import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { fetchAdminUsers, updateAdminUserStatus, deleteAdminUser } from '../api/admin';
import { AccountStatus, UpdateAccountStatusRequest, UserRoleType } from '../types/admin';

export interface UseAdminUsersFilter {
  role?: UserRoleType;
  status?: AccountStatus;
  keyword?: string;
}

export function useAdminUsers(filter?: UseAdminUsersFilter) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const query = useQuery({
    queryKey: ['admin', 'users', session.token, filter?.role, filter?.status, filter?.keyword],
    queryFn: () => fetchAdminUsers(session.token, {
      role: filter?.role,
      status: filter?.status,
      keyword: filter?.keyword
    }),
    enabled: !!session.token && session.role === 'admin'
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, request }: { userId: number; request: UpdateAccountStatusRequest }) =>
      updateAdminUserStatus(session.token, userId, request),
    onSuccess: (data) => {
      showSnackbar({
        message: data.status === 'ACTIVE'
          ? '用户账号已激活/启用'
          : data.status === 'DISABLED'
          ? '用户账号已禁用'
          : '用户状态已更新',
        duration: 3000
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (err: any) => {
      showSnackbar({
        message: err.message || '更新用户状态失败',
        duration: 3000
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => deleteAdminUser(session.token, userId),
    onSuccess: () => {
      showSnackbar({
        message: '用户已删除（已标记注销）',
        duration: 3000
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
    },
    onError: (err: any) => {
      showSnackbar({
        message: err.message || '删除用户失败',
        duration: 3000
      });
    }
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending || deleteUserMutation.isPending
  };
}
