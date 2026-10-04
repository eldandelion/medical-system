import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStudentBulkImport } from '../useStudentBulkImport';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockShowSnackbar = vi.fn();
vi.mock('../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: mockShowSnackbar })
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ session: { token: 'fake-token' } })
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useStudentBulkImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    queryClient.clear();
    vi.spyOn(queryClient, 'invalidateQueries');
    
    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document methods for download
    vi.spyOn(document, 'createElement');
    vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(() => {});
  });

  it('should handle successful template download', async () => {
    const mockBlob = new Blob(['test']);
    (global.fetch as any).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob)
    });

    const { result } = renderHook(() => useStudentBulkImport(), { wrapper });
    await act(async () => {
      await result.current.downloadTemplate();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/students/import/template'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Authorization': 'Bearer fake-token' })
      })
    );
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should handle failed template download', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useStudentBulkImport(), { wrapper });
    
    await act(async () => {
      try {
        await result.current.downloadTemplate();
      } catch (e) {}
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ message: '下载模板失败' })
    );
  });

  it('should handle successful preview', async () => {
    const mockData = { items: [] };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const { result } = renderHook(() => useStudentBulkImport(), { wrapper });
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    
    await act(async () => {
      await result.current.previewCsv(file);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/students/import/preview'),
      expect.objectContaining({ method: 'POST' })
    );
    await waitFor(() => expect(result.current.previewData).toEqual(mockData));
  });

  it('should handle failed preview', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Preview error' })
    });

    const { result } = renderHook(() => useStudentBulkImport(), { wrapper });
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    
    await act(async () => {
      try {
        await result.current.previewCsv(file);
      } catch (e) {}
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Preview error' })
    );
  });

  it('should handle successful commit', async () => {
    const mockData = { imported: 1 };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const { result } = renderHook(() => useStudentBulkImport(), { wrapper });
    
    await act(async () => {
      await result.current.commitImport({ rows: [], overwriteDuplicates: false });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/students/import/commit'),
      expect.objectContaining({ method: 'POST' })
    );
    await waitFor(() => expect(result.current.commitData).toEqual(mockData));
    expect(queryClient.invalidateQueries).toHaveBeenCalled();
  });

  it('should handle failed commit', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Commit error' })
    });

    const { result } = renderHook(() => useStudentBulkImport(), { wrapper });
    
    await act(async () => {
      try {
        await result.current.commitImport({ rows: [], overwriteDuplicates: false });
      } catch (e) {}
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Commit error' })
    );
  });
});
