import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferralsPage } from './ReferralsPage';
import { ReferralContext, ReferralContextValue } from '../contexts/ReferralContext';
import { ReferralDto } from '../api/intakeApi';
import { ReferralFilter } from '../utils/referralConstants';
import { ReferralDetailsTab } from '../utils/referralRouting';

// Mock ReferralDetailsFullScreen to isolate page testing
vi.mock('../components/referrals/ReferralDetailsFullScreen', () => ({
  ReferralDetailsFullScreen: ({
    referralId,
    initialTab,
    onClose,
  }: {
    referralId: string;
    initialTab?: string;
    onClose: () => void;
  }) => (
    <div data-testid="fullscreen-details">
      <span>Modal Open: {referralId}</span>
      <span data-testid="initial-tab">{initialTab}</span>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

describe('ReferralsPage', () => {
  const mockReferrals: ReferralDto[] = [
    {
      id: 'ref-101',
      studentId: 1,
      studentName: '张同学',
      studentNumber: '20230001',
      type: 'INITIAL',
      date: '2026-10-31T09:00:00',
      title: '急性焦虑发作',
      description: '入睡困难',
      riskLevel: 'HIGH',
      status: 'WAITING_FOR_SCHEDULING',
      referredBy: { name: '赵辅导员' },
      availableActions: [],
    },
    {
      id: 'ref-102',
      studentId: 1,
      studentName: '张同学',
      studentNumber: '20230001',
      type: 'FOLLOW_UP',
      date: '2026-10-25T14:00:00',
      title: '复诊结案归档',
      description: '治疗恢复良好',
      riskLevel: 'LOW',
      status: 'CLOSED',
      referredBy: { name: '钱医生' },
      availableActions: [],
    },
  ];

  const createMockContext = (overrides?: Partial<ReferralContextValue>): ReferralContextValue => {
    let currentFilter: ReferralFilter = overrides?.filter ?? 'all';
    let currentSelectedId: string | null = overrides?.selectedReferralId ?? null;
    let currentActiveTab: ReferralDetailsTab = overrides?.activeDetailsTab ?? 'overview';

    const ctx: ReferralContextValue = {
      referrals: mockReferrals,
      filteredReferrals: mockReferrals,
      filter: currentFilter,
      setFilter: vi.fn((f: ReferralFilter) => {
        ctx.filter = f;
      }),
      totalCount: 2,
      inProgressCount: 1,
      closedCount: 1,
      loading: false,
      error: null,
      isScrolled: false,
      setIsScrolled: vi.fn(),
      selectedReferralId: currentSelectedId,
      setSelectedReferralId: vi.fn((id: string | null) => {
        ctx.selectedReferralId = id;
      }),
      activeDetailsTab: currentActiveTab,
      setActiveDetailsTab: vi.fn((tab: ReferralDetailsTab) => {
        ctx.activeDetailsTab = tab;
      }),
      refreshReferrals: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    };
    return ctx;
  };

  const renderWithContext = (contextValue: ReferralContextValue) => {
    return render(
      <ReferralContext.Provider value={contextValue}>
        <ReferralsPage />
      </ReferralContext.Provider>
    );
  };

  it('renders loading spinner when loading is true', () => {
    const ctx = createMockContext({ loading: true });
    renderWithContext(ctx);

    const spinner = document.querySelector('md-circular-progress');
    expect(spinner).not.toBeNull();
  });

  it('renders error alert with retry button on failure', () => {
    const refreshSpy = vi.fn().mockResolvedValue(undefined);
    const ctx = createMockContext({
      error: '网络连接超时',
      refreshReferrals: refreshSpy,
    });
    renderWithContext(ctx);

    expect(screen.getByText('网络连接超时')).toBeDefined();
    const retryBtn = screen.getByText('重新加载');
    fireEvent.click(retryBtn);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it('renders segmented filter chips (全部, 进行中, 已结案)', () => {
    const ctx = createMockContext();
    renderWithContext(ctx);

    expect(screen.getByRole('radio', { name: /全部/ })).toBeDefined();
    expect(screen.getByRole('radio', { name: /进行中/ })).toBeDefined();
    expect(screen.getByRole('radio', { name: /已结案/ })).toBeDefined();
  });

  it('filters list correctly when toggling filter chips', () => {
    const setFilterSpy = vi.fn();
    const ctx = createMockContext({ setFilter: setFilterSpy });
    renderWithContext(ctx);

    const progressChip = screen.getByRole('radio', { name: /进行中/ });
    fireEvent.click(progressChip);
    expect(setFilterSpy).toHaveBeenCalledWith('in_progress');

    const closedChip = screen.getByRole('radio', { name: /已结案/ });
    fireEvent.click(closedChip);
    expect(setFilterSpy).toHaveBeenCalledWith('closed');
  });

  describe('empty states', () => {
    it('displays "暂无转诊记录" when filter is all and list is empty with material-symbols-outlined icon', () => {
      const ctx = createMockContext({
        referrals: [],
        filteredReferrals: [],
        filter: 'all',
      });
      const { container } = renderWithContext(ctx);
      expect(screen.getByText('暂无转诊记录')).toBeDefined();
      expect(container.querySelector('.material-symbols-outlined')).not.toBeNull();
      expect(container.querySelector('.material-symbols-rounded')).toBeNull();
    });

    it('displays "暂无进行中的转诊" when filter is in_progress and list is empty', () => {
      const ctx = createMockContext({
        filteredReferrals: [],
        filter: 'in_progress',
      });
      renderWithContext(ctx);
      const textEl = screen.getByText('暂无进行中的转诊');
      const emptyStateContainer = textEl.parentElement;
      expect(textEl).toBeDefined();
      expect(emptyStateContainer?.querySelector('.material-symbols-outlined')?.textContent?.trim()).toBe('medical_services');
      expect(emptyStateContainer?.querySelector('.material-symbols-rounded')).toBeNull();
    });

    it('displays "暂无已结案转诊" when filter is closed and list is empty', () => {
      const ctx = createMockContext({
        filteredReferrals: [],
        filter: 'closed',
      });
      renderWithContext(ctx);
      const textEl = screen.getByText('暂无已结案转诊');
      const emptyStateContainer = textEl.parentElement;
      expect(textEl).toBeDefined();
      expect(emptyStateContainer?.querySelector('.material-symbols-outlined')?.textContent?.trim()).toBe('inventory_2');
      expect(emptyStateContainer?.querySelector('.material-symbols-rounded')).toBeNull();
    });
  });

  it('tapping a card opens ReferralDetailsFullScreen', () => {
    const setSelectedIdSpy = vi.fn();
    const setActiveTabSpy = vi.fn();
    const ctx = createMockContext({
      setSelectedReferralId: setSelectedIdSpy,
      setActiveDetailsTab: setActiveTabSpy,
    });
    renderWithContext(ctx);

    fireEvent.click(screen.getByText('急性焦虑发作'));
    expect(setSelectedIdSpy).toHaveBeenCalledWith('ref-101');
    expect(setActiveTabSpy).toHaveBeenCalledWith('overview');
  });

  it('tapping status pill on card opens ReferralDetailsFullScreen directly to target tab', () => {
    const setSelectedIdSpy = vi.fn();
    const setActiveTabSpy = vi.fn();
    const ctx = createMockContext({
      setSelectedReferralId: setSelectedIdSpy,
      setActiveDetailsTab: setActiveTabSpy,
    });
    renderWithContext(ctx);

    // Click status pill on CLOSED card ('已结案')
    const statusBadges = screen.getAllByTitle('点击查看进度与详情');
    fireEvent.click(statusBadges[1]); // second card is CLOSED

    expect(setSelectedIdSpy).toHaveBeenCalledWith('ref-102');
    expect(setActiveTabSpy).toHaveBeenCalledWith('feedback');
  });
});
