import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { StudentsView } from './StudentsView';

const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('../../contexts/SidebarContext', () => ({
  useSidebar: () => ({ isCollapsed: false })
}));

describe('StudentsView Component', () => {
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          {ui}
        </SnackbarProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: '1',
              studentNumber: 'S2026001',
              name: '张三',
              major: '计算机科学',
              year: 'FRESHMAN',
              status: 'Active',
              riskLevel: 'LOW'
            },
            {
              id: '2',
              studentNumber: 'S2026002',
              name: '李四',
              major: '心理学',
              year: 'SOPHOMORE',
              status: 'Active',
              riskLevel: 'MEDIUM'
            }
          ])
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders student list, filter chips, and 批量导入 button with trailing plus icon for admin', async () => {
    mockUseAuth.mockReturnValue({
      session: {
        role: 'admin',
        token: 'mock-admin-token'
      }
    });

    renderWithProviders(<StudentsView />);

    // Verify filter chips exist
    expect(screen.getByText('专业')).toBeDefined();
    expect(screen.getByText('培养层次')).toBeDefined();
    expect(screen.getByText('风险')).toBeDefined();
    expect(screen.getByText('导师')).toBeDefined();

    // Verify 批量导入 button
    const importBtn = screen.getByText('批量导入');
    expect(importBtn).toBeDefined();

    const tonalBtn = importBtn.closest('md-filled-tonal-button');
    expect(tonalBtn).toBeDefined();
    expect(tonalBtn?.hasAttribute('trailing-icon')).toBe(true);

    // Verify plus icon 'add'
    const iconEl = tonalBtn?.querySelector('md-icon');
    expect(iconEl?.textContent).toBe('add');

    // Verify student data loads
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeDefined();
    });
  });

  it('opens StudentBulkImportDialog when 批量导入 button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      session: {
        role: 'head-councillor',
        token: 'mock-hc-token'
      }
    });

    renderWithProviders(<StudentsView />);

    const importBtn = screen.getByText('批量导入');
    fireEvent.click(importBtn);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('全校学生档案批量导入')).toBeDefined();
    });
  });

  it('hides 批量导入 button for student/teacher role', async () => {
    mockUseAuth.mockReturnValue({
      session: {
        role: 'teacher',
        token: 'mock-teacher-token'
      }
    });

    renderWithProviders(<StudentsView />);

    expect(screen.queryByText('批量导入')).toBeNull();
  });

  it('filters students live using the ExpandableSearchBar', async () => {
    mockUseAuth.mockReturnValue({
      session: {
        role: 'admin',
        token: 'mock-admin-token'
      }
    });

    renderWithProviders(<StudentsView />);

    // Wait for both students to load
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeDefined();
      expect(screen.getByText('李四')).toBeDefined();
    });

    // Expand the search bar
    const searchExpandBtn = screen.getByRole('button', { name: '展开搜索' });
    fireEvent.click(searchExpandBtn);

    // Find the search input
    const input = screen.getByPlaceholderText('搜索学生姓名、学号、专业...');
    expect(input).toBeDefined();

    // Type '李四'
    fireEvent.change(input, { target: { value: '李四' } });

    // '李四' should remain, '张三' should be filtered out
    expect(screen.getByText('李四')).toBeDefined();
    expect(screen.queryByText('张三')).toBeNull();

    // Clear search using cancel button
    const clearBtn = screen.getByRole('button', { name: '清除搜索' });
    fireEvent.click(clearBtn);

    // Both students should be visible again
    expect(screen.getByText('张三')).toBeDefined();
    expect(screen.getByText('李四')).toBeDefined();
  });

  it('resets search query and active filters when resetToken changes', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { role: 'TEACHER' }, token: 'mock-token' }
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <StudentsView />
        </SnackbarProvider>
      </QueryClientProvider>
    );
    
    const searchExpandBtn = screen.getByRole('button', { name: '展开搜索' });
    fireEvent.click(searchExpandBtn);

    const input = screen.getByPlaceholderText('搜索学生姓名、学号、专业...');
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect((input as HTMLInputElement).value).toBe('Alice');

    rerender(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <StudentsView resetToken={Date.now()} />
        </SnackbarProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });
});


