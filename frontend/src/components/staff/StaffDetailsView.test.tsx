import React from 'react';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffDetailsView, STAFF_DETAILS_TABS, StaffDetailsTabs } from './StaffDetailsView';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { CreationOverlayProvider } from '../../contexts/CreationContext';
import { DetailsContext, DetailsHeaderOverride, DetailsTabItem } from '../../contexts/DetailsContext';
import { DetailsPanel } from '../common/DetailsPanel';
import * as teachersApi from '../../api/teachers';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'head-councillor', token: 'mock_head_councillor_token_wang' },
  }),
}));

vi.mock('../../api/teachers', () => ({
  fetchTeacherDetails: vi.fn(),
  unassignStudentFromTeacher: vi.fn(),
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

describe('StaffDetailsView', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.mocked(teachersApi.fetchTeacherDetails).mockResolvedValue({
      ...mockTeacher,
      assignedStudents: [
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
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderWithProviders = (
    ui: React.ReactElement,
    detailsOverrides?: {
      setHeaderOverride?: (header: DetailsHeaderOverride | null) => void;
      setTabsOverride?: (tabs: DetailsTabItem[] | null) => void;
    }
  ) => {
    const content = (
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <CreationOverlayProvider>
            {ui}
          </CreationOverlayProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    );

    if (detailsOverrides) {
      return render(
        <DetailsContext.Provider
          value={{
            isFullScreen: false,
            titleOverride: null,
            setTitleOverride: vi.fn(),
            tabsOverride: null,
            setTabsOverride: detailsOverrides.setTabsOverride ?? vi.fn(),
            headerOverride: null,
            setHeaderOverride: detailsOverrides.setHeaderOverride ?? vi.fn(),
          }}
        >
          {content}
        </DetailsContext.Provider>
      );
    }

    return render(content);
  };

  it('registers headerOverride and tabsOverride on mount and cleans up on unmount', async () => {
    const setHeaderOverrideMock = vi.fn();
    const setTabsOverrideMock = vi.fn();
    const { unmount } = renderWithProviders(<StaffDetailsView staff={mockTeacher} />, {
      setHeaderOverride: setHeaderOverrideMock,
      setTabsOverride: setTabsOverrideMock,
    });

    expect(setTabsOverrideMock).toHaveBeenCalledWith(STAFF_DETAILS_TABS);
    expect(setHeaderOverrideMock).toHaveBeenCalled();
    const lastCall = setHeaderOverrideMock.mock.calls[setHeaderOverrideMock.mock.calls.length - 1][0] as DetailsHeaderOverride;
    expect(lastCall).toBeDefined();
    expect(lastCall.title).toBe('艾米丽·沃森');
    expect(lastCall.subtitle).toBe('EMP-00001 • 医学院');

    const avatarRender = render(lastCall.avatar);
    expect(avatarRender.getByText('艾')).toBeDefined();

    const badgeRender = render(lastCall.badge);
    expect(badgeRender.getByText('已启用')).toBeDefined();

    unmount();
    expect(setHeaderOverrideMock).toHaveBeenLastCalledWith(null);
    expect(setTabsOverrideMock).toHaveBeenLastCalledWith(null);
  });

  it('splits profile info and assigned students into two tabs and places 分配学生 in ActionFooter', async () => {
    const { container } = renderWithProviders(
      <DetailsPanel isOpen={true} onClose={vi.fn()} title="教师详情" icon="person">
        <StaffDetailsView staff={mockTeacher} />
      </DetailsPanel>
    );

    // Overview tab is active by default: profile info visible, student list hidden
    await waitFor(() => {
      expect(screen.getByText('艾米丽·沃森')).toBeDefined();
      expect(screen.getByText('EMP-00001 • 医学院')).toBeDefined();
      expect(screen.getByText('已启用')).toBeDefined();
      expect(screen.getByText('基本资料')).toBeDefined();
      expect(screen.getByText('负责学生')).toBeDefined();
      expect(screen.getByText('EMP-00001')).toBeDefined();
      expect(screen.getByText('医学院')).toBeDefined();
      expect(screen.getByText('13800138002')).toBeDefined();
      expect(screen.getByText('emily@univ.edu.cn')).toBeDefined();
    });

    // Copy buttons for personal contact/ID fields (and absent for collegeName)
    expect(screen.getByRole('button', { name: '复制教工号' })).toBeDefined();
    expect(screen.getByRole('button', { name: '复制联系电话' })).toBeDefined();
    expect(screen.getByRole('button', { name: '复制电子邮箱' })).toBeDefined();
    expect(screen.queryByRole('button', { name: '复制所属学院' })).toBeNull();

    expect(screen.queryByText('张伟')).toBeNull();

    // 分配学生 lives in ActionFooter
    const footer = container.querySelector('.action-footer-anchor');
    expect(footer).not.toBeNull();
    expect(footer?.textContent).toContain('分配学生');

    // Second inner header must be removed
    expect(screen.queryByText('专任教师 / 导师')).toBeNull();
    expect(container.querySelectorAll('.w-16.h-16')).toHaveLength(0);

    // Switch to 负责学生 tab
    const mdTabs = container.querySelector('md-tabs') as (HTMLElement & { activeTabIndex: number }) | null;
    expect(mdTabs).not.toBeNull();
    mdTabs!.activeTabIndex = 1;
    fireEvent(mdTabs!, new Event('change', { bubbles: true }));

    await waitFor(() => {
      expect(screen.getByText('负责学生 (1)')).toBeDefined();
      expect(screen.getByText('张伟')).toBeDefined();
    });

    // Only the footer 分配学生 button should be present (no duplicate inline button)
    expect(screen.getAllByText('分配学生')).toHaveLength(1);

    // GroupedInfoList-style student row formatting without risk markers
    const studentRow = screen.getByRole('listitem');
    expect(studentRow.className).toContain('rounded-[20px]');
    expect(studentRow.className).toContain('bg-[var(--md-sys-color-surface-container-low)]');
    expect(screen.queryByText(/风险/)).toBeNull();

    // Legacy fake mock tabs and no-op footer buttons must not exist
    expect(screen.queryByText('操作日志')).toBeNull();
    expect(screen.queryByText('权限范围')).toBeNull();
    expect(screen.queryByText('暂停访问')).toBeNull();
    expect(screen.queryByText('重置登录凭据')).toBeNull();
  });

  it('disables footer 分配学生 button when teacher is not ACTIVE and supports controlled students tab', async () => {
    vi.mocked(teachersApi.fetchTeacherDetails).mockResolvedValueOnce({
      ...mockTeacher,
      status: 'PENDING_APPROVAL',
      assignedStudents: [
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
      ],
    });
    const onTabChange = vi.fn();
    renderWithProviders(
      <DetailsPanel isOpen={true} onClose={vi.fn()} title="教师详情" icon="person">
        <StaffDetailsView
          staff={{ ...mockTeacher, status: 'PENDING_APPROVAL' }}
          activeTab={StaffDetailsTabs.STUDENTS}
          onTabChange={onTabChange}
        />
      </DetailsPanel>
    );

    await waitFor(() => {
      expect(screen.getByText('仅已启用状态的教师可分配学生')).toBeDefined();
      expect(screen.getByText('张伟')).toBeDefined();
    });

    const assignBtn = screen.getByText('分配学生').closest('md-outlined-button');
    expect(assignBtn?.hasAttribute('disabled')).toBe(true);
  });
});
