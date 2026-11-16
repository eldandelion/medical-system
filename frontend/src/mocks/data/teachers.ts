import { TeacherDetailDto, TeacherSummaryDto } from '../../api/teachers';
import { StudentDto } from '../../api/students';
import { Student } from '../../types';
import { mockAdminUsersDb } from './admin';
import { mockStudentsDb } from './students';

function toStudentDto(s: Student): StudentDto {
  return {
    id: s.id,
    studentNumber: s.studentNumber,
    name: s.name,
    major: s.major,
    year: s.year,
    degreeLevel: s.degreeLevel,
    status: s.status,
    riskLevel: s.riskLevel,
    assignedTeacherId: s.assignedTeacherId ?? null,
    assignedTeacherName: s.assignedTeacherName ?? null,
    demographics: s.demographics,
  };
}

export function getMockTeachersSummary(params?: { keyword?: string; status?: string }): TeacherSummaryDto[] {
  const keyword = params?.keyword?.trim().toLowerCase();
  const status = params?.status;

  return mockAdminUsersDb
    .filter((u) => u.role === 'TEACHER')
    .filter((u) => (status ? u.status === status : u.status !== 'DELETED'))
    .filter((u) => {
      if (!keyword) return true;
      const collegeName = u.departmentOrCollege || '';
      const emp = u.employeeOrStudentId || '';
      return (
        u.name.toLowerCase().includes(keyword) ||
        emp.toLowerCase().includes(keyword) ||
        collegeName.toLowerCase().includes(keyword)
      );
    })
    .map((u) => ({
      id: u.id,
      name: u.name,
      employeeNumber: u.employeeOrStudentId || `EMP-${u.id}`,
      collegeId: u.id,
      collegeName: u.departmentOrCollege || '综合学院',
      status: u.status,
      phone: u.contactNumber ?? null,
      email: u.email,
      assignedStudentCount: mockStudentsDb.filter((s) => s.assignedTeacherId === u.id).length,
    }));
}

export function getMockTeacherDetail(teacherId: number): TeacherDetailDto | null {
  const user = mockAdminUsersDb.find((u) => u.id === teacherId && u.role === 'TEACHER');
  if (!user) return null;

  const assignedStudents = mockStudentsDb
    .filter((s) => s.assignedTeacherId === teacherId)
    .map(toStudentDto);

  return {
    id: user.id,
    name: user.name,
    employeeNumber: user.employeeOrStudentId || `EMP-${user.id}`,
    collegeId: user.id,
    collegeName: user.departmentOrCollege || '综合学院',
    status: user.status,
    phone: user.contactNumber ?? null,
    email: user.email,
    assignedStudentCount: assignedStudents.length,
    assignedStudents,
  };
}
