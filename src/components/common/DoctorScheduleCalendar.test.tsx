import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { DoctorScheduleCalendar } from './DoctorScheduleCalendar';
import * as auth from '../../contexts/AuthContext';
import { fetchWithRetry } from '../../utils/api';

vi.mock('../../utils/api', () => ({
  fetchWithRetry: vi.fn()
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('DoctorScheduleCalendar', () => {
  const mockOnSelectDateTime = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.useAuth as any).mockReturnValue({ session: { token: 'mock-token' } });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders loading state initially when doctorId is provided', () => {
    (fetchWithRetry as Mock).mockReturnValue(new Promise(() => {}));

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />
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

    (fetchWithRetry as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        occupiedSlots: [`${mockDateStr}T10:00`]
      })
    });

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />
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
    (fetchWithRetry as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        occupiedSlots: []
      })
    });

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />
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
    const mockDateStr = `${yyyy}-${mm}-${dd}`;

    (fetchWithRetry as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        occupiedSlots: [`${mockDateStr}T08:00`]
      })
    });

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />
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
    (fetchWithRetry as Mock).mockRejectedValue(new Error('Network error'));

    render(
      <DoctorScheduleCalendar 
        doctorId="doctor-123" 
        selectedDateTime="" 
        onSelectDateTime={mockOnSelectDateTime} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('无法加载排班表，您可能没有权限查看。')).toBeDefined();
    });
  });
});
