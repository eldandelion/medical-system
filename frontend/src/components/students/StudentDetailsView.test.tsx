import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentDetailsView } from './StudentDetailsView';
import { Student } from '../../types';

const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();
vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation
  })
}));

describe('StudentDetailsView Component', () => {
  let queryClient: QueryClient;

  const mockStudent: Student = {
    id: '1',
    studentNumber: '2021001',
    name: '张伟',
    major: '计算机科学',
    year: '大三',
    status: 'Active',
    riskLevel: 'LOW',
    demographics: {
      age: 21,
      gender: 'MALE',
      ethnicity: '汉族',
      idCardNumber: '110101200301011234',
      contactNumber: '13800138001',
      email: 'zhangwei@univ.edu.cn',
      homeAddress: '北京市海淀区中关村南大街1号',
      emergencyContactName: '张建军',
      emergencyContactPhone: '13900139001',
      school: '中南大学'
    }
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      session: {
        role: 'teacher',
        token: 'mock-teacher-token'
      }
    });

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/students/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudent)
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders student name and studentNumber in header, avoiding N/A', async () => {
    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    // Student name
    expect(screen.getByText('张伟')).toBeDefined();

    // Student number displayed in header below name
    const studentNumberElements = screen.getAllByText('2021001');
    expect(studentNumberElements.length).toBeGreaterThanOrEqual(1);

    // Header student number should have font-mono styling
    const headerNumberElement = studentNumberElements.find(
      (el) => el.classList.contains('font-mono')
    );
    expect(headerNumberElement).toBeDefined();
    expect(headerNumberElement?.textContent).toBe('2021001');

    // Make sure 'N/A' is not rendered for student number in header
    expect(headerNumberElement?.textContent).not.toBe('N/A');
  });

  it('renders student number in the Overview tab MetricCard', async () => {
    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    // Metric card / list item for student number
    expect(screen.getByText('学号')).toBeDefined();
    const numbers = screen.getAllByText('2021001');
    expect(numbers.length).toBeGreaterThanOrEqual(2); // Header + Overview list
  });

  it('renders all personal, academic, and contact details via GroupedInfoList', async () => {
    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    // Section headings
    expect(screen.getByText('基本特征')).toBeDefined();
    expect(screen.getByText('学籍信息')).toBeDefined();
    expect(screen.getByText('联系方式')).toBeDefined();

    // Basic demographics
    expect(screen.getByText('性别')).toBeDefined();
    expect(screen.getByText('男')).toBeDefined();
    expect(screen.getByText('年龄')).toBeDefined();
    expect(screen.getByText('21 岁')).toBeDefined();
    expect(screen.getByText('民族')).toBeDefined();
    expect(screen.getByText('汉族')).toBeDefined();
    expect(screen.getByText('身份证号')).toBeDefined();
    expect(screen.getByText('110101200301011234')).toBeDefined();

    // Academic details
    expect(screen.getByText('年级')).toBeDefined();
    expect(screen.getByText('大三')).toBeDefined();
    expect(screen.getByText('学校')).toBeDefined();
    expect(screen.getByText('中南大学')).toBeDefined();
    expect(screen.getByText('就读专业')).toBeDefined();

    // Contact details
    expect(screen.getByText('联系电话')).toBeDefined();
    expect(screen.getByText('13800138001')).toBeDefined();
    expect(screen.getByText('电子邮箱')).toBeDefined();
    expect(screen.getByText('zhangwei@univ.edu.cn')).toBeDefined();
    expect(screen.getByText('家庭住址')).toBeDefined();
    expect(screen.getByText('北京市海淀区中关村南大街1号')).toBeDefined();
    expect(screen.getByText('紧急联系人')).toBeDefined();
    expect(screen.getByText('张建军 (13900139001)')).toBeDefined();
  });

  it('renders copy buttons for copyable fields and copies to clipboard on click', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    const copyPhoneBtn = screen.getByRole('button', { name: '复制联系电话' });
    expect(copyPhoneBtn).toBeDefined();

    fireEvent.click(copyPhoneBtn);
    expect(writeTextMock).toHaveBeenCalledWith('13800138001');

    const copyIdCardBtn = screen.getByRole('button', { name: '复制身份证号' });
    expect(copyIdCardBtn).toBeDefined();

    fireEvent.click(copyIdCardBtn);
    expect(writeTextMock).toHaveBeenCalledWith('110101200301011234');

    const copyEmergencyBtn = screen.getByRole('button', { name: '复制紧急联系人' });
    expect(copyEmergencyBtn).toBeDefined();

    fireEvent.click(copyEmergencyBtn);
    expect(writeTextMock).toHaveBeenCalledWith('13900139001');
  });

  it('gracefully falls back to N/A when studentNumber is empty or undefined', async () => {
    const studentWithoutNumber: Student = {
      ...mockStudent,
      studentNumber: ''
    };

    renderWithProviders(<StudentDetailsView student={studentWithoutNumber} />);

    const monoElements = document.querySelectorAll('.font-mono');
    const headerSubtitleNumber = Array.from(monoElements).find(el => el.textContent === 'N/A');
    expect(headerSubtitleNumber).toBeDefined();
  });

  it('supports tab switching when onTabChange callback is provided', async () => {
    const onTabChange = vi.fn();
    renderWithProviders(
      <StudentDetailsView student={mockStudent} onTabChange={onTabChange} />
    );

    const mdTabs = document.querySelector('md-tabs');
    expect(mdTabs).toBeDefined();
    if (mdTabs) {
      (mdTabs as HTMLElement & { activeTabIndex: number }).activeTabIndex = 1;
      fireEvent(mdTabs, new CustomEvent('change', { bubbles: true }));
      expect(onTabChange).toHaveBeenCalledWith('psychometrics');
    }
  });
});
