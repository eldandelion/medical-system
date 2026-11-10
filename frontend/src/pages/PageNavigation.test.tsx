import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeacherPage } from './TeacherPage';
import { HeadCouncillorPage } from './HeadCouncillorPage';
import { AuthProvider } from '../contexts/AuthContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { CreationOverlayProvider } from '../contexts/CreationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SnackbarProvider } from '../contexts/SnackbarContext';
import { queryClient as globalQueryClient } from '../utils/queryClient';

afterEach(() => {
  cleanup();
  globalQueryClient.clear();
});

describe('Page Navigation with 测评量表', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    globalQueryClient.setDefaultOptions({
      queries: { retry: false },
    });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            metrics: { studentsCount: 10, notificationsCount: 0, referralsCount: 0 },
            activities: [],
            activityTitle: '最近活动',
          }),
        });
      }
      if (url.includes('/api/assessments/catalog')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              batteryCode: 'PHQ-9',
              title: '抑郁症筛查量表 (PHQ-9)',
              subtitle: '情绪与抑郁测评',
              questionCount: 9,
              isEnabled: true,
            },
          ]),
        });
      }
      if (url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/notifications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('renders 测评量表 tab in TeacherPage and navigates to it', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SnackbarProvider>
            <AuthProvider>
              <CreationOverlayProvider>
                <TeacherPage />
              </CreationOverlayProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const catalogNavItem = screen.getByText('测评量表');
    expect(catalogNavItem).toBeDefined();

    fireEvent.click(catalogNavItem);

    // Verify CanvasHeader or Assessment Catalog component renders
    await waitFor(() => {
      expect(screen.getByText('量表列表')).toBeDefined();
    });
  });

  it('renders 测评量表 tab in HeadCouncillorPage and navigates to it', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SnackbarProvider>
            <AuthProvider>
              <CreationOverlayProvider>
                <HeadCouncillorPage />
              </CreationOverlayProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const catalogNavItem = screen.getByText('测评量表');
    expect(catalogNavItem).toBeDefined();

    fireEvent.click(catalogNavItem);

    // Verify CanvasHeader or Assessment Catalog component renders
    await waitFor(() => {
      expect(screen.getByText('量表列表')).toBeDefined();
    });
  });

  it('deep-links from HeadCouncillorPage system notification activity to Referral Management and opens specific referral details', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            activities: [
              {
                id: 'notif-sys-77',
                type: 'SYSTEM_NOTIFICATION',
                timestamp: '2026-11-10T10:00:00Z',
                referenceId: 77,
                messageCode: 'REFERRAL_REQUIRES_REVIEW_HC',
                payload: { studentName: '陈思宇', initiatorName: '李老师' },
                actionTargetId: 4,
                actionType: 'REVIEW_REFERRAL',
              },
            ],
          }),
        });
      }
      if (url.includes('/api/dashboard/head-councillor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            metrics: { studentsCount: 10, referralsCount: 2 },
          }),
        });
      }
      if (url.includes('/api/referrals/4')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            baseInfo: {
              id: '4',
              studentId: '4',
              studentName: '陈思宇',
              studentNumber: '2022004',
              type: 'CRISIS_INTERVENTION',
              date: '2026-04-18T00:00:00Z',
              title: '宿舍事故报告',
              description: '深夜危机干预报告详情',
              riskLevel: 'HIGH',
              status: 'AWAITING_TRIAGE',
              referredBy: { name: '李老师' },
            },
            steps: [],
          }),
        });
      }
      if (url.includes('/api/referrals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/notifications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SnackbarProvider>
            <AuthProvider>
              <NavigationProvider>
                <CreationOverlayProvider>
                  <HeadCouncillorPage />
                </CreationOverlayProvider>
              </NavigationProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const activityRow = await waitFor(() =>
      screen.getByText(/由 李老师 为 陈思宇 发起的转诊申请需要您审核/)
    );
    fireEvent.click(activityRow);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/referrals/4'),
        expect.anything()
      );
      expect(screen.getByText('2022004')).toBeDefined();
    });
  });

  it('deep-links from TeacherPage high-risk assessment activity to Students and opens specific student details', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            activities: [
              {
                id: 'notif-58',
                type: 'HIGH_RISK_ASSESSMENT_SUBMITTED',
                timestamp: '2026-11-10T10:00:00Z',
                referenceId: 58,
                messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER',
                payload: { studentName: '张伟', crisisFlags: '自杀倾向' },
                actionTargetId: 1,
                actionType: 'VIEW_STUDENT',
              },
            ],
          }),
        });
      }
      if (url.includes('/api/dashboard/teacher')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            metrics: { studentsCount: 42, notificationsCount: 1 },
          }),
        });
      }
      if (url.includes('/api/students/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: '1',
            studentNumber: '2022001',
            name: '张伟',
            major: '计算机科学',
            riskLevel: 'HIGH',
            status: 'Active',
          }),
        });
      }
      if (url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/notifications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SnackbarProvider>
            <AuthProvider>
              <NavigationProvider>
                <CreationOverlayProvider>
                  <TeacherPage />
                </CreationOverlayProvider>
              </NavigationProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const activityRow = await waitFor(() =>
      screen.getByText(/学生 张伟 的心理测评结果触发高危预警/)
    );
    fireEvent.click(activityRow);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/students/1'),
        expect.anything()
      );
      expect(screen.getAllByText('学生详情').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2022001').length).toBeGreaterThan(0);
    });
  });

  it('displays snackbar fallback message when entity detail fetch fails on activity click', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            activities: [
              {
                id: 'notif-sys-99',
                type: 'SYSTEM_NOTIFICATION',
                timestamp: '2026-11-10T10:00:00Z',
                referenceId: 99,
                messageCode: 'REFERRAL_REQUIRES_REVIEW_HC',
                payload: { studentName: '失败测试学生', initiatorName: '李老师' },
                actionTargetId: 999,
                actionType: 'REVIEW_REFERRAL',
              },
            ],
          }),
        });
      }
      if (url.includes('/api/dashboard/head-councillor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            metrics: { studentsCount: 10, referralsCount: 2 },
          }),
        });
      }
      if (url.includes('/api/referrals/999')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Not found' }),
        });
      }
      if (url.includes('/api/referrals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/notifications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SnackbarProvider>
            <AuthProvider>
              <NavigationProvider>
                <CreationOverlayProvider>
                  <HeadCouncillorPage />
                </CreationOverlayProvider>
              </NavigationProvider>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );

    const activityRow = await waitFor(() =>
      screen.getByText(/由 李老师 为 失败测试学生 发起的转诊申请需要您审核/)
    );
    fireEvent.click(activityRow);

    await waitFor(() => {
      expect(screen.getByText('无法加载数据详情，请重试')).toBeDefined();
    });
  });
});
