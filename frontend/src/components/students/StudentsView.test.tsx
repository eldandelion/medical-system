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
});

