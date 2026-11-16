import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffDetailsView } from './StaffDetailsView';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { CreationOverlayProvider } from '../../contexts/CreationContext';
import * as teachersApi from '../../api/teachers';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'head-councillor', token: 'mock_head_councillor_token_wang' },
  }),
}));

vi.mock('../../api/teachers', () => ({
  fetchTeacherDetails: vi.fn(),
  unassignStudentFromTeacher: vi.fn(),
}));

const mockTeacher: teachersApi.TeacherSummaryDto = {
  id: 2,
  name: '艾米丽·沃森',
  employeeNumber: 'EMP-00001',
  collegeId: 1,
  collegeName: '医学院',
  status: 'ACTIVE',
  phone: '13800138002',
  email: 'emily@univ.edu.cn',
  assignedStudentCount: 1,
};

describe('StaffDetailsView', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(teachersApi.fetchTeacherDetails).mockResolvedValue({
      ...mockTeacher,
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
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders real teacher profile metadata and TeacherCaseloadSection without legacy mock tabs/buttons', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <CreationOverlayProvider>
            <StaffDetailsView staff={mockTeacher} />
          </CreationOverlayProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('艾米丽·沃森').length).toBeGreaterThan(0);
      expect(screen.getAllByText('EMP-00001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('医学院').length).toBeGreaterThan(0);
      expect(screen.getByText('13800138002')).toBeDefined();
      expect(screen.getByText('emily@univ.edu.cn')).toBeDefined();
      expect(screen.getByText('负责学生 (1)')).toBeDefined();
      expect(screen.getByText('张伟')).toBeDefined();
      expect(screen.getByText('分配学生')).toBeDefined();
    });

    // Legacy fake mock tabs and no-op footer buttons must not exist
    expect(screen.queryByText('操作日志')).toBeNull();
    expect(screen.queryByText('权限范围')).toBeNull();
    expect(screen.queryByText('暂停访问')).toBeNull();
    expect(screen.queryByText('重置登录凭据')).toBeNull();
  });
});
