import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReferralActionFooter } from './ReferralActionFooter';
import { Referral } from '../../types';

vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: vi.fn(),
    closeCreation: vi.fn()
  })
}));

describe('ReferralActionFooter', () => {
  const mockReferral: Referral = {
    id: '123',
    studentName: '测试学生',
    status: 'Pending',
    title: 'Test',
    description: 'Test',
    riskLevel: 'Low',
    timestamp: '2023-01-01',
    extendedData: {
      triage: { isFirstVisit: true, isMedicated: false, priorTherapy: '无' },
      risk: { ideation: false, attempt: false, selfHarm: false },
    }
  } as unknown as Referral;

  const mockActions = {
    handleRecall: vi.fn(),
    handleDelete: vi.fn(),
    handleApprove: vi.fn(),
    handleReject: vi.fn(),
    handleAssign: vi.fn(),
    handleSchedule: vi.fn()
  };

  const mockState = {
    setIsRejectionDialogOpen: vi.fn(),
    setIsApprovalDialogOpen: vi.fn(),
    setIsRecallDialogOpen: vi.fn(),
    setIsDeleteDialogOpen: vi.fn(),
    setIsAssignDialogOpen: vi.fn(),
    setIsSchedulingDialogOpen: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const renderComponent = (availableActions: string[] = []) => {
    const referralWithActions = {
      ...mockReferral,
      availableActions: availableActions as any
    };
    return render(
      <ReferralActionFooter
        referral={referralWithActions}
        actions={mockActions}
        state={mockState}
      />
    );
  };

  it('hides footer entirely when no actions are available', () => {
    const { container } = renderComponent([]);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when schedule_appointment and reject_referral are available', () => {
    renderComponent(['schedule_appointment', 'reject_referral']);
    const scheduleButton = screen.getByText('安排就诊');
    const rejectButton = screen.getByText('拒绝申请');
    expect(scheduleButton).toBeDefined();
    expect(rejectButton).toBeDefined();

    fireEvent.click(scheduleButton);
    expect(mockState.setIsSchedulingDialogOpen).toHaveBeenCalledWith(true);
  });

  it('renders reassign button when reassign_doctor is available', () => {
    renderComponent(['reassign_doctor']);
    const reassignButton = screen.getByText('重新分配医生');
    expect(reassignButton).toBeDefined();

    fireEvent.click(reassignButton);
    expect(mockState.setIsAssignDialogOpen).toHaveBeenCalledWith(true);
  });

  it('renders correctly when approve_referral and reject_referral are available', () => {
    renderComponent(['approve_referral', 'reject_referral']);
    const approveButton = screen.getByText('批准转诊');
    const rejectButton = screen.getByText('拒绝申请');
    expect(approveButton).toBeDefined();
    expect(rejectButton).toBeDefined();

    fireEvent.click(approveButton);
    expect(mockState.setIsApprovalDialogOpen).toHaveBeenCalledWith(true);
  });
});
