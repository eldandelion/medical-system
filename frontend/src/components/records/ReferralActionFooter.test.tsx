import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReferralActionFooter } from './ReferralActionFooter';
import { Referral } from '../../types';

const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();

vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation
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
    setIsReportProblemDialogOpen: vi.fn(),
    setIsAcknowledgeDialogOpen: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const renderComponent = (availableActions: string[] = [], status = 'Pending') => {
    const referralWithActions = {
      ...mockReferral,
      status,
      availableActions: availableActions as any
    };
    return render(
      <ReferralActionFooter
        referral={referralWithActions as any}
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
    
    fireEvent.click(rejectButton);
    expect(mockState.setIsRejectionDialogOpen).toHaveBeenCalledWith(true);
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
    expect(approveButton).toBeDefined();

    fireEvent.click(approveButton);
    expect(mockState.setIsApprovalDialogOpen).toHaveBeenCalledWith(true);
  });

  it('renders correctly for delete_draft and recall_referral', () => {
    renderComponent(['delete_draft', 'recall_referral']);
    const deleteBtn = screen.getByText('删除草案');
    const recallBtn = screen.getByText('撤回申请');
    expect(deleteBtn).toBeDefined();
    expect(recallBtn).toBeDefined();

    fireEvent.click(deleteBtn);
    expect(mockState.setIsDeleteDialogOpen).toHaveBeenCalledWith(true);

    fireEvent.click(recallBtn);
    expect(mockState.setIsRecallDialogOpen).toHaveBeenCalledWith(true);
  });

  it('renders correctly for assign_doctor', () => {
    renderComponent(['assign_doctor']);
    const assignBtn = screen.getByText('分配医生');
    expect(assignBtn).toBeDefined();

    fireEvent.click(assignBtn);
    expect(mockState.setIsAssignDialogOpen).toHaveBeenCalledWith(true);
  });

  it('renders correctly for report_problem and acknowledge_feedback', () => {
    renderComponent(['report_problem', 'acknowledge_feedback']);
    const reportBtn = screen.getByText('报告问题');
    const ackBtn = screen.getByText('确认反馈');
    
    fireEvent.click(reportBtn);
    expect(mockState.setIsReportProblemDialogOpen).toHaveBeenCalledWith(true);
    
    fireEvent.click(ackBtn);
    expect(mockState.setIsAcknowledgeDialogOpen).toHaveBeenCalledWith(true);
  });

  it('handles recreate action for Draft status', async () => {
    renderComponent(['recreate'], 'Draft');
    const recreateBtn = screen.getByText('继续编辑');
    fireEvent.click(recreateBtn);
    
    // Dynamic import inside handleRecreate
    await waitFor(() => {
      expect(mockOpenCreation).toHaveBeenCalled();
    });
  });

  it('handles recreate action for non-Draft status', async () => {
    renderComponent(['recreate'], 'Rejected');
    const recreateBtn = screen.getByText('基于此重新创建');
    fireEvent.click(recreateBtn);
    
    // Dynamic import inside handleRecreate
    await waitFor(() => {
      expect(mockOpenCreation).toHaveBeenCalled();
    });
  });

  it('handles write_feedback action', async () => {
    renderComponent(['write_feedback']);
    const writeBtn = screen.getByText('写反馈');
    fireEvent.click(writeBtn);
    
    // Dynamic import inside handleWriteFeedback
    await waitFor(() => {
      expect(mockOpenCreation).toHaveBeenCalled();
    });
  });
});
