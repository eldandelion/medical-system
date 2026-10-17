import React from 'react';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReferralDetailsView } from './ReferralDetailsView';
import { DetailsContext, DetailsHeaderOverride } from '../../contexts/DetailsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Referral, ReferralDetails } from '../../types';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { token: 'mock-token' }
  })
}));

vi.mock('../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSnackbar: vi.fn()
  })
}));

vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: vi.fn(),
    closeCreation: vi.fn()
  })
}));

describe('ReferralDetailsView Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 }
      }
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const mockReferral: Referral = {
    id: 'ref-101',
    studentName: '李华',
    studentNumber: 'STU2026001',
    type: 'INITIAL',
    date: '2026-08-14 10:00:00',
    title: '心理辅导转诊',
    description: '学生近期持续失眠',
    riskLevel: 'HIGH',
    status: 'AWAITING_TRIAGE',
    referredBy: { name: '张辅导员' }
  };

  const mockDetails: ReferralDetails = {
    baseInfo: mockReferral,
    studentDemographics: {
      age: 20,
      gender: '男',
      studentId: 'STU2026001',
      school: '计算机科学与技术学院',
      grade: '大二',
      phone: '13800000000'
    },
    triageInfo: {
      isFirstVisit: true,
      isMedicated: false,
      priorTherapy: '无',
      scidDiagnosis: '重度抑郁发作',
      fullDescription: '描述'
    },
    riskAssessment: {
      ideation: true,
      attempt: false,
      selfHarm: false
    }
  };

  it('registers headerOverride with avatar, name, student number, and compound status+risk badge during loading state', () => {
    const setHeaderOverrideMock = vi.fn();
    // Simulate pending query by not resolving immediately
    vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <DetailsContext.Provider value={{ isFullScreen: false, setHeaderOverride: setHeaderOverrideMock }}>
          <ReferralDetailsView referral={mockReferral} />
        </DetailsContext.Provider>
      </QueryClientProvider>
    );

    expect(setHeaderOverrideMock).toHaveBeenCalled();
    const lastCall = setHeaderOverrideMock.mock.calls[0][0] as DetailsHeaderOverride;
    expect(lastCall).toBeDefined();
    expect(lastCall.title).toBe('李华');
    expect(lastCall.subtitle).toBe('STU2026001');
    expect(lastCall.avatar).toBeDefined();
    expect(lastCall.badge).toBeDefined();

    const { getByRole, getByText } = render(lastCall.badge);
    const statusBtn = getByRole('button', { name: /点击查看转诊进度/ });
    expect(statusBtn).toBeDefined();
    expect(statusBtn.textContent).toBe('待分配');
    expect(getByText('高')).toBeDefined();

    // Verify the legacy inner header is NOT present in loading state
    expect(screen.queryByText('计算机科学与技术学院')).toBeNull();
  });

  it('registers headerOverride when data is loaded and cleans up on unmount', async () => {
    const setHeaderOverrideMock = vi.fn();
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockDetails
    } as Response);

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <DetailsContext.Provider value={{ isFullScreen: false, setHeaderOverride: setHeaderOverrideMock }}>
          <ReferralDetailsView referral={mockReferral} />
        </DetailsContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('分诊基本信息')).toBeDefined();
    });

    // Check headerOverride registration
    const lastCall = setHeaderOverrideMock.mock.calls[setHeaderOverrideMock.mock.calls.length - 1][0] as DetailsHeaderOverride;
    expect(lastCall).toBeDefined();
    expect(lastCall.title).toBe('李华');
    expect(lastCall.subtitle).toBe('STU2026001');
    expect(lastCall.badge).toBeDefined();

    const { getByRole, getByText } = render(lastCall.badge);
    const statusBtn = getByRole('button', { name: /点击查看转诊进度/ });
    expect(statusBtn).toBeDefined();
    expect(statusBtn.textContent).toBe('待分配');
    expect(getByText('高')).toBeDefined();

    // Inner header should NOT have college rendered as part of header
    // (college was removed from the header per specification)
    const collegeHeaderElements = screen.queryAllByRole('heading', { level: 1 });
    expect(collegeHeaderElements.length).toBe(0);

    // Unmount and verify cleanup
    unmount();
    expect(setHeaderOverrideMock).toHaveBeenLastCalledWith(null);
  });

  it('navigates to tracker tab when header status badge is clicked', async () => {
    const setHeaderOverrideMock = vi.fn();
    const onTabChangeMock = vi.fn();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockDetails
    } as Response);

    render(
      <QueryClientProvider client={queryClient}>
        <DetailsContext.Provider value={{ isFullScreen: false, setHeaderOverride: setHeaderOverrideMock }}>
          <ReferralDetailsView referral={mockReferral} onTabChange={onTabChangeMock} />
        </DetailsContext.Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('分诊基本信息')).toBeDefined();
    });

    const lastCall = setHeaderOverrideMock.mock.calls[setHeaderOverrideMock.mock.calls.length - 1][0] as DetailsHeaderOverride;
    const { getByRole } = render(lastCall.badge);
    const statusBtn = getByRole('button', { name: /点击查看转诊进度/ });
    
    fireEvent.click(statusBtn);

    expect(onTabChangeMock).toHaveBeenCalledWith('tracker');
    await waitFor(() => {
      // In tracker tab, ReferralTrackerTab is rendered (showing timeline / steps)
      expect(screen.queryByText('分诊基本信息')).toBeNull();
    });
  });
});
