import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentDetailsView, StudentDetailsTabs } from './StudentDetailsView';
import { Student } from '../../types';

import { DetailsContext, DetailsHeaderOverride } from '../../contexts/DetailsContext';
import { SnackbarProvider } from '../../contexts/SnackbarContext';

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

  const renderWithProviders = (
    ui: React.ReactElement,
    detailsContextValue: Partial<React.ComponentProps<typeof DetailsContext.Provider>['value']> = {}
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <DetailsContext.Provider value={{ isFullScreen: false, ...detailsContextValue }}>
            {ui}
          </DetailsContext.Provider>
        </SnackbarProvider>
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

  it('registers headerOverride with avatar, title, subtitle, and badge on mount', async () => {
    const setHeaderOverrideMock = vi.fn();
    renderWithProviders(<StudentDetailsView student={mockStudent} />, {
      setHeaderOverride: setHeaderOverrideMock,
    });

    expect(setHeaderOverrideMock).toHaveBeenCalled();
    const lastCall = setHeaderOverrideMock.mock.calls[setHeaderOverrideMock.mock.calls.length - 1][0] as DetailsHeaderOverride;
    expect(lastCall).toBeDefined();
    expect(lastCall.title).toBe('张伟');
    expect(lastCall.subtitle).toBe('2021001');

    // Avatar initial check
    const avatarRender = render(lastCall.avatar);
    expect(avatarRender.getByText('张')).toBeDefined();

    // Badge check
    const badgeRender = render(lastCall.badge);
    expect(badgeRender.getByText('低')).toBeDefined();
  });

  it('cleans up headerOverride on unmount', async () => {
    const setHeaderOverrideMock = vi.fn();
    const { unmount } = renderWithProviders(<StudentDetailsView student={mockStudent} />, {
      setHeaderOverride: setHeaderOverrideMock,
    });

    unmount();
    expect(setHeaderOverrideMock).toHaveBeenLastCalledWith(null);
  });

  it('does not render legacy inner header or duplicate h1', async () => {
    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    // Legacy inner h1 should not exist in StudentDetailsView
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);

    // Legacy 64px avatar container should not exist
    const largeAvatars = document.querySelectorAll('.w-16.h-16');
    expect(largeAvatars.length).toBe(0);
  });

  it('renders student number in the Overview tab', async () => {
    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    // Metric card / list item for student number in Overview tab
    expect(screen.getByText('学号')).toBeDefined();
    const numbers = screen.getAllByText('2021001');
    expect(numbers.length).toBeGreaterThanOrEqual(1);
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

  it('gracefully falls back to N/A in headerOverride when studentNumber is empty or undefined', async () => {
    const studentWithoutNumber: Student = {
      ...mockStudent,
      studentNumber: '',
      riskLevel: undefined,
    };
    const setHeaderOverrideMock = vi.fn();

    renderWithProviders(<StudentDetailsView student={studentWithoutNumber} />, {
      setHeaderOverride: setHeaderOverrideMock,
    });

    expect(setHeaderOverrideMock).toHaveBeenCalled();
    const lastCall = setHeaderOverrideMock.mock.calls[setHeaderOverrideMock.mock.calls.length - 1][0] as DetailsHeaderOverride;
    expect(lastCall.subtitle).toBe('N/A');

    const badgeRender = render(lastCall.badge);
    expect(badgeRender.getByText('低')).toBeDefined();
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

  describe('defaultTab configuration and uncontrolled mode', () => {
    it('renders history tab when initialized in uncontrolled mode with defaultTab={StudentDetailsTabs.HISTORY}', () => {
      renderWithProviders(
        <StudentDetailsView student={mockStudent} defaultTab={StudentDetailsTabs.HISTORY} />
      );

      // In history tab, "基本特征" from overview should NOT be displayed
      expect(screen.queryByText('基本特征')).toBeNull();
      expect(screen.queryByText('学籍信息')).toBeNull();
    });

    it('falls back to StudentDetailsTabs.OVERVIEW when defaultTab is omitted in uncontrolled mode', () => {
      renderWithProviders(<StudentDetailsView student={mockStudent} />);

      // Overview tab should be displayed
      expect(screen.getByText('基本特征')).toBeDefined();
      expect(screen.getByText('学籍信息')).toBeDefined();
    });

    it('honors controlled activeTab prop even when defaultTab is provided', () => {
      renderWithProviders(
        <StudentDetailsView
          student={mockStudent}
          defaultTab={StudentDetailsTabs.HISTORY}
          activeTab={StudentDetailsTabs.OVERVIEW}
        />
      );

      // Controlled activeTab is OVERVIEW, so overview should be displayed
      expect(screen.getByText('基本特征')).toBeDefined();
      expect(screen.getByText('学籍信息')).toBeDefined();
    });

    it('synchronizes internal active tab when defaultTab prop updates in uncontrolled mode', async () => {
      const { rerender } = renderWithProviders(
        <StudentDetailsView student={mockStudent} defaultTab={StudentDetailsTabs.OVERVIEW} />
      );

      expect(screen.getByText('基本特征')).toBeDefined();

      rerender(
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <DetailsContext.Provider value={{ isFullScreen: false }}>
              <StudentDetailsView student={mockStudent} defaultTab={StudentDetailsTabs.HISTORY} />
            </DetailsContext.Provider>
          </SnackbarProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText('基本特征')).toBeNull();
      });
    });
  });
});
