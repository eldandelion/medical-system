import { useQuery } from '@tanstack/react-query';

export interface ProfileSummaryDto {
  avatarUrl?: string | null;
  name: string;
  role: 'TEACHER' | 'HEAD_COUNSELLOR' | 'TRIAL_ADMIN' | 'DOCTOR' | 'SYSTEM_ADMIN' | 'STUDENT';
  studentId?: string;
  employeeId?: string;
  school?: string;
  department?: string;
}

const fetchStudentProfile = async (token?: string): Promise<ProfileSummaryDto> => {
  const response = await fetch(`${import.meta.env.BASE_URL}/api/dashboard/student/profile`.replace('//api', '/api'), {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch student profile');
  }
  return response.json();
};

const fetchTeacherProfile = async (token?: string): Promise<ProfileSummaryDto> => {
  const response = await fetch(`${import.meta.env.BASE_URL}/api/dashboard/teacher/profile`.replace('//api', '/api'), {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch teacher profile');
  }
  return response.json();
};

const fetchHeadCouncillorProfile = async (token?: string): Promise<ProfileSummaryDto> => {
  const response = await fetch(`${import.meta.env.BASE_URL}/api/dashboard/head-councillor/profile`.replace('//api', '/api'), {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch head councillor profile');
  }
  return response.json();
};

export const useStudentProfileSummary = (token?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'student', 'profile', token],
    queryFn: () => fetchStudentProfile(token),
    retry: 1, // Fail fast as requested by user
    enabled: !!token
  });
};

export const useTeacherProfileSummary = (token?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'teacher', 'profile', token],
    queryFn: () => fetchTeacherProfile(token),
    retry: 1, // Fail fast as requested by user
    enabled: !!token
  });
};

export const useHeadCouncillorProfileSummary = (token?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'head-councillor', 'profile', token],
    queryFn: () => fetchHeadCouncillorProfile(token),
    retry: 1, // Fail fast as requested by user
    enabled: !!token
  });
};
