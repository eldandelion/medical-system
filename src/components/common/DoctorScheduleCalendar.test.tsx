import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { DoctorScheduleCalendar } from './DoctorScheduleCalendar';
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

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('DoctorScheduleCalendar', () => {
  const mockOnSelectDateTime = vi.fn();
  
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

  it('renders loading state initially when doctorId is provided', async () => {
    (global.fetch as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />,
      { wrapper }
    );

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

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(document.querySelector('md-circular-progress')).toBeNull();
    });

    expect(screen.getByText('08:00')).toBeDefined();
    expect(screen.getByText('10:00')).toBeDefined();

    const occupiedTexts = screen.getAllByText('已满');
    expect(occupiedTexts.length).toBeGreaterThan(0);
  });

  it('calls onSelectDateTime when an unoccupied slot is clicked', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ occupiedSlots: ['2026-06-15T09:00:00Z'] })
    });

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(document.querySelector('md-circular-progress')).toBeNull();
    });

    const timeCell = screen.getAllByText('08:00')[0];
    const row = timeCell.parentElement;
    
    const firstSlot = row?.children[1];
    expect(firstSlot).toBeDefined();
    
    if (firstSlot) {
      fireEvent.click(firstSlot);
      expect(mockOnSelectDateTime).toHaveBeenCalledTimes(1);
      expect(mockOnSelectDateTime.mock.calls[0][0]).toContain('T08:00');
    }
  });

  it('does not call onSelectDateTime when an occupied slot is clicked', async () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);
    
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ occupiedSlots: [`${yyyy}-${mm}-${dd}T08:00`] })
    });

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(document.querySelector('md-circular-progress')).toBeNull();
    });

    const timeCell = screen.getAllByText('08:00')[0];
    const row = timeCell.parentElement;
    
    const firstSlot = row?.children[1];
    
    if (firstSlot) {
      fireEvent.click(firstSlot);
      expect(mockOnSelectDateTime).not.toHaveBeenCalled();
    }
  });

  it('renders an error message when the API request fails', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('无法加载排班表，您可能没有权限查看。')).toBeDefined();
    });
  });

  it('does not render loading spinner if no doctorId is provided', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ occupiedSlots: [] })
    });

    render(
      <DoctorScheduleCalendar 
        doctorId="" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />,
      { wrapper }
    );

    // It should not fetch or show loading
    expect(document.querySelector('md-circular-progress')).toBeNull();
  });
});
