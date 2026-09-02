import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEthnicities, FALLBACK_ETHNICITIES, STANDARD_ETHNICITY_NAMES } from '../useEthnicities';

describe('useEthnicities Hook', () => {
  it('provides all 56 standard Chinese ethnicities plus "其他" in fallback data', () => {
    expect(STANDARD_ETHNICITY_NAMES).toHaveLength(57);
    expect(STANDARD_ETHNICITY_NAMES).toContain('汉族');
    expect(STANDARD_ETHNICITY_NAMES).toContain('蒙古族');
    expect(STANDARD_ETHNICITY_NAMES).toContain('回族');
    expect(STANDARD_ETHNICITY_NAMES).toContain('维吾尔族');
    expect(STANDARD_ETHNICITY_NAMES).toContain('其他');

    expect(FALLBACK_ETHNICITIES).toHaveLength(57);
    expect(FALLBACK_ETHNICITIES[0]).toEqual({ id: 1, name: '汉族' });
    expect(FALLBACK_ETHNICITIES[56]).toEqual({ id: 57, name: '其他' });
  });

  it('renders hook with fallback data immediately', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useEthnicities(), { wrapper });

    expect(result.current.ethnicities).toBeDefined();
    expect(result.current.ethnicities.length).toBe(57);
    expect(result.current.ethnicities[0].name).toBe('汉族');
  });
});
