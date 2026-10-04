import * as React from 'react';
import { ActionFooter } from '../common/ActionFooter';
import { OutlinedButton } from '../common/Buttons';
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
    setIsForceArchiveDialogOpen?: (v: boolean) => void;
    isActionCompleted?: boolean;
  };
}

export const ReferralActionFooter: React.FC<ReferralActionFooterProps> = ({
  referral,
  actions,
  state
}) => {
  const { openCreation, closeCreation } = useCreationOverlay();

  const handleRecreate = () => {
    import('./ReferralCreationForm').then(({ ReferralCreationForm }) => {
      const initialData = {
        title: referral.title,
        reason: referral.description,
        riskLevel: referral.riskLevel,
        clinicalStatus: [],
        severeRiskFactors: [],
        attachments: []
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
        {availableActions.map((action) => {
          switch (action) {
            case 'recreate':
              return <OutlinedButton key={action} icon={referral.status === 'DRAFT' ? "edit" : "restart_alt"} label={referral.status === 'DRAFT' ? "继续编辑" : "基于此重新创建"} onClick={handleRecreate} />;
            case 'delete_draft':
              return <OutlinedButton key={action} icon="delete" label="删除草案" onClick={() => state.setIsDeleteDialogOpen(true)} />;
            case 'approve_referral':
              return <OutlinedButton key={action} icon="check" label="批准转诊" onClick={() => state.setIsApprovalDialogOpen(true)} />;
            case 'reject_referral':
              return <OutlinedButton key={action} icon="close" label="拒绝申请" onClick={() => state.setIsRejectionDialogOpen(true)} />;
                        case 'force_archive':
            
              return <OutlinedButton key={action} icon="archive" label="强制归档" onClick={() => state.setIsForceArchiveDialogOpen?.(true)} />;
            case 'recall_referral':
              return <OutlinedButton key={action} icon="undo" label="撤回申请" onClick={() => state.setIsRecallDialogOpen(true)} />;
            case 'assign_doctor':
              return <OutlinedButton key={action} icon="assignment_ind" label="分配医生" onClick={() => state.setIsAssignDialogOpen(true)} />;
            case 'reassign_doctor':
              return <OutlinedButton key={action} icon="assignment_ind" label="重新分配医生" onClick={() => state.setIsAssignDialogOpen(true)} />;
            case 'schedule_appointment':
              return <OutlinedButton key={action} icon="calendar_month" label="安排就诊" onClick={() => state.setIsSchedulingDialogOpen(true)} />;
            case 'write_feedback':
              return <OutlinedButton key={action} icon="edit_note" label="写反馈" onClick={handleWriteFeedback} />;
            case 'report_problem':
              return <OutlinedButton key={action} icon="report_problem" label="报告问题" onClick={() => state.setIsReportProblemDialogOpen?.(true)} />;
            case 'acknowledge_feedback':
              return <OutlinedButton key={action} icon="check" label="确认反馈" onClick={() => state.setIsAcknowledgeDialogOpen?.(true)} />;
            default:
              return null;
          }
        })}
      </>
    );
  };

  const content = renderButtons();
  if (!content || state.isActionCompleted) return null;

  return <ActionFooter>{content}</ActionFooter>;
};
