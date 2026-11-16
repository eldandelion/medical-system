import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeacherCaseloadSection } from './TeacherCaseloadSection';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import * as teachersApi from '../../api/teachers';
import { AccountStatus } from '../../types/admin';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'admin', token: 'mock_admin_token' },
  }),
}));

const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();
vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation,
  }),
}));

vi.mock('../../api/teachers', () => ({
  fetchTeacherDetails: vi.fn(),
  unassignStudentFromTeacher: vi.fn(),
}));

const mockDetail: teachersApi.TeacherDetailDto = {
  id: 2,
  name: '艾米丽·沃森',
  employeeNumber: 'EMP-00001',
  collegeId: 1,
  collegeName: '医学院',
  status: 'ACTIVE',
  phone: '13800138002',
  email: 'emily@univ.edu.cn',
  assignedStudentCount: 1,
  assignedStudents: [
    {
      id: '1',
      studentNumber: '2021001',
      name: '张伟',
      major: '计算机科学',
      status: 'Active',
      riskLevel: 'MEDIUM',
      assignedTeacherId: 2,
      assignedTeacherName: '艾米丽·沃森',
    },
  ],
};

describe('TeacherCaseloadSection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(teachersApi.fetchTeacherDetails).mockResolvedValue(mockDetail);
    vi.mocked(teachersApi.unassignStudentFromTeacher).mockResolvedValue({
      success: true,
      unassignedStudentId: 1,
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderSection = (status: AccountStatus = 'ACTIVE') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <TeacherCaseloadSection
            teacherId={2}
            teacherName="艾米丽·沃森"
            teacherStatus={status}
            placeholderSummary={{
              id: 2,
              name: '艾米丽·沃森',
              employeeNumber: 'EMP-00001',
              collegeId: 1,
              collegeName: '医学院',
              status,
              phone: '13800138002',
              email: 'emily@univ.edu.cn',
              assignedStudentCount: 1,
            }}
          />
        </SnackbarProvider>
      </QueryClientProvider>
    );
  };

  it('loads caseload via fetchTeacherDetails and opens bottom sheet on 分配学生 click', async () => {
    renderSection('ACTIVE');

    await waitFor(() => {
      expect(teachersApi.fetchTeacherDetails).toHaveBeenCalledWith(2, 'mock_admin_token');
      expect(screen.getByText('负责学生 (1)')).toBeDefined();
      expect(screen.getByText('张伟')).toBeDefined();
      expect(screen.getByText('2021001 · 计算机科学')).toBeDefined();
    });

    const assignBtn = screen.getByText('分配学生');
    fireEvent.click(assignBtn);

    expect(mockOpenCreation).toHaveBeenCalledTimes(1);
    expect(mockOpenCreation.mock.calls[0][0]).toBe('分配学生');
  });

  it('disables 分配学生 and shows inline hint when teacher is not ACTIVE', async () => {
    vi.mocked(teachersApi.fetchTeacherDetails).mockResolvedValue({
      ...mockDetail,
      status: 'PENDING_APPROVAL',
      assignedStudentCount: 0,
      assignedStudents: [],
    });

    renderSection('PENDING_APPROVAL');

    await waitFor(() => {
      expect(screen.getByText('仅已启用状态的教师可分配学生')).toBeDefined();
    });

    const assignBtn = screen.getByText('分配学生').closest('button, md-filled-button, md-outlined-button');
    expect(assignBtn?.hasAttribute('disabled')).toBe(true);
  });

  it('unassigns student after GenericDialog confirmation and invalidates caches', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    renderSection('ACTIVE');

    await waitFor(() => {
      expect(screen.getByText('张伟')).toBeDefined();
    });

    const removeBtn = screen.getByLabelText('取消分配 张伟');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.getByText('取消分配确认')).toBeDefined();
    });

    fireEvent.click(screen.getByText('确认移除'));

    await waitFor(() => {
      expect(teachersApi.unassignStudentFromTeacher).toHaveBeenCalledWith(2, '1', 'mock_admin_token');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['/api/teachers'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['/api/admin/users'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['/api/students'] });
    });
  });

  it('renders empty and error states cleanly', async () => {
    vi.mocked(teachersApi.fetchTeacherDetails).mockRejectedValueOnce(new Error('加载失败'));
    renderSection('ACTIVE');

    await waitFor(() => {
      expect(screen.getByText(/无法加载负责学生列表/)).toBeDefined();
    });
  });
});
