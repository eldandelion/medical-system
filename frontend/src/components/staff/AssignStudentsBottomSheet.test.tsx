import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssignStudentsBottomSheet } from './AssignStudentsBottomSheet';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import * as studentsApi from '../../api/students';
import * as teachersApi from '../../api/teachers';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'head-councillor', token: 'mock_head_councillor_token_wang' },
  }),
}));

vi.mock('../../api/students', () => ({
  fetchStudents: vi.fn(),
}));

vi.mock('../../api/teachers', () => ({
  assignStudentsToTeacher: vi.fn(),
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

const mockStudents: studentsApi.StudentDto[] = [
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
  {
    id: '3',
    studentNumber: '2022001',
    name: '王强',
    major: '生物学',
    status: 'Active',
    riskLevel: 'LOW',
    assignedTeacherId: null,
    assignedTeacherName: null,
  },
  {
    id: '4',
    studentNumber: '2022002',
    name: '赵敏',
    major: '心理学',
    status: 'Active',
    riskLevel: 'HIGH',
    assignedTeacherId: null,
    assignedTeacherName: null,
  },
  {
    id: '5',
    studentNumber: '2022003',
    name: '孙丽',
    major: '临床医学',
    status: 'Active',
    riskLevel: 'LOW',
    assignedTeacherId: 9,
    assignedTeacherName: '赵老师',
  },
];

describe('AssignStudentsBottomSheet', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(studentsApi.fetchStudents).mockResolvedValue(mockStudents);
    vi.mocked(teachersApi.assignStudentsToTeacher).mockResolvedValue({
      assignedCount: 1,
      reassignedCount: 0,
      unchangedCount: 0,
      assignedStudentIds: [3],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  const renderSheet = (onClose = vi.fn()) => {
    return {
      onClose,
      ...render(
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <AssignStudentsBottomSheet teacher={mockTeacher} onClose={onClose} />
          </SnackbarProvider>
        </QueryClientProvider>
      ),
    };
  };

  it('defaults to 仅看未分配, filters with 300ms debounced MD3 search, and uses no native inputs', async () => {
    const { container } = renderSheet();

    await waitFor(() => {
      expect(screen.getByText('王强')).toBeDefined();
      expect(screen.getByText('赵敏')).toBeDefined();
    });

    // Assigned students hidden by default when 仅看未分配 is active
    expect(screen.queryByText('张伟')).toBeNull();
    expect(screen.queryByText('孙丽')).toBeNull();

    // Verify strict MD3 Web Components compliance
    expect(container.querySelectorAll('input, textarea, select').length).toBe(0);

    // Switch to 全部学生
    const allChip = container.querySelector('md-filter-chip[label="全部学生"]') as HTMLElement;
    expect(allChip).toBeTruthy();
    fireEvent.click(allChip);

    await waitFor(() => {
      expect(screen.getByText('张伟')).toBeDefined();
      expect(screen.getByText('孙丽')).toBeDefined();
    });

    // Student already assigned to this teacher shows 已分配 and disabled checkbox
    expect(screen.getByText('已分配')).toBeDefined();
    expect(screen.getByText('当前导师: 赵老师')).toBeDefined();

    // Debounced search by major
    vi.useFakeTimers();
    const searchField = container.querySelector('md-outlined-text-field') as HTMLElement;
    expect(searchField).toBeTruthy();
    (searchField as unknown as { value: string }).value = '心理学';
    fireEvent.input(searchField);

    // Before 300ms debounce, 王强 is still visible
    expect(screen.getByText('王强')).toBeDefined();

    await act(async () => {
      vi.advanceTimersByTime(310);
    });

    expect(screen.queryByText('王强')).toBeNull();
    expect(screen.getByText('赵敏')).toBeDefined();
  });

  it('submits multi-selected unassigned students and invalidates queries', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const onClose = vi.fn();
    renderSheet(onClose);

    await waitFor(() => {
      expect(screen.getByText('王强')).toBeDefined();
    });

    fireEvent.click(screen.getByText('王强'));
    fireEvent.click(screen.getByText('赵敏'));

    const submitBtn = screen.getByText('确认分配 (2)');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(teachersApi.assignStudentsToTeacher).toHaveBeenCalledWith(
        2,
        [3, 4],
        'mock_head_councillor_token_wang'
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['/api/teachers'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['/api/admin/users'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['/api/students'] });
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('opens reassignment confirmation dialog when selecting a student assigned to another teacher', async () => {
    const { container } = renderSheet();

    await waitFor(() => {
      expect(screen.getByText('王强')).toBeDefined();
    });

    const allChip = container.querySelector('md-filter-chip[label="全部学生"]') as HTMLElement;
    fireEvent.click(allChip);

    await waitFor(() => {
      expect(screen.getByText('孙丽')).toBeDefined();
    });

    fireEvent.click(screen.getByText('孙丽'));
    fireEvent.click(screen.getByText('确认分配 (1)'));

    await waitFor(() => {
      expect(screen.getByText('重新分配确认')).toBeDefined();
      expect(screen.getByText(/孙丽.*赵老师/)).toBeDefined();
    });

    expect(teachersApi.assignStudentsToTeacher).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('确认重新分配'));

    await waitFor(() => {
      expect(teachersApi.assignStudentsToTeacher).toHaveBeenCalledWith(
        2,
        [5],
        'mock_head_councillor_token_wang'
      );
    });
  });

  it('renders loading and error states cleanly', async () => {
    vi.mocked(studentsApi.fetchStudents).mockRejectedValueOnce(new Error('网络错误'));
    renderSheet();

    await waitFor(() => {
      expect(screen.getByText(/无法加载学生列表/)).toBeDefined();
    });
  });
});
