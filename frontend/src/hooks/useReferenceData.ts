import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import {
  fetchReferences,
  createReference,
  updateReference,
  checkReferenceDependencies,
  deprecateReference,
  reactivateReference,
  deleteReference,
} from '../api/references';
import { ReferenceCategory, AnyReferenceItem, ReferenceDependencyCheckDto } from '../types/references';

export function useReferencesList(
  category: ReferenceCategory,
  options: {
    query?: string;
    collegeId?: number;
    hospitalId?: number;
    includeDeprecated?: boolean;
  } = {}
) {
  const { session } = useAuth();
  const token = session?.token;

  return useQuery<AnyReferenceItem[], Error>({
    queryKey: ['/api/admin/references', category, options.query, options.collegeId, options.hospitalId, options.includeDeprecated, token],
    queryFn: () =>
      fetchReferences(category, {
        ...options,
        token,
      }),
    enabled: !!token,
  });
}

export function useSaveReference() {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<
    AnyReferenceItem,
    Error,
    { category: ReferenceCategory; id?: number; data: Record<string, unknown> }
  >({
    mutationFn: ({ category, id, data }) => {
      if (id) {
        return updateReference(category, id, data, session?.token);
      }
      return createReference(category, data, session?.token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/references', variables.category] });
      showSnackbar({ message: variables.id ? '基础数据更新成功' : '新增基础数据成功' });
    },
    onError: (error) => {
      showSnackbar({ message: error.message || '操作失败，请重试' });
    },
  });
}

export function useDeprecateReference() {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<AnyReferenceItem, Error, { category: ReferenceCategory; id: number }>({
    mutationFn: ({ category, id }) => deprecateReference(category, id, session?.token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/references', variables.category] });
      // If parent entity is deprecated, invalidate child categories as well
      if (variables.category === 'COLLEGE') {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/references', 'MAJOR'] });
      } else if (variables.category === 'HOSPITAL') {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/references', 'HOSPITAL_DEPARTMENT'] });
      }
      showSnackbar({ message: '已成功停用该数据项' });
    },
    onError: (error) => {
      showSnackbar({ message: error.message || '停用失败' });
    },
  });
}

export function useReactivateReference() {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<AnyReferenceItem, Error, { category: ReferenceCategory; id: number }>({
    mutationFn: ({ category, id }) => reactivateReference(category, id, session?.token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/references', variables.category] });
      showSnackbar({ message: '已重新启用该数据项' });
    },
    onError: (error) => {
      showSnackbar({ message: error.message || '启用失败' });
    },
  });
}

export function useDeleteReference() {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { category: ReferenceCategory; id: number }>({
    mutationFn: ({ category, id }) => deleteReference(category, id, session?.token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/references', variables.category] });
      showSnackbar({ message: '已彻底删除该数据项' });
    },
    onError: (error) => {
      showSnackbar({ message: error.message || '删除失败，该数据项可能已被引用' });
    },
  });
}

export function useReferenceDependencyCheck() {
  const { session } = useAuth();

  return useMutation<ReferenceDependencyCheckDto, Error, { category: ReferenceCategory; id: number }>({
    mutationFn: ({ category, id }) => checkReferenceDependencies(category, id, session?.token),
  });
}
