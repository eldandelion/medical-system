import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeacherPage } from './TeacherPage';
import { AuthProvider } from '../contexts/AuthContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { CreationOverlayProvider } from '../contexts/CreationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SnackbarProvider } from '../contexts/SnackbarContext';

afterEach(() => {
  cleanup();
});

describe('TeacherPage High Risk Roster Removal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/dashboard/activity')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            activities: [
              {
                id: 'act-1',
                type: 'HIGH_RISK_ASSESSMENT_SUBMITTED',
                referenceId: 102,
                referenceName: '学生 李华 触发高危预警',
                timestamp: '2026-10-25T10:00:00Z',
              },
            ],
          }),
        });
      }
      if (url.includes('/api/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            metrics: { studentsCount: 5, notificationsCount: 1, referralsCount: 0 },
          }),
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
        json: () => Promise.resolve([]),
      });
    });
  });

  const renderComponent = () => {
    return render(
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
  };

  it('does NOT render 高危名单 in navigation sidebar', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('控制面板').length).toBeGreaterThan(0);
    });

    expect(screen.queryByText('高危名单')).toBeNull();
  });

  it('routes high-risk assessment activity click to 学生管理 instead of removed roster', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('学生 李华 触发高危预警')).toBeDefined();
    });

    const activityItem = screen.getByText('学生 李华 触发高危预警');
    fireEvent.click(activityItem);

    await waitFor(() => {
      expect(screen.getAllByText('学生管理').length).toBeGreaterThan(1);
    });
  });
});
