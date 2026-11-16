import { apiFetch } from './client';
import { StudentDto } from './students';
import { AccountStatus } from '../types/admin';

export interface TeacherSummaryDto {
  id: number;
  name: string;
  employeeNumber: string;
  collegeId: number;
  collegeName: string;
  status: AccountStatus;
  phone?: string | null;
  email: string;
  assignedStudentCount: number;
}

export interface TeacherDetailDto {
  id: number;
  name: string;
  employeeNumber: string;
  collegeId: number;
  collegeName: string;
  status: AccountStatus;
  phone?: string | null;
  email: string;
  assignedStudentCount: number;
  assignedStudents: StudentDto[];
}

export interface AssignTeacherStudentsResponse {
  assignedCount: number;
  reassignedCount: number;
  unchangedCount: number;
  assignedStudentIds: number[];
}

export interface UnassignStudentResponse {
  success: boolean;
  unassignedStudentId: number;
}

export async function fetchTeachers(
  token?: string,
  params?: { keyword?: string; status?: AccountStatus }
): Promise<TeacherSummaryDto[]> {
  return apiFetch<TeacherSummaryDto[]>('/api/teachers', {
    token,
    params,
  });
}

export async function fetchTeacherDetails(
  id: number | string,
  token?: string
): Promise<TeacherDetailDto> {
  return apiFetch<TeacherDetailDto>(`/api/teachers/${id}`, {
    token,
  });
}

export async function assignStudentsToTeacher(
  teacherId: number | string,
  studentIds: number[],
  token?: string
): Promise<AssignTeacherStudentsResponse> {
  return apiFetch<AssignTeacherStudentsResponse>(`/api/teachers/${teacherId}/students`, {
    token,
    method: 'POST',
    body: { studentIds },
  });
}

export async function unassignStudentFromTeacher(
  teacherId: number | string,
  studentId: number | string,
  token?: string
): Promise<UnassignStudentResponse> {
  return apiFetch<UnassignStudentResponse>(`/api/teachers/${teacherId}/students/${studentId}`, {
    token,
    method: 'DELETE',
  });
}
