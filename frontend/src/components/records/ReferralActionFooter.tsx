import * as React from 'react';
import { ActionFooter } from '../common/ActionFooter';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { DestructiveButton } from '../common/DestructiveButton';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { Referral } from '../../types';

interface ReferralActionFooterProps {
  referral: Referral;
  actions: {
    handleRecall: () => void;
    handleDelete: () => void;
    handleApprove: () => void;
    handleReject: () => void;
    handleAssign: () => void;
    handleSchedule: () => void;
  };
  state: {
    setIsRejectionDialogOpen: (v: boolean) => void;
    setIsApprovalDialogOpen: (v: boolean) => void;
    setIsRecallDialogOpen: (v: boolean) => void;
    setIsDeleteDialogOpen: (v: boolean) => void;
    setIsAssignDialogOpen: (v: boolean) => void;
    setIsSchedulingDialogOpen: (v: boolean) => void;
    setIsReportProblemDialogOpen?: (v: boolean) => void;
    setIsAcknowledgeDialogOpen?: (v: boolean) => void;
    isActionCompleted?: boolean;
  };
}

export const ReferralActionFooter: React.FC<ReferralActionFooterProps> = ({
  referral,
  actions,
  state
}) => {
  const { openCreation, closeCreation } = useCreationOverlay();
  const extendedData = referral.extendedData;

  const handleRecreate = () => {
    import('./ReferralCreationForm').then(({ ReferralCreationForm }) => {
      const initialData = {
        title: referral.title,
        reason: referral.description,
        riskLevel: referral.riskLevel,
        clinicalStatus: [
          ...(extendedData?.triage?.isFirstVisit ? ['FirstVisit' as any] : []),
          ...(extendedData?.triage?.isMedicated ? ['Medicated' as any] : []),
          ...(extendedData?.triage?.priorTherapy === '有' ? ['PriorTherapy' as any] : [])
        ],
        severeRiskFactors: [
          ...(extendedData?.risk?.ideation ? ['Ideation' as any] : []),
          ...(extendedData?.risk?.attempt ? ['Attempt' as any] : []),
          ...(extendedData?.risk?.selfHarm ? ['SelfHarm' as any] : [])
        ],
        attachments: extendedData?.feedback?.attachments || []
      };
      openCreation('重新发起转诊', <ReferralCreationForm onClose={closeCreation} initialData={initialData} />);
    });
  };

  const handleWriteFeedback = () => {
    import('./FeedbackCreationForm').then(({ FeedbackCreationForm }) => {
      openCreation('填写诊疗反馈', <FeedbackCreationForm onClose={closeCreation} initialReferralId={referral.id} />);
    });
  };

  const availableActions = referral.availableActions || [];

  if (availableActions.length === 0) {
    return null;
  }

  const renderButtons = () => {
    return (
      <>
        {availableActions.includes('recreate') && (
          <PrimaryButton icon={referral.status === 'Draft' ? "edit" : "restart_alt"} label={referral.status === 'Draft' ? "继续编辑" : "基于此重新创建"} onClick={handleRecreate} />
        )}
        {availableActions.includes('delete_draft') && (
          <DestructiveButton icon="delete" label="删除草案" onClick={() => state.setIsDeleteDialogOpen(true)} />
        )}
        {availableActions.includes('approve_referral') && (
          <PrimaryButton icon="check" label="批准转诊" onClick={() => state.setIsApprovalDialogOpen(true)} />
        )}
        {availableActions.includes('reject_referral') && (
          <DestructiveButton icon="close" label="拒绝申请" onClick={() => state.setIsRejectionDialogOpen(true)} />
        )}
        {availableActions.includes('recall_referral') && (
          <SecondaryButton icon="undo" label="撤回申请" onClick={() => state.setIsRecallDialogOpen(true)} />
        )}
        {availableActions.includes('assign_doctor') && (
          <PrimaryButton icon="assignment_ind" label="分配医生" onClick={() => state.setIsAssignDialogOpen(true)} />
        )}
        {availableActions.includes('reassign_doctor') && (
          <PrimaryButton icon="assignment_ind" label="重新分配医生" onClick={() => state.setIsAssignDialogOpen(true)} />
        )}
        {availableActions.includes('schedule_appointment') && (
          <PrimaryButton icon="calendar_month" label="安排就诊" onClick={() => state.setIsSchedulingDialogOpen(true)} />
        )}
        {availableActions.includes('write_feedback') && (
          <PrimaryButton icon="edit_note" label="写反馈" onClick={handleWriteFeedback} />
        )}
        {availableActions.includes('report_problem') && (
          <DestructiveButton icon="report_problem" label="报告问题" onClick={() => state.setIsReportProblemDialogOpen?.(true)} />
        )}
        {availableActions.includes('acknowledge_feedback') && (
          <PrimaryButton icon="check" label="确认反馈" onClick={() => state.setIsAcknowledgeDialogOpen?.(true)} />
        )}
      </>
    );
  };

  const content = renderButtons();
  if (!content || state.isActionCompleted) return null;

  return <ActionFooter>{content}</ActionFooter>;
};
