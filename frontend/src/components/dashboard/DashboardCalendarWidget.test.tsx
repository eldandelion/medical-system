import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { DashboardCalendarWidget } from './DashboardCalendarWidget';
import * as auth from '../../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // disable retries for tests
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('DashboardCalendarWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    queryClient.clear();
    (auth.useAuth as any).mockReturnValue({ session: { token: 'mock-token' } });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders loading state initially', async () => {
    // Delay fetch to simulate loading state
    (global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<DashboardCalendarWidget doctorId="doctor-123" />, { wrapper });

    expect(document.querySelector('md-circular-progress')).toBeDefined();
  });

  it('renders the calendar grid with occupied slots', async () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    const mockDateStr = `${yyyy}-${mm}-${dd}`;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ occupiedSlots: [`${yyyy}-${mm}-${dd}T09:00`] })
    });

    render(<DashboardCalendarWidget doctorId="doctor-123" />, { wrapper });

    await waitFor(() => {
      expect(document.querySelector('md-circular-progress')).toBeNull();
    });

    expect(screen.getByText('08:00')).toBeDefined();
    expect(screen.getByText('09:00')).toBeDefined();

    const occupiedIcons = document.querySelectorAll('md-icon');
    expect(occupiedIcons.length).toBeGreaterThan(0);
  });

  it('renders an error message when the API request fails', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });

    render(<DashboardCalendarWidget doctorId="doctor-123" />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('无法加载排班表。')).toBeDefined();
    });
  });

  it('does not allow interaction since it is read-only', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ occupiedSlots: ['2026-06-15T09:00:00Z'] })
    });

    render(<DashboardCalendarWidget doctorId="doctor-123" />, { wrapper });

    await waitFor(() => {
      expect(document.querySelector('md-circular-progress')).toBeNull();
    });

    const timeLabels = screen.getAllByText('08:00');
    expect(timeLabels).toHaveLength(1);
    
    const timeLabelCell = timeLabels[0].parentElement;
    const row = timeLabelCell?.parentElement;
    const firstSlot = row?.children[1];
    
    expect(firstSlot?.getAttribute('role')).toBeNull();
  });
});
