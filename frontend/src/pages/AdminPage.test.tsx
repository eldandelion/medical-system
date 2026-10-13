import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminPage, AdminTabs } from './AdminPage';
import { StudentDetailsTabs } from '../components/students/StudentDetailsView';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SnackbarProvider } from '../contexts/SnackbarContext';
import * as catalogHooks from '../hooks/useAssessmentCatalogManagement';
import * as dispatchHooks from '../hooks/useAssessmentDispatchHistory';

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
  useNavigation: () => ({ lastEvent: null }),
}));

vi.mock('../hooks/useAdminProfileSummary', () => ({
  useAdminProfileSummary: () => ({ data: null, isLoading: false, isError: false, refetch: vi.fn() }),
}));

vi.mock('../hooks/useAdminDashboard', () => ({
  useAdminDashboard: () => ({ data: null, isLoading: false }),
}));

vi.mock('../hooks/useDashboardActivity', () => ({
  useDashboardActivity: () => ({ data: [] }),
}));

vi.mock('../hooks/useAssessmentCatalogManagement');
vi.mock('../hooks/useAssessmentDispatchHistory');

describe('AdminPage Assessment Dispatch Default Tab Integration', () => {
  let queryClient: QueryClient;

  const mockDispatchRecord = {
    id: 'disp-1',
    assignmentId: 101,
    studentId: 1001,
    studentNumber: 'STU2026001',
    studentName: '王小明',
    batteryCode: 'PHQ-9',
    status: 'COMPLETED',
    severity: 'MODERATE',
    assignedByName: '李医生',
    assignedAt: '2026-03-01T10:00:00Z',
  };

  const mockStudent = {
    id: '1001',
    studentNumber: 'STU2026001',
    name: '王小明',
    major: '软件工程',
    year: '大三',
    status: 'Active',
    riskLevel: 'MEDIUM',
    demographics: {
      age: 21,
      gender: 'MALE',
      school: '计算机学院',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockUseAuth.mockReturnValue({
      session: { role: 'admin', token: 'mock-admin-token' },
      isAuthenticated: true,
    });

    vi.spyOn(catalogHooks, 'useAssessmentCatalogManagement').mockReturnValue({
      catalog: [
        {
          batteryCode: 'PHQ_9',
          title: '抑郁症筛查量表 (PHQ-9)',
          subtitle: '情绪测评',
          description: '自评工具',
          duration: '5 分钟',
          questionCount: 9,
          sections: [],
          isEnabled: true,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      toggleAvailability: vi.fn(),
      isToggling: false,
    });

    vi.spyOn(dispatchHooks, 'useAssessmentDispatches').mockReturnValue({
      data: [{ id: 1, title: '2026春季全校心理普查', status: 'ACTIVE', assignedCount: 100, completedCount: 50 }],
      isLoading: false,
    } as any);

    vi.spyOn(dispatchHooks, 'useAssessmentDispatchHistory').mockReturnValue({
      data: {
        content: [mockDispatchRecord],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      },
      isLoading: false,
    } as any);

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/students/1001') || url.includes('/api/students/STU2026001')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudent),
        });
      }
      if (url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockStudent]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
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
            <AdminPage />
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('defaults to history tab (StudentDetailsTabs.HISTORY) when selecting a dispatch record in Assessment Catalog', async () => {
    renderAdminPage();

    // Navigate to Assessments view ("测评量表")
    const assessmentsNavItem = screen.getByText('测评量表');
    fireEvent.click(assessmentsNavItem);

    // Switch to "指派历史" tab within AssessmentCatalogManagementView
    const historySegmentTab = screen.getByText('指派历史');
    fireEvent.click(historySegmentTab);

    // Wait for the dispatch record to appear in the table
    await waitFor(() => {
      expect(screen.getByText('王小明')).toBeDefined();
    });

    // Click the dispatch record row
    const rowElement = screen.getByText('王小明');
    fireEvent.click(rowElement);

    // Verify DetailsPanel opens with StudentDetailsView activeTab defaulting to HISTORY ("档案记录")
    // In HISTORY tab, overview sections ("基本特征") are NOT rendered, and history tab content is rendered
    await waitFor(() => {
      expect(screen.queryByText('基本特征')).toBeNull();
      expect(screen.getByText('档案记录')).toBeDefined();
      expect(
        screen.queryByText('正在加载历史记录...') || screen.queryByText('暂无档案记录。')
      ).toBeDefined();
    });
  });

  it('defaults to overview tab (StudentDetailsTabs.OVERVIEW) when selecting a student in Student Directory', async () => {
    renderAdminPage();

    // Navigate to Students directory ("全校学生")
    const studentsNavItem = screen.getByText('全校学生');
    fireEvent.click(studentsNavItem);

    // Wait for the student row in StudentsView table
    await waitFor(() => {
      expect(screen.getByText('王小明')).toBeDefined();
    });

    // Click on the student row
    const studentRow = screen.getByText('王小明');
    fireEvent.click(studentRow);

    // Verify DetailsPanel opens with overview tab active ("基本特征", "学籍信息")
    await waitFor(() => {
      expect(screen.getByText('基本特征')).toBeDefined();
      expect(screen.getByText('学籍信息')).toBeDefined();
    });
  });

  it('resets selectedItem and default tab when switching navigation pages', async () => {
    renderAdminPage();

    // 1. Navigate to Assessments and click dispatch record (sets tab to HISTORY)
    const assessmentsNavItem = screen.getByText('测评量表');
    fireEvent.click(assessmentsNavItem);
    const historySegmentTab = screen.getByText('指派历史');
    fireEvent.click(historySegmentTab);

    await waitFor(() => {
      expect(screen.getByText('王小明')).toBeDefined();
    });
    fireEvent.click(screen.getByText('王小明'));

    // 2. Switch page to "全校学生" via left nav
    const studentsNavItem = screen.getByText('全校学生');
    fireEvent.click(studentsNavItem);

    // DetailsPanel should be closed (selectedItem is null)
    expect(screen.queryByText('STU2026001')).toBeNull();

    // 3. Click student in student directory
    await waitFor(() => {
      expect(screen.getByText('王小明')).toBeDefined();
    });
    fireEvent.click(screen.getByText('王小明'));

    // It should open on OVERVIEW, not the previously selected HISTORY tab
    await waitFor(() => {
      expect(screen.getByText('基本特征')).toBeDefined();
    });
  });
});
