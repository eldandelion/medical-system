import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { AssessmentDispatchSummaryDto, ParticipationRecordDto } from '../types';

export const useAssessmentDispatches = () => {
  const { session } = useAuth();
  
  return useQuery({
    queryKey: ['/api/assessments/dispatches/summary', session?.token],
    queryFn: async () => {
      if (!session?.token) throw new Error('No auth token');
      
      const response = await fetch('/api/assessments/dispatches/summary', {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dispatch summaries');
      }
      
      return response.json() as Promise<AssessmentDispatchSummaryDto[]>;
    },
    enabled: !!session?.token,
  });
};

export const useAssessmentDispatchHistory = (filters: { dispatchId: number | 'latest' | 'ALL', search: string, severity: string }, page: number = 0, size: number = 20) => {
  const { session } = useAuth();
  
  return useQuery({
    queryKey: ['/api/assessments/participation-records', filters, page, size, session?.token],
    queryFn: async () => {
      if (!session?.token) throw new Error('No auth token');
      if (filters.dispatchId === 'latest') return { content: [], totalElements: 0, totalPages: 0 }; // handled via UI fallback to actual ID
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      if (filters.dispatchId !== 'ALL') params.append('dispatchId', filters.dispatchId.toString());
      if (filters.search) params.append('studentName', filters.search); // Search both for simplicity, or add studentNumber param if backend distinguishes
      if (filters.severity !== 'ALL') params.append('severity', filters.severity);
      
      const response = await fetch(`/api/assessments/participation-records?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch participation records');
      }
      
      // Assume paginated backend response matches Spring Page DTO
      return response.json() as Promise<{ content: ParticipationRecordDto[], totalElements: number, totalPages: number }>;
    },
    enabled: !!session?.token && filters.dispatchId !== 'latest',
  });
};
