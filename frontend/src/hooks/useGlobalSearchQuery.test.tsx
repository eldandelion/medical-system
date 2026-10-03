import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGlobalSearchQuery } from './useGlobalSearchQuery';
import { AuthContext } from '../contexts/AuthContext';

function createWrapper(token: string | null = 'test-token') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const authValue = {
    session: token
      ? {
          role: 'teacher' as const,
          token,
          isAuthenticated: true,
        }
      : null,
    setRole: vi.fn(),
    logout: vi.fn(),
  };

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue as any}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('useGlobalSearchQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('stays idle/disabled when query is empty', () => {
    const { result } = renderHook(() => useGlobalSearchQuery('', 5), {
      wrapper: createWrapper('mock-token'),
    });

    expect(result.current.debouncedQuery).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('stays idle/disabled when token is missing', () => {
    const { result } = renderHook(() => useGlobalSearchQuery('Student', 5), {
      wrapper: createWrapper(null),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('debounces query and fetches results with auth token', async () => {
    const mockData = {
      query: 'Li',
      students: [{ id: 101, studentNumber: '2026001', name: 'Student Li' }],
      referrals: [],
      assessments: [],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useGlobalSearchQuery('  Li  ', 5), {
      wrapper: createWrapper('valid-jwt-token'),
    });

    await waitFor(
      () => {
        expect(result.current.debouncedQuery).toBe('Li');
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 2000 }
    );

    expect(fetchSpy).toHaveBeenCalled();
    const calledUrl = fetchSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain('api/search?q=Li&limit=5');

    const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer valid-jwt-token');
    expect(result.current.data).toEqual(mockData);
  });

  it('handles API error when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useGlobalSearchQuery('ErrorTarget', 5), {
      wrapper: createWrapper('valid-jwt-token'),
    });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 1500 }
    );

    expect(result.current.error?.message).toBe('Global search request failed');
  });
});
