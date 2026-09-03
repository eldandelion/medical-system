import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserDetailsView } from './UserDetailsView';
import { AdminUserDetailsDto } from '../../types/admin';

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
    updateStatus: vi.fn().mockResolvedValue({ status: 'ACTIVE' }),
    deleteUser: vi.fn().mockResolvedValue({ status: 'DELETED' }),
    isUpdating: false,
  }),
}));

describe('UserDetailsView Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (user: AdminUserDetailsDto, activeTab = 'overview') => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UserDetailsView user={user} activeTab={activeTab} />
      </QueryClientProvider>
    );
  };

  it('renders student user with full demographic metrics and copyable id card', async () => {
    const studentUser: AdminUserDetailsDto = {
      id: 7,
      name: '李明',
      email: 'liming@univ.edu.cn',
      role: 'STUDENT',
      status: 'ACTIVE',
      employeeOrStudentId: 'S2023001',
      departmentOrCollege: '计算机科学与技术学院 / 计算机科学',
      affiliation: {
        identifier: 'S2023001',
        primaryOrganization: '中南大学',
        departmentOrMajor: '计算机科学与技术学院 / 计算机科学',
        titleOrDegree: '本科生',
        enrollmentYear: 2023,
      },
      demographics: {
        gender: 'MALE',
        age: 20,
        ethnicity: '汉族',
        idCardNumber: '110105200405123456',
        contactNumber: '13800138000',
        email: 'liming@univ.edu.cn',
        homeAddress: '北京市朝阳区某街道',
        emergencyContactName: '李建国',
        emergencyContactPhone: '13900139000',
        school: '中南大学',
      },
    };

    renderComponent(studentUser);

    expect(screen.getByText('李明')).toBeDefined();
    expect(screen.getByText('基本特征')).toBeDefined();
    expect(screen.getByText('男')).toBeDefined();
    expect(screen.getByText('20 岁')).toBeDefined();
    expect(screen.getByText('汉族')).toBeDefined();
    expect(screen.getByText('110105200405123456')).toBeDefined();
    expect(screen.getByText('学籍与培养信息')).toBeDefined();
    expect(screen.getByText('2023级 (本科生)')).toBeDefined();
    expect(screen.getByText('13800138000')).toBeDefined();
    expect(screen.getByText('北京市朝阳区某街道')).toBeDefined();
    expect(screen.getByText('李建国 (13900139000)')).toBeDefined();
  });

  it('renders doctor user with hospital and department metrics', async () => {
    const doctorUser: AdminUserDetailsDto = {
      id: 5,
      name: '李医生',
      email: 'li@univ.edu.cn',
      role: 'DOCTOR',
      status: 'ACTIVE',
      employeeOrStudentId: 'DOC-00001',
      departmentOrCollege: '内科',
      hospital: '中南大学湘雅医院',
      contactNumber: '13800138005',
      homeAddress: '湖南省长沙市岳麓区桐梓坡路138号',
      affiliation: {
        identifier: 'DOC-00001',
        primaryOrganization: '中南大学湘雅医院',
        departmentOrMajor: '内科',
        titleOrDegree: '主治医师',
      },
    };

    renderComponent(doctorUser);

    expect(screen.getByText('李医生')).toBeDefined();
    expect(screen.getByText('定点医疗与科室信息')).toBeDefined();
    expect(screen.getByText('中南大学湘雅医院')).toBeDefined();
    expect(screen.getAllByText('内科').length).toBeGreaterThan(0);
    expect(screen.getByText('13800138005')).toBeDefined();
    expect(screen.getByText('湖南省长沙市岳麓区桐梓坡路138号')).toBeDefined();
    // Demographics section should not be rendered for doctors without demographics
    expect(screen.queryByText('基本特征')).toBeNull();
  });

  it('renders system admin user details', async () => {
    const adminUser: AdminUserDetailsDto = {
      id: 1,
      name: '系统管理员',
      email: 'admin@univ.edu.cn',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE',
      employeeOrStudentId: 'SYS-ADMIN',
      departmentOrCollege: '系统管理部',
    };

    renderComponent(adminUser);

    expect(screen.getAllByText('系统管理员').length).toBeGreaterThan(0);
    expect(screen.getAllByText('系统管理部').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SYS-ADMIN').length).toBeGreaterThan(0);
  });

  it('copies data to clipboard when copy button is clicked', async () => {
    const teacherUser: AdminUserDetailsDto = {
      id: 2,
      name: '艾米丽·沃森',
      email: 'emily@univ.edu.cn',
      role: 'TEACHER',
      status: 'ACTIVE',
      employeeOrStudentId: 'EMP-00001',
      departmentOrCollege: '医学院',
      contactNumber: '13800138002',
      homeAddress: '北京市海淀区学院路38号',
    };

    renderComponent(teacherUser);

    const copyButtons = screen.getAllByTitle('复制');
    expect(copyButtons.length).toBeGreaterThan(0);

    fireEvent.click(copyButtons[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
