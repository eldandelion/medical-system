import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  const renderComponent = (displayStatus: string, userRole: string, isDoctorRejected: boolean = false) => {
    return render(
      <ReferralActionFooter
        referral={mockReferral}
        displayStatus={displayStatus}
        userRole={userRole}
        isDoctorRejected={isDoctorRejected}
        actions={mockActions}
        state={mockState}
      />
    );
  };

  it('hides footer entirely for trial-admin when WaitingForScheduling', () => {
    const { container } = renderComponent('WaitingForScheduling', 'trial-admin');
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly for doctor when WaitingForScheduling', () => {
    renderComponent('WaitingForScheduling', 'doctor');
    const scheduleButton = screen.getByText('安排就诊');
    const rejectButton = screen.getByText('拒绝');
    expect(scheduleButton).toBeDefined();
    expect(rejectButton).toBeDefined();

    fireEvent.click(scheduleButton);
    expect(mockState.setIsSchedulingDialogOpen).toHaveBeenCalledWith(true);
  });

  it('renders reassign button for trial-admin when Rejected by doctor', () => {
    renderComponent('Rejected', 'trial-admin', true);
    const reassignButton = screen.getByText('重新分配医生');
    expect(reassignButton).toBeDefined();

    fireEvent.click(reassignButton);
    expect(mockState.setIsAssignDialogOpen).toHaveBeenCalledWith(true);
  });

  it('hides footer for trial-admin when Rejected but NOT by doctor', () => {
    const { container } = renderComponent('Rejected', 'trial-admin', false);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly for head-councillor when AwaitingApproval', () => {
    renderComponent('AwaitingApproval', 'head-councillor');
    const approveButton = screen.getByText('批准转诊');
    const rejectButton = screen.getByText('拒绝申请');
    expect(approveButton).toBeDefined();
    expect(rejectButton).toBeDefined();

    fireEvent.click(approveButton);
    expect(mockState.setIsApprovalDialogOpen).toHaveBeenCalledWith(true);
  });
});
