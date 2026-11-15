import * as React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminPage } from './AdminPage';
import { HeadCouncillorPage } from './HeadCouncillorPage';
import { TeacherPage } from './TeacherPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SnackbarProvider } from '../contexts/SnackbarContext';
import { AssessmentCatalogItemDto } from '../types';

const mockUseAuth = vi.fn();
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();
vi.mock('../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation,
    expandToFullscreen: vi.fn(),
  }),
  CreationOverlayProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => ({ unreadCount: 0 }),
}));

vi.mock('../hooks/useNavigation', () => ({
  useNavigation: () => ({ lastEvent: null, navigateToTab: vi.fn() }),
}));

vi.mock('../hooks/useAdminProfileSummary', () => ({
  useAdminProfileSummary: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock('../hooks/useProfileSummary', () => ({
  useAdminProfileSummary: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
  useHeadCouncillorProfileSummary: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
  useTeacherProfileSummary: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock('../hooks/useAdminDashboard', () => ({
  useAdminDashboard: () => ({ data: null, isLoading: false }),
}));

vi.mock('../hooks/useDashboardActivity', () => ({
  useDashboardActivity: () => ({ data: { activities: [] } }),
}));

const mockToggleAvailability = vi.fn();
const sampleCatalog: AssessmentCatalogItemDto[] = [
  {
    batteryCode: 'PHQ_9',
    title: '情绪状况评估 (PHQ-9)',
    subtitle: '抑郁症筛查量表',
    description: '用于评估过去两周内抑郁情绪的筛查量表。',
    duration: '5 分钟',
    questionCount: 9,
    isEnabled: true,
    sections: [
      {
        id: 'phq9',
        title: '核心抑郁症状',
        subtitle: 'PHQ-9',
        description: '过去两周的频率',
        questions: [
          {
            id: 'phq9_1',
            orderNum: 1,
            text: '做事时提不起劲或没有兴趣',
            type: 'single_choice',
            options: [
              { value: 0, label: '完全不会' },
              { value: 1, label: '好几天' },
            ],
          },
        ],
      },
    ],
  },
];

vi.mock('../hooks/useAssessmentCatalogManagement', () => ({
  useAssessmentCatalogManagement: () => ({
    catalog: sampleCatalog,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    toggleAvailability: mockToggleAvailability,
    isToggling: false,
  }),
}));

vi.mock('../hooks/useAssessmentDispatchHistory', () => ({
  useAssessmentDispatches: () => ({ data: [] }),
  useAssessmentDispatchHistory: () => ({
    data: {
      content: [
        {
          id: 'disp-1',
          assignmentId: 101,
          studentId: 1001,
          studentNumber: 'STU2026001',
          studentName: '王小明',
          batteryCode: 'PHQ_9',
          status: 'COMPLETED',
          severity: 'MODERATE',
          assignedByName: '李医生',
          assignedAt: '2026-03-01T10:00:00Z',
        },
      ],
    },
    isLoading: false,
  }),
}));

describe('Assessment DetailsPanel Integration across Admin, HeadCouncillor, and Teacher', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockToggleAvailability.mockResolvedValue({ ...sampleCatalog[0], isEnabled: false });
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/students/1001')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: '1001',
              studentNumber: 'STU2026001',
              name: '王小明',
              major: '软件工程',
              status: 'Active',
              riskLevel: 'MEDIUM',
              demographics: { school: '计算机学院' },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ metrics: {}, activityTitle: '近期动态', activities: [] }),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderWithAppProviders = (ui: React.ReactElement) =>
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SnackbarProvider>{ui}</SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

  it.each([
    { roleName: 'AdminPage', role: 'SYSTEM_ADMIN', Component: AdminPage },
    { roleName: 'HeadCouncillorPage', role: 'HEAD_COUNSELLOR', Component: HeadCouncillorPage },
    { roleName: 'TeacherPage', role: 'TEACHER', Component: TeacherPage },
  ])('$roleName opens DetailsPanel with scale details, questions, and footer actions on assessment click', async ({ role, Component }) => {
    mockUseAuth.mockReturnValue({
      session: { token: 'mock-token', user: { id: 1, name: 'Test User', role } },
      isAuthenticated: true,
    });

    renderWithAppProviders(<Component />);

    fireEvent.click(screen.getByText('测评量表'));

    await waitFor(() => {
      expect(screen.getByText('情绪状况评估 (PHQ-9)')).toBeDefined();
    });

    fireEvent.click(screen.getByText('情绪状况评估 (PHQ-9)'));

    await waitFor(() => {
      expect(screen.getByText('量表信息')).toBeDefined();
      expect(screen.getByText('量表说明')).toBeDefined();
      expect(screen.getByText('核心抑郁症状')).toBeDefined();
      expect(screen.getByText('指派测评')).toBeDefined();
      expect(screen.getByText('隐藏量表')).toBeDefined();
    });

    // Switch to 量表题目 tab inside DetailsPanel
    const mdTabs = document.querySelector('md-tabs');
    expect(mdTabs).not.toBeNull();
    if (mdTabs) {
      (mdTabs as HTMLElement & { activeTabIndex: number }).activeTabIndex = 1;
      fireEvent(mdTabs, new CustomEvent('change', { bubbles: true }));
    }

    await waitFor(() => {
      expect(screen.getByText('做事时提不起劲或没有兴趣')).toBeDefined();
    });

    // Obsolete fullscreen placeholder must not be present
    expect(screen.queryByText('量表题目明细与临床常模配置')).toBeNull();
  });

  it('keeps 指派历史 student DetailsPanel working in AdminPage and clears panel when switching sub-tabs', async () => {
    mockUseAuth.mockReturnValue({
      session: { token: 'mock-token', user: { id: 1, name: 'Admin', role: 'SYSTEM_ADMIN' } },
      isAuthenticated: true,
    });

    renderWithAppProviders(<AdminPage />);

    fireEvent.click(screen.getByText('测评量表'));
    await waitFor(() => {
      expect(screen.getByText('情绪状况评估 (PHQ-9)')).toBeDefined();
    });

    // Open scale panel
    fireEvent.click(screen.getByText('情绪状况评估 (PHQ-9)'));
    await waitFor(() => {
      expect(screen.getByText('量表信息')).toBeDefined();
    });

    // Switch to 指派历史 -> scale panel closes
    fireEvent.click(screen.getByText('指派历史'));
    await waitFor(() => {
      expect(screen.queryByText('量表信息')).toBeNull();
      expect(screen.getByText('王小明')).toBeDefined();
    });

    // Click student row -> StudentDetailsView opens
    fireEvent.click(screen.getByText('王小明'));
    await waitFor(() => {
      expect(screen.getByText('测评记录')).toBeDefined();
    });
  });
});
