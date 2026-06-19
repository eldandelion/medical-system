import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReferralActions } from './useReferralActions';

const mockShowSnackbar = vi.fn();
vi.mock('../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: mockShowSnackbar })
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ session: { token: 'fake-token' } })
}));

describe('useReferralActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }));
    
    expect(result.current.state.isRejectionDialogOpen).toBe(false);
    expect(result.current.state.rejectionReason).toBe('');
    expect(result.current.state.selectedDoctorId).toBe('李医生');
  });

  it('should update state when toggled', () => {
    const { result } = renderHook(() => useReferralActions({ referralId: '123' }));

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

    const { result } = renderHook(() => useReferralActions({ referralId: '123', onUpdate: mockOnUpdate }));

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
  });

  it('should handle failed approve action', async () => {
    const mockOnUpdate = vi.fn();
    (global.fetch as any).mockResolvedValue({ ok: false }); // simulate 500 error

    const { result } = renderHook(() => useReferralActions({ referralId: '123', onUpdate: mockOnUpdate }));

    act(() => {
      result.current.state.setIsApprovalDialogOpen(true);
    });

    await act(async () => {
      await result.current.actions.handleApprove();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/referrals/123/approve'),
      expect.objectContaining({ method: 'POST' })
    );
    
    expect(result.current.state.isApprovalDialogOpen).toBe(false);
    expect(mockShowSnackbar).toHaveBeenCalledWith({ message: '批准失败，请稍后重试', duration: 3000 });
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});
