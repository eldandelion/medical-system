import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDataFetch, clearDataCache } from './useDataFetch';

const originalFetch = global.fetch;

describe('useDataFetch', () => {
  beforeEach(() => {
    clearDataCache();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore fetch after each test
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should initially set loading to true', () => {
    // A fetch mock that never resolves so we can check the initial loading state
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useDataFetch('/api/test'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('should fetch data and update state successfully', async () => {
    const mockData = { success: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useDataFetch('/api/test'));

    // Wait for the hook to finish loading
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    // In vitest environment BASE_URL defaults to /
    expect(global.fetch).toHaveBeenCalledWith('/api/test', undefined);
  });

  it('should process fetched data if processData callback is provided', async () => {
    const mockData = { items: [1, 2, 3] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const processData = (data: any) => data.items.length;

    const { result } = renderHook(() => useDataFetch('/api/process', processData));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Validates that it correctly ran the custom processing function
    expect(result.current.data).toBe(3); 
  });

  it('should initialize with cached data if it exists', async () => {
    const mockData = { cached: true };
    // Provide a continuous mock so background refetches don't crash
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    // Render once to populate the cache
    const { result, unmount } = renderHook(() => useDataFetch('/api/cache'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    unmount(); 

    // Render again with the same URL. 
    // It should immediately have the data available synchronously from cache.
    const { result: result2 } = renderHook(() => useDataFetch('/api/cache'));
    expect(result2.current.data).toEqual(mockData);
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));
    
    // Suppress expected console.error during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useDataFetch('/api/error'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    consoleSpy.mockRestore();
  });
});
