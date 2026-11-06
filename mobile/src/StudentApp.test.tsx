import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { AppContent } from './StudentApp';
import { AuthContext } from './contexts/AuthContext';
import { AssessmentContext } from './contexts/AssessmentContext';
import { ReferralContext, ReferralContextValue } from './contexts/ReferralContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from './contexts/SnackbarContext';

describe('StudentApp', () => {
  const mockStudent = {
    studentNumber: '8209220532',
    fullName: '张三',
    phone: '13800138000',
    registeredAt: '2026-09-01T00:00:00',
  };

  const mockScales = [
    {
      code: 'comprehensive_student_intake_survey',
      title: '中南大学学生心身健康综合调查问卷',
      description: '综合普查',
      questionCount: 336,
      estimatedMinutes: 45,
      status: 'NOT_STARTED' as const,
      answeredCount: 0,
      completionPercentage: 0,
    },
  ];

  const mockReferrals = [
    {
      id: 'ref-1',
      studentId: 1,
      studentName: '张三',
      studentNumber: '8209220532',
      type: 'INITIAL' as const,
      date: '2026-10-31T09:00:00',
      title: '转诊待排诊',
      description: '持续失眠',
      riskLevel: 'HIGH' as const,
      status: 'WAITING_FOR_SCHEDULING' as const,
      referredBy: { name: '辅导员' },
      availableActions: [],
    },
  ];

  const renderWithProviders = (
    authState: any,
    assessmentState?: any,
    referralState?: any
  ) => {
    const defaultAuth: any = {
      student: mockStudent,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      setStudent: vi.fn(),
      ...authState,
    };

    const defaultAssessment: any = {
      scales: mockScales,
      loading: false,
      error: null,
      totalCount: 1,
      completedCount: 0,
      remainingCount: 1,
      isAllCompleted: false,
      refreshScales: vi.fn(),
      filter: 'all',
      setFilter: vi.fn(),
      isScrolled: false,
      setIsScrolled: vi.fn(),
      ...assessmentState,
    };

    const defaultReferral: ReferralContextValue = {
      referrals: mockReferrals,
      filteredReferrals: mockReferrals,
      filter: 'all',
      setFilter: vi.fn(),
      totalCount: 1,
      inProgressCount: 1,
      closedCount: 0,
      loading: false,
      error: null,
      isScrolled: false,
      setIsScrolled: vi.fn(),
      selectedReferralId: null,
      setSelectedReferralId: vi.fn(),
      activeDetailsTab: 'overview',
      setActiveDetailsTab: vi.fn(),
      refreshReferrals: vi.fn().mockResolvedValue(undefined),
      ...referralState,
    };

    return render(
      <AuthContext.Provider value={defaultAuth}>
        <AssessmentContext.Provider value={defaultAssessment}>
          <ReferralContext.Provider value={defaultReferral}>
            <ThemeProvider>
              <SnackbarProvider>
                <AppContent />
              </SnackbarProvider>
            </ThemeProvider>
          </ReferralContext.Provider>
        </AssessmentContext.Provider>
      </AuthContext.Provider>
    );
  };

  it('renders loading splash when auth is loading', () => {
    renderWithProviders({ loading: true, student: null });
    expect(screen.getByText('正在初始化普查系统...')).toBeDefined();
  });

  it('renders AuthPage when not authenticated', () => {
    renderWithProviders({ loading: false, student: null });
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.getByText('使用您的中南大学学号以继续心理普查')).toBeDefined();
  });

  it('renders student top bar and assessments page when authenticated', async () => {
    renderWithProviders({});

    expect(screen.getByText('中南大学 · 心理普查')).toBeDefined();
    expect(screen.getByText('心身健康普查问卷待填报')).toBeDefined();
    expect(screen.getByText('张三 (8209220532)')).toBeDefined();

    // Verify unified questionnaire is rendered
    expect(screen.getByText('中南大学学生心身健康综合调查问卷')).toBeDefined();
  });

  it('updates header when all tasks are completed', () => {
    renderWithProviders(
      {},
      {
        totalCount: 1,
        completedCount: 1,
        remainingCount: 0,
        isAllCompleted: true,
        scales: [{ ...mockScales[0], status: 'COMPLETED' as const }],
      }
    );

    expect(screen.getByText('全部测评任务已完成')).toBeDefined();
  });

  it('renders 3-destination bottom navigation bar with 问卷测评, 就医转诊, and 个人中心', () => {
    renderWithProviders({});

    const tabs = document.querySelectorAll('md-navigation-tab');
    expect(tabs.length).toBe(3);
    expect((tabs[0] as any).label ?? tabs[0].getAttribute('label')).toBe('问卷测评');
    expect((tabs[1] as any).label ?? tabs[1].getAttribute('label')).toBe('就医转诊');
    expect((tabs[2] as any).label ?? tabs[2].getAttribute('label')).toBe('个人中心');
  });

  it('switches between 问卷测评, 就医转诊, and 个人中心 tabs', async () => {
    renderWithProviders({});

    const tabs = document.querySelectorAll('md-navigation-tab');

    // Click on 就医转诊 tab
    fireEvent.click(tabs[1]);
    await screen.findByText('中南大学 · 医疗转诊');
    expect(screen.getByText('转诊待排诊')).toBeDefined();

    // Click on 个人中心 tab
    fireEvent.click(tabs[2]);
    await screen.findByText('中南大学 · 个人档案');
    expect(screen.getByText('医疗与数据安全须知')).toBeDefined();

    // Click back to 问卷测评 tab
    fireEvent.click(tabs[0]);
    await screen.findByText('中南大学 · 心理普查');
    expect(screen.getByText('中南大学学生心身健康综合调查问卷')).toBeDefined();
  });

  it('synchronizes top bar headline dynamically based on active tab', async () => {
    renderWithProviders({}, {}, { inProgressCount: 2 });

    const tabs = document.querySelectorAll('md-navigation-tab');
    fireEvent.click(tabs[1]);

    await screen.findByText('中南大学 · 医疗转诊');
    expect(screen.getByText('还有 2 项转诊进行中')).toBeDefined();
  });

  it('scroll-triggered header filter displays REFERRAL_FILTER_ITEMS when scrolled on Tab 1', async () => {
    renderWithProviders({}, {}, { isScrolled: true, totalCount: 2 });

    const tabs = document.querySelectorAll('md-navigation-tab');
    fireEvent.click(tabs[1]);

    // Segmented filter is in header
    const header = document.querySelector('header')!;
    await within(header).findByRole('radio', { name: /全部/ });
    expect(within(header).getByRole('radio', { name: /进行中/ })).toBeDefined();
    expect(within(header).getByRole('radio', { name: /已结案/ })).toBeDefined();
  });
});
