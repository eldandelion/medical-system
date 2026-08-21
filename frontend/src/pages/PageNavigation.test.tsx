import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeacherPage } from './TeacherPage';
import { HeadCouncillorPage } from './HeadCouncillorPage';
import { AuthProvider } from '../contexts/AuthContext';
import { CreationOverlayProvider } from '../contexts/CreationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SnackbarProvider } from '../contexts/SnackbarContext';

afterEach(() => {
  cleanup();
});

describe('Page Navigation with 测评量表', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
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
});
