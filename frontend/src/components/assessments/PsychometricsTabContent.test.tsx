import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PsychometricsTabContent } from './PsychometricsTabContent';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'doctor', token: 'mock_doctor_token' },
  }),
}));

describe('PsychometricsTabContent', () => {
  let queryClient: QueryClient;
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('hides SCID diagnosis UI and never calls /health-profile while rendering risk flags and test scores', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scidDiagnosis: '重度抑郁症，伴随焦虑症状',
        riskFlags: [{ label: 'selfHarm', value: true }],
        scores: [],
        radarData: [],
        tests: [{ name: 'PHQ-9', value: 16, max: 27, level: '中重度' }],
      }),
    });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <PsychometricsTabContent student={{ id: '1', name: '张伟', studentNumber: '2021001' }} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('临床实际情况')).toBeDefined();
      expect(screen.getByText('严重风险标记')).toBeDefined();
      expect(screen.getByText('阳性 (+)')).toBeDefined();
      expect(screen.getByText('PHQ-9')).toBeDefined();
    });

    // SCID UI must stay hidden
    expect(screen.queryByText('SCID诊断')).toBeNull();
    expect(screen.queryByText('重度抑郁症，伴随焦虑症状')).toBeNull();
    expect(screen.queryByText('保存诊断')).toBeNull();
    expect(container.querySelectorAll('textarea')).toHaveLength(0);

    // Only the GET psychometrics request should be issued (no PUT /health-profile)
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/students/1/psychometrics');
  });

  it('does not render 临床实际情况 section when only scidDiagnosis is present without riskFlags', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scidDiagnosis: '广泛性焦虑障碍',
        riskFlags: [],
        scores: [],
        radarData: [],
        tests: [],
      }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PsychometricsTabContent student={{ id: '2', name: '李华', studentNumber: '2021002' }} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('暂无量表数据')).toBeDefined();
    });

    expect(screen.queryByText('临床实际情况')).toBeNull();
    expect(screen.queryByText('SCID诊断')).toBeNull();
    expect(screen.queryByText('广泛性焦虑障碍')).toBeNull();
  });
});
