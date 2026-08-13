import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AssessmentAssignmentHistoryDto } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const useAssessmentHistory = (studentId: string | number, page = 0, size = 20) => {
  const { session } = useAuth();
  
  return useQuery<PageResponse<AssessmentAssignmentHistoryDto>, Error>({
    queryKey: ['/api/assessments/assignments/student', studentId, page, size, session?.token],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.BASE_URL}/api/assessments/assignments/student/${studentId}?page=${page}&size=${size}`.replace('//api', '/api'), {
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessment history');
      }
      
      return response.json();
    },
    enabled: !!session?.token && !!studentId,
  });
};

export const useRevokeAssignment = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (assignmentId: number) => {
      const response = await fetch(`${import.meta.env.BASE_URL}/api/assessments/assignments/${assignmentId}/revoke`.replace('//api', '/api'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to revoke assignment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments/assignments/student'] });
    },
  });
};
