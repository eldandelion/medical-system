import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeacherPage } from './TeacherPage';
import * as NavigationContext from '../contexts/NavigationContext';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ session: { token: 'mock-token', role: 'teacher' } }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));
vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
  ThemeProvider: ({ children }: any) => <>{children}</>,
}));
vi.mock('../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: vi.fn() }),
  SnackbarProvider: ({ children }: any) => <>{children}</>,
}));
vi.mock('../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({ openCreation: vi.fn(), closeCreation: vi.fn(), expandToFullscreen: vi.fn() }),
  CreationOverlayProvider: ({ children }: any) => <>{children}</>,
}));

describe('GlobalSearch Auto-Selection Navigation', () => {
  let queryClient: QueryClient;
  const originalFetch = globalThis.fetch;

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
            metrics: {},
            activities: [],
          }),
        });
      }
      if (url.includes('/api/students/123')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 123,
            name: 'Test Student Auto',
            studentNumber: 'STU001',
            riskLevel: 'LOW'
          }),
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
    queryClient.clear();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('fetches entity and opens details panel when entityId is present in lastEvent', async () => {
    // Mock the useNavigation hook to simulate a search selection
    vi.spyOn(NavigationContext, 'useNavigation').mockReturnValue({
      lastEvent: { tab: 'Students', entityId: 123, timestamp: Date.now() },
      navigateToTab: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TeacherPage />
      </QueryClientProvider>
    );

    // Verify fetch was called with the specific endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/students/123'),
        expect.any(Object)
      );
    });

    // The details panel should render the student name
    await waitFor(() => {
      expect(screen.getByText('Test Student Auto')).toBeDefined();
    });
  });

  it('fetches referral entity and correctly extracts baseInfo for details panel', async () => {
    vi.spyOn(NavigationContext, 'useNavigation').mockReturnValue({
      lastEvent: { tab: 'Referral Management', entityId: 456, timestamp: Date.now() },
      navigateToTab: vi.fn(),
    });
    
    // Add referral mock response
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/dashboard')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ metrics: {}, activities: [] }) });
      }
      if (url.includes('/api/referrals/456') && !url.includes('details')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            baseInfo: {
              id: 456,
              studentName: 'Test Referral Auto',
              type: 'PSYCHIATRIC',
              status: 'WAITING_FOR_TRIAGE',
              referredBy: { name: 'Dr. Test' }
            },
            studentDemographics: {},
            triageInfo: {}
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TeacherPage />
      </QueryClientProvider>
    );

    // Verify fetch was called with the referral endpoint
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/referrals/456'),
        expect.any(Object)
      );
    });

    // If it properly extracts baseInfo, the ID will be available for the selected row
    // and the details panel should render the student name from the referral.
    await waitFor(() => {
      expect(screen.getByText('Test Referral Auto')).toBeDefined();
    });
  });
});
