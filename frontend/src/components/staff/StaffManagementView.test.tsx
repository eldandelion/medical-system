import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffManagementView } from './StaffManagementView';
import * as teachersApi from '../../api/teachers';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'head-councillor', token: 'mock_head_councillor_token_wang' },
  }),
}));

vi.mock('../../api/teachers', () => ({
  fetchTeachers: vi.fn(),
}));

const mockTeachers: teachersApi.TeacherSummaryDto[] = [
  {
    id: 2,
    name: '艾米丽·沃森',
    employeeNumber: 'EMP-00001',
    collegeId: 1,
    collegeName: '医学院',
    status: 'ACTIVE',
    phone: '13800138002',
    email: 'emily@univ.edu.cn',
    assignedStudentCount: 4,
  },
  {
    id: 9,
    name: '赵老师',
    employeeNumber: 'EMP-00099',
    collegeId: 2,
    collegeName: '心理学院',
    status: 'PENDING_APPROVAL',
    phone: '13800138099',
    email: 'zhao@univ.edu.cn',
    assignedStudentCount: 0,
  },
];

describe('StaffManagementView', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(teachersApi.fetchTeachers).mockResolvedValue(mockTeachers);
  });

  afterEach(() => {
    cleanup();
  });

  const renderView = (onStaffSelect = vi.fn()) => {
    return {
      onStaffSelect,
      ...render(
        <QueryClientProvider client={queryClient}>
          <StaffManagementView onStaffSelect={onStaffSelect} />
        </QueryClientProvider>
      ),
    };
  };

  it('fetches real teachers and renders columns with caseload count and status', async () => {
    const onStaffSelect = vi.fn();
    renderView(onStaffSelect);

    await waitFor(() => {
      expect(teachersApi.fetchTeachers).toHaveBeenCalledWith('mock_head_councillor_token_wang');
      expect(screen.getByText('艾米丽·沃森')).toBeDefined();
      expect(screen.getByText('工号: EMP-00001')).toBeDefined();
      expect(screen.getByText('医学院')).toBeDefined();
      expect(screen.getByText('4 名负责学生')).toBeDefined();
      expect(screen.getAllByText('已启用').length).toBeGreaterThan(0);
      expect(screen.getAllByText('待审核').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText('艾米丽·沃森'));
    expect(onStaffSelect).toHaveBeenCalledWith(mockTeachers[0]);
  });

  it('filters teachers by keyword and renders error state on failure', async () => {
    const { container } = renderView();

    await waitFor(() => {
      expect(screen.getByText('艾米丽·沃森')).toBeDefined();
      expect(screen.getByText('赵老师')).toBeDefined();
    });

    const searchField = container.querySelector('md-outlined-text-field') as HTMLElement;
    if (searchField) {
      (searchField as unknown as { value: string }).value = 'EMP-00099';
      fireEvent.input(searchField);
    }

    await waitFor(() => {
      expect(screen.queryByText('艾米丽·沃森')).toBeNull();
      expect(screen.getByText('赵老师')).toBeDefined();
    });

    cleanup();
    queryClient.clear();
    vi.mocked(teachersApi.fetchTeachers).mockRejectedValueOnce(new Error('网络错误'));
    renderView();

    await waitFor(() => {
      expect(screen.getByText(/无法加载教师列表/)).toBeDefined();
    });
  });
});
