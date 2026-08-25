import { apiFetch } from './client';

export interface StudentDto {
  id: string;
  studentNumber?: string;
  name: string;
  major: string;
  year?: string;
  degreeLevel?: string;
  status: 'Active' | 'Inactive';
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  demographics?: {
    gender?: string;
    age?: number;
    ethnicity?: string;
    idCardNumber?: string;
    contactNumber?: string;
    email?: string;
    homeAddress?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    school?: string;
  };
}

export async function fetchStudents(token?: string): Promise<StudentDto[]> {
  return apiFetch<StudentDto[]>('/api/students', { token });
}

export async function fetchStudentDetails(id: string, token?: string): Promise<StudentDto> {
  return apiFetch<StudentDto>(`/api/students/${id}`, { token });
}
