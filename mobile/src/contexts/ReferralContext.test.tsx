import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ReferralProvider, useReferrals } from './ReferralContext';
import { AuthContext } from './AuthContext';
import { intakeApi, ReferralDto } from '../api/intakeApi';

describe('ReferralContext', () => {
  const mockReferralList: ReferralDto[] = [
    {
      id: 'ref-1',
      studentId: 1,
      studentName: '王同学',
      studentNumber: '20230001',
      type: 'INITIAL',
      date: '2026-10-31T09:00:00',
      title: '急性焦虑待分配',
      description: '描述 1',
      riskLevel: 'HIGH',
      status: 'AWAITING_TRIAGE',
      referredBy: { name: '李老师' },
      availableActions: [],
    },
    {
      id: 'ref-2',
      studentId: 1,
      studentName: '王同学',
      studentNumber: '20230001',
      type: 'FOLLOW_UP',
      date: '2026-10-30T10:00:00',
      title: '咨询草案不应显示',
      description: '草案',
      riskLevel: 'LOW',
      status: 'DRAFT',
      referredBy: { name: '李老师' },
      availableActions: [],
    },
    {
      id: 'ref-3',
      studentId: 1,
      studentName: '王同学',
      studentNumber: '20230001',
      type: 'INITIAL',
      date: '2026-10-29T14:00:00',
      title: '已完结转诊',
      description: '已结案反馈',
      riskLevel: 'MEDIUM',
      status: 'CLOSED',
      referredBy: { name: '赵辅导员' },
      availableActions: [],
    },
    {
      id: 'ref-4',
      studentId: 1,
      studentName: '王同学',
      studentNumber: '20230001',
      type: 'EMERGENCY',
      date: '2026-10-28T08:00:00',
      title: '已撤回转诊不应显示',
      description: '已撤回',
      riskLevel: 'HIGH',
      status: 'RECALLED',
      referredBy: { name: '李老师' },
      availableActions: [],
    },
    {
      id: 'ref-5',
      studentId: 1,
      studentName: '王同学',
      studentNumber: '20230001',
      type: 'INITIAL',
      date: '2026-10-27T11:00:00',
      title: '被拒绝转诊归入已结案',
      description: '不予受理',
      riskLevel: 'LOW',
      status: 'REJECTED',
      referredBy: { name: '孙老师' },
      availableActions: [],
    },
    {
      id: 'ref-6',
      studentId: 1,
      studentName: '王同学',
      studentNumber: '20230001',
      type: 'INITIAL',
      date: '2026-10-26T16:00:00',
      title: '待就诊进行中',
      description: '排期完成',
      riskLevel: 'HIGH',
      status: 'WAITING_FOR_APPOINTMENT',
      referredBy: { name: '周老师' },
      availableActions: [],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const TestConsumer: React.FC = () => {
    const {
      referrals,
      filteredReferrals,
      filter,
      setFilter,
      totalCount,
      inProgressCount,
      closedCount,
      isScrolled,
      setIsScrolled,
      refreshReferrals,
      loading,
      error,
    } = useReferrals();

    return (
      <div>
        <div data-testid="loading">{loading ? 'loading' : 'idle'}</div>
        <div data-testid="error">{error ?? 'none'}</div>
        <div data-testid="total-count">{totalCount}</div>
        <div data-testid="in-progress-count">{inProgressCount}</div>
        <div data-testid="closed-count">{closedCount}</div>
        <div data-testid="filtered-count">{filteredReferrals.length}</div>
        <div data-testid="is-scrolled">{isScrolled ? 'true' : 'false'}</div>
        <div data-testid="current-filter">{filter}</div>
        <ul>
          {referrals.map((r) => (
            <li key={r.id} data-testid={`referral-${r.id}`}>
              {r.title} - {r.status}
            </li>
          ))}
        </ul>
        <button onClick={() => setFilter('in_progress')} data-testid="btn-filter-progress">
          Progress
        </button>
        <button onClick={() => setFilter('closed')} data-testid="btn-filter-closed">
          Closed
        </button>
        <button onClick={() => setIsScrolled(true)} data-testid="btn-scroll">
          Scroll
        </button>
        <button onClick={() => refreshReferrals()} data-testid="btn-refresh">
          Refresh
        </button>
      </div>
    );
  };

  it('defensively filters out DRAFT and RECALLED referrals from state', async () => {
    vi.spyOn(intakeApi, 'getReferrals').mockResolvedValueOnce(mockReferralList);

    render(
      <ReferralProvider>
        <TestConsumer />
      </ReferralProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('idle');
    });

    expect(screen.queryByTestId('referral-ref-2')).toBeNull(); // DRAFT
    expect(screen.queryByTestId('referral-ref-4')).toBeNull(); // RECALLED
    expect(screen.getByTestId('referral-ref-1')).toBeDefined();
    expect(screen.getByTestId('referral-ref-3')).toBeDefined();
    expect(screen.getByTestId('referral-ref-5')).toBeDefined();
    expect(screen.getByTestId('referral-ref-6')).toBeDefined();
    expect(screen.getByTestId('total-count').textContent).toBe('4');
  });

  it('computes totalCount, inProgressCount, and closedCount correctly', async () => {
    vi.spyOn(intakeApi, 'getReferrals').mockResolvedValueOnce(mockReferralList);

    render(
      <ReferralProvider>
        <TestConsumer />
      </ReferralProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('idle');
    });

    // 4 visible items:
    // ref-1 (AWAITING_TRIAGE) -> in_progress
    // ref-3 (CLOSED) -> closed
    // ref-5 (REJECTED) -> closed
    // ref-6 (WAITING_FOR_APPOINTMENT) -> in_progress
    expect(screen.getByTestId('total-count').textContent).toBe('4');
    expect(screen.getByTestId('in-progress-count').textContent).toBe('2');
    expect(screen.getByTestId('closed-count').textContent).toBe('2');
  });

  it('updates filter state between all, in_progress, and closed', async () => {
    vi.spyOn(intakeApi, 'getReferrals').mockResolvedValueOnce(mockReferralList);

    render(
      <ReferralProvider>
        <TestConsumer />
      </ReferralProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('idle');
    });

    expect(screen.getByTestId('filtered-count').textContent).toBe('4');

    act(() => {
      screen.getByTestId('btn-filter-progress').click();
    });
    expect(screen.getByTestId('current-filter').textContent).toBe('in_progress');
    expect(screen.getByTestId('filtered-count').textContent).toBe('2');

    act(() => {
      screen.getByTestId('btn-filter-closed').click();
    });
    expect(screen.getByTestId('current-filter').textContent).toBe('closed');
    expect(screen.getByTestId('filtered-count').textContent).toBe('2');
  });

  it('tracks isScrolled state for dynamic header synchronization', async () => {
    vi.spyOn(intakeApi, 'getReferrals').mockResolvedValueOnce([]);

    render(
      <ReferralProvider>
        <TestConsumer />
      </ReferralProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('idle');
    });

    expect(screen.getByTestId('is-scrolled').textContent).toBe('false');

    act(() => {
      screen.getByTestId('btn-scroll').click();
    });
    expect(screen.getByTestId('is-scrolled').textContent).toBe('true');
  });

  it('refreshReferrals re-fetches from intakeApi and resets error', async () => {
    const getSpy = vi
      .spyOn(intakeApi, 'getReferrals')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockReferralList);

    render(
      <ReferralProvider>
        <TestConsumer />
      </ReferralProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Network error');
    });

    act(() => {
      screen.getByTestId('btn-refresh').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('none');
      expect(screen.getByTestId('total-count').textContent).toBe('4');
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('does not dispatch getReferrals when unauthenticated and reactively fetches upon login', async () => {
    const getSpy = vi.spyOn(intakeApi, 'getReferrals').mockResolvedValue(mockReferralList);

    const authMock: any = {
      student: null,
      token: null,
      loading: false,
      login: vi.fn(),
      loginWithSms: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshStudent: vi.fn(),
    };

    const { rerender } = render(
      <AuthContext.Provider value={authMock}>
        <ReferralProvider>
          <TestConsumer />
        </ReferralProvider>
      </AuthContext.Provider>
    );

    // When unauthenticated, no network calls should be made
    expect(getSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('total-count').textContent).toBe('0');
    expect(screen.getByTestId('error').textContent).toBe('none');

    // Simulate login: student is populated
    rerender(
      <AuthContext.Provider
        value={{
          ...authMock,
          student: {
            studentNumber: '20230001',
            fullName: '王同学',
            phone: '13800138000',
            registeredAt: '2026-09-01T00:00:00',
          },
        }}
      >
        <ReferralProvider>
          <TestConsumer />
        </ReferralProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('total-count').textContent).toBe('4');
    });

    // Simulate logout: student becomes null
    rerender(
      <AuthContext.Provider value={{ ...authMock, student: null }}>
        <ReferralProvider>
          <TestConsumer />
        </ReferralProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('total-count').textContent).toBe('0');
    });
  });
});
