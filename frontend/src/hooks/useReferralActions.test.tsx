import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReferralActions } from './useReferralActions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockShowSnackbar = vi.fn();
vi.mock('../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: mockShowSnackbar })
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ session: { token: 'fake-token' } })
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useReferralActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    queryClient.clear();
    vi.spyOn(queryClient, 'invalidateQueries');
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    
    expect(result.current.state.isRejectionDialogOpen).toBe(false);
    expect(result.current.state.rejectionReason).toBe('');
    expect(result.current.state.selectedDoctorId).toBe('');
  });

  it('should update state when toggled', () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });

    act(() => {
      result.current.state.setIsRejectionDialogOpen(true);
      result.current.state.setRejectionReason('Not appropriate');
    });

    expect(result.current.state.isRejectionDialogOpen).toBe(true);
    expect(result.current.state.rejectionReason).toBe('Not appropriate');
  });

  it('should handle successful reject action', async () => {
    const mockOnUpdate = vi.fn();
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useReferralActions({ referralId: '123', onUpdate: mockOnUpdate }), { wrapper });

    act(() => {
      result.current.state.setIsRejectionDialogOpen(true);
      result.current.state.setRejectionReason('Testing rejection');
    });

    await act(async () => {
      await result.current.actions.handleReject();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/referrals/123/reject'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ reason: 'Testing rejection' }),
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake-token'
        })
      })
    );
    
    expect(result.current.state.isRejectionDialogOpen).toBe(false);
    expect(result.current.state.rejectionReason).toBe(''); // Cleared on success
    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '转诊已拒绝', duration: 3000 });
    expect(mockOnUpdate).toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalled();
  });

  it('should handle failed approve action', async () => {
    const mockOnUpdate = vi.fn();
    (global.fetch as any).mockResolvedValue({ ok: false }); // simulate 500 error

    const { result } = renderHook(() => useReferralActions({ referralId: '123', onUpdate: mockOnUpdate }), { wrapper });

    act(() => {
      result.current.state.setSelectedHospitalId('1');
      result.current.state.setIsApprovalDialogOpen(true);
    });

    await act(async () => {
      await result.current.actions.handleApprove();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/referrals/123/approve'),
      expect.objectContaining({ method: 'POST' })
    );
    
    expect(result.current.state.isApprovalDialogOpen).toBe(true);
    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '批准失败，请稍后重试', duration: 5000 });
    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it('should handle fetch throwing an error', async () => {
    const mockOnUpdate = vi.fn();
    (global.fetch as any).mockRejectedValueOnce(new Error('Network disconnected'));

    const { result } = renderHook(() => useReferralActions({ referralId: '1', onUpdate: mockOnUpdate }), { wrapper });

    act(() => {
      result.current.state.setSelectedHospitalId('1');
    });

    await act(async () => {
      await result.current.actions.handleApprove();
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '批准失败，请稍后重试: Network disconnected', duration: 5000 });
    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it('should handle successful assign action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });

    act(() => {
      result.current.state.setSelectedDoctorId('456');
    });

    await act(async () => {
      await result.current.actions.handleAssign();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/referrals/123/assign'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ doctorId: 456 })
      })
    );
    expect(result.current.state.isAssignDialogOpen).toBe(false);
    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '转诊已分配', duration: 3000 });
  });

  it('should handle schedule action without datetime', async () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });

    await act(async () => {
      await result.current.actions.handleSchedule();
    });

    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '请选择预约时间', duration: 3000 });
  });

  it('should handle successful schedule action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });

    act(() => {
      result.current.state.setScheduleDateTime('2026-06-15T09:00:00Z');
    });

    await act(async () => {
      await result.current.actions.handleSchedule();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/referrals/123/schedule'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ appointmentTime: '2026-06-15T09:00:00Z' })
      })
    );
    expect(result.current.state.isSchedulingDialogOpen).toBe(false);
    expect(result.current.state.scheduleDateTime).toBe('');
    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '预约已排期', duration: 3000 });
  });

  it('should handle approve action without hospitalId', async () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    await act(async () => {
      await result.current.actions.handleApprove();
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '请选择医院', duration: 3000 });
  });

  it('should handle assign action without doctorId', async () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    await act(async () => {
      await result.current.actions.handleAssign();
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '请选择医生', duration: 3000 });
  });

  it('should handle successful recall action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    await act(async () => { await result.current.actions.handleRecall(); });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/referrals/123/recall'), expect.objectContaining({ method: 'POST' }));
    expect(result.current.state.isRecallDialogOpen).toBe(false);
  });

  it('should handle successful delete action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    await act(async () => { await result.current.actions.handleDelete(); });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/referrals/123'), expect.objectContaining({ method: 'DELETE' }));
    expect(result.current.state.isDeleteDialogOpen).toBe(false);
  });

  it('should handle successful report problem action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    act(() => { result.current.state.setReportProblemReason('issue'); });
    await act(async () => { await result.current.actions.handleReportProblem(); });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/referrals/123/report-problem'), expect.objectContaining({ method: 'POST' }));
    expect(result.current.state.isReportProblemDialogOpen).toBe(false);
    expect(result.current.state.reportProblemReason).toBe('');
  });

  it('should handle successful acknowledge feedback action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    await act(async () => { await result.current.actions.handleAcknowledgeFeedback(); });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/referrals/123/acknowledge-feedback'), expect.objectContaining({ method: 'POST' }));
    expect(result.current.state.isAcknowledgeDialogOpen).toBe(false);
  });

  it('should handle successful cancel action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    act(() => { result.current.state.setCancelReason('done'); });
    await act(async () => { await result.current.actions.handleCancel(); });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/referrals/123/cancel'), expect.objectContaining({ method: 'POST' }));
    expect(result.current.state.isCancelDialogOpen).toBe(false);
    expect(result.current.state.cancelReason).toBe('');
  });

  it('should handle force archive action without reason', async () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    act(() => { result.current.state.setForceArchiveReason('   '); });
    await act(async () => { await result.current.actions.handleForceArchive(); });
    expect(result.current.state.actionError).toBe('强制归档必须提供原因说明');
  });

  it('should handle successful force archive action', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }), { wrapper });
    act(() => { result.current.state.setForceArchiveReason('forced'); });
    await act(async () => { await result.current.actions.handleForceArchive(); });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/referrals/123/force-archive'), expect.objectContaining({ method: 'POST' }));
    expect(result.current.state.isForceArchiveDialogOpen).toBe(false);
    expect(result.current.state.forceArchiveReason).toBe('');
  });

});
