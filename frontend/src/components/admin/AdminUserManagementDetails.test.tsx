import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminPage } from '../../pages/AdminPage';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { CreationOverlayProvider } from '../../contexts/CreationContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AdminUserSummaryDto } from '../../types/admin';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockUsers: AdminUserSummaryDto[] = [
  {
    id: 101,
    name: '学生张三',
    email: 'zhangsan@university.edu.cn',
    role: 'STUDENT',
    status: 'ACTIVE',
    employeeOrStudentId: 'STU1001',
    departmentOrCollege: '计算机科学学院 / 软件工程',
  },
  {
    id: 201,
    name: '李老师',
    email: 'liteacher@university.edu.cn',
    role: 'TEACHER',
    status: 'ACTIVE',
    employeeOrStudentId: 'TEA2001',
    departmentOrCollege: '心理咨询中心',
  },
];

const mockStudentDetails = {
  id: 101,
  name: '学生张三',
  major: '软件工程',
  riskLevel: 'LOW',
  demographics: {
    studentId: 'STU1001',
    gender: 'MALE',
    age: 20,
    ethnicity: '汉族',
    idCardNumber: '110101200601011234',
    contactNumber: '13800138000',
    email: 'zhangsan@university.edu.cn',
    homeAddress: '北京市海淀区',
    emergencyContactName: '张父',
    emergencyContactPhone: '13900139000',
  },
  clinicalStatus: 'NORMAL',
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: {
      role: 'admin',
      token: 'mock_admin_token',
    },
    setRole: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAdminUsers', () => ({
  useAdminUsers: () => ({
    users: mockUsers,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    updateStatus: vi.fn().mockResolvedValue({ status: 'DISABLED' }),
    deleteUser: vi.fn().mockResolvedValue({ status: 'DELETED' }),
    isUpdating: false,
  }),
}));

vi.mock('../../hooks/useAdminDashboard', () => ({
  useAdminDashboard: () => ({
    data: {
      metrics: {
        totalUsers: 2,
        pendingApprovals: 0,
        activeReferrals: 0,
        criticalRiskStudents: 0,
        publishedCatalogs: 5,
        securityConsentsToday: 10,
      },
      activityTitle: '系统治理最新动态',
      activities: [],
    },
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useProfileSummary', () => ({
  useAdminProfileSummary: () => ({
    data: {
      name: '系统管理员',
      role: 'admin',
      employeeId: 'SYS-ADMIN',
      department: '系统管理部',
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    unreadCount: 0,
    notifications: [],
    isLoading: false,
  }),
}));

describe('AdminPage - User Management Dynamic Details View Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/students/101')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudentDetails),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderAdminPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SnackbarProvider>
            <CreationOverlayProvider>
              <AdminPage />
            </CreationOverlayProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders student clinical tabs and governance footer when a student user is selected', async () => {
    renderAdminPage();

    // Navigate to User Management tab
    const userNavBtn = screen.getByText('用户治理');
    fireEvent.click(userNavBtn);

    // Click on Student row
    await waitFor(() => {
      expect(screen.getByText('学生张三')).toBeDefined();
    });
    fireEvent.click(screen.getByText('学生张三'));

    // Verify dynamic tabs for student (STUDENT_DETAILS_TABS)
    await waitFor(() => {
      expect(screen.getByText('临床概览')).toBeDefined();
      expect(screen.getByText('量表数据')).toBeDefined();
      expect(screen.getByText('档案记录')).toBeDefined();
    });

    // Deep assertion: verify student demographic fields fetched from /api/students/101 are rendered
    await waitFor(() => {
      expect(screen.getByText('13800138000')).toBeDefined();
      expect(screen.getByText('北京市海淀区')).toBeDefined();
      expect(screen.getByText('110101200601011234')).toBeDefined();
    });

    // Verify UserGovernanceFooter buttons are rendered (NOT counseling buttons like "发起转诊")
    expect(screen.getByText('禁用账号')).toBeDefined();
    expect(screen.getByText('注销账号')).toBeDefined();
    expect(screen.queryByText('发起转诊')).toBeNull();
    expect(screen.queryByText('分配问卷')).toBeNull();
  });

  it('renders user details tabs when a teacher user is selected', async () => {
    renderAdminPage();

    // Navigate to User Management tab
    const userNavBtn = screen.getByText('用户治理');
    fireEvent.click(userNavBtn);

    // Click on Teacher row
    await waitFor(() => {
      expect(screen.getByText('李老师')).toBeDefined();
    });
    fireEvent.click(screen.getByText('李老师'));

    // Verify dynamic tabs for teacher (USER_DETAILS_TABS)
    await waitFor(() => {
      expect(screen.getByText('基本信息')).toBeDefined();
      expect(screen.getByText('状态与权限')).toBeDefined();
    });

    // Student clinical tabs should not be present
    expect(screen.queryByText('量表数据')).toBeNull();
    expect(screen.queryByText('档案记录')).toBeNull();

    // Verify UserGovernanceFooter buttons are rendered in the footer
    expect(screen.getByText('禁用账号')).toBeDefined();
    expect(screen.getByText('注销账号')).toBeDefined();
  });
});
