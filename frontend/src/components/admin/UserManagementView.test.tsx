import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserManagementView } from './UserManagementView';
import { AdminUserSummaryDto } from '../../types/admin';

const mockUseAdminUsers = vi.fn();

vi.mock('../../hooks/useAdminUsers', () => ({
  useAdminUsers: () => mockUseAdminUsers(),
}));

describe('UserManagementView Component', () => {
  const sampleUsers: AdminUserSummaryDto[] = [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@university.edu.cn',
      role: 'STUDENT',
      status: 'ACTIVE',
      employeeOrStudentId: '2023001',
      departmentOrCollege: '计算机与通信工程学院',
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@university.edu.cn',
      role: 'TEACHER',
      status: 'ACTIVE',
      employeeOrStudentId: 'T1001',
      departmentOrCollege: '心理学系',
    },
    {
      id: 3,
      name: '王五',
      email: 'wangwu@hospital.org',
      role: 'DOCTOR',
      status: 'PENDING_APPROVAL',
      employeeOrStudentId: 'DOC01',
      hospital: '大学附属医院',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminUsers.mockReturnValue({
      users: sampleUsers,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all users and collapsed expandable search bar by default', () => {
    render(<UserManagementView />);

    expect(screen.getByText('张三')).toBeDefined();
    expect(screen.getByText('李四')).toBeDefined();
    expect(screen.getByText('王五')).toBeDefined();

    // Expandable search bar should be in collapsed button state initially
    const searchButton = screen.getByRole('button', { name: '展开搜索' });
    expect(searchButton).toBeDefined();
    expect(screen.queryByPlaceholderText('搜索姓名、工号/学号、院系...')).toBeNull();
  });

  it('expands search bar and filters users by keyword', () => {
    render(<UserManagementView />);

    // Click search icon button to expand
    fireEvent.click(screen.getByRole('button', { name: '展开搜索' }));

    const searchInput = screen.getByPlaceholderText('搜索姓名、工号/学号、院系...');
    expect(searchInput).toBeDefined();

    // Type query matching 张三's student ID
    fireEvent.change(searchInput, { target: { value: '2023001' } });

    expect(screen.getByText('张三')).toBeDefined();
    expect(screen.queryByText('李四')).toBeNull();
    expect(screen.queryByText('王五')).toBeNull();

    // Clear search using clear button
    const clearButton = screen.getByRole('button', { name: '清除搜索' });
    fireEvent.click(clearButton);

    // All users visible again
    expect(screen.getByText('张三')).toBeDefined();
    expect(screen.getByText('李四')).toBeDefined();
    expect(screen.getByText('王五')).toBeDefined();
  });

  it('filters by department or hospital name', () => {
    render(<UserManagementView />);

    fireEvent.click(screen.getByRole('button', { name: '展开搜索' }));
    const searchInput = screen.getByPlaceholderText('搜索姓名、工号/学号、院系...');

    fireEvent.change(searchInput, { target: { value: '附属医院' } });

    expect(screen.getByText('王五')).toBeDefined();
    expect(screen.queryByText('张三')).toBeNull();
    expect(screen.queryByText('李四')).toBeNull();
  });
});
