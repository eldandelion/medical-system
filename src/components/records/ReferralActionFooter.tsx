import * as React from 'react';
import { ActionFooter } from '../common/ActionFooter';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { DestructiveButton } from '../common/DestructiveButton';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { Referral } from '../../types';

interface ReferralActionFooterProps {
  referral: Referral;
  displayStatus: string;
  userRole: string;
  isDoctorRejected: boolean;
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
  };
}

export const ReferralActionFooter: React.FC<ReferralActionFooterProps> = ({
  referral,
  displayStatus,
  userRole,
  isDoctorRejected,
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

  // Determine if the footer should be completely hidden
  const shouldHideFooter =
    (displayStatus === 'Recalled' && userRole === 'head-councillor') ||
    displayStatus === 'Pending' ||
    displayStatus === 'Closed' ||
    (displayStatus === 'Rejected' && !(userRole === 'trial-admin' && isDoctorRejected)) ||
    (displayStatus === 'AwaitingTriage' && (userRole === 'teacher' || userRole === 'head-councillor')) ||
    (displayStatus === 'WaitingForScheduling' && userRole === 'trial-admin');

  if (shouldHideFooter) {
    return null;
  }

  const renderButtons = () => {
    switch (displayStatus) {
      case 'Recalled':
        if (userRole === 'teacher') {
          return <PrimaryButton icon="restart_alt" label="基于此重新创建" onClick={handleRecreate} />;
        }
        return null;

      case 'AwaitingApproval':
        if (userRole === 'head-councillor') {
          return (
            <>
              <PrimaryButton icon="check" label="批准转诊" onClick={() => state.setIsApprovalDialogOpen(true)} />
              <DestructiveButton icon="close" label="拒绝申请" onClick={() => state.setIsRejectionDialogOpen(true)} />
            </>
          );
        }
        if (userRole === 'teacher') {
          return <SecondaryButton icon="undo" label="撤回申请" onClick={() => state.setIsRecallDialogOpen(true)} />;
        }
        return null;

      case 'AwaitingTriage':
        if (userRole === 'trial-admin') {
          return (
            <>
              <PrimaryButton icon="assignment_ind" label="分配医生" onClick={() => state.setIsAssignDialogOpen(true)} />
              <DestructiveButton icon="close" label="拒绝申请" onClick={() => state.setIsRejectionDialogOpen(true)} />
            </>
          );
        }
        return null;

      case 'WaitingForScheduling':
        if (userRole === 'doctor') {
          return (
            <>
              <PrimaryButton icon="calendar_month" label="安排就诊" onClick={() => state.setIsSchedulingDialogOpen(true)} />
              <DestructiveButton icon="close" label="拒绝" onClick={() => state.setIsRejectionDialogOpen(true)} />
            </>
          );
        }
        return null;

      case 'Draft':
        if (userRole === 'teacher' || userRole === 'head-councillor') {
          return (
            <>
              <PrimaryButton icon="edit" label="继续编辑" onClick={handleRecreate} />
              <DestructiveButton icon="delete" label="删除草案" onClick={() => state.setIsDeleteDialogOpen(true)} />
            </>
          );
        }
        return null;

      case 'AwaitingFeedbackApproval':
        return <PrimaryButton icon="check" label="确认反馈" />;

      case 'Rejected':
        if (userRole === 'trial-admin' && isDoctorRejected) {
          return <PrimaryButton icon="assignment_ind" label="重新分配医生" onClick={() => state.setIsAssignDialogOpen(true)} />;
        }
        return null;

      default:
        return null;
    }
  };

  const content = renderButtons();
  if (!content) return null;

  return <ActionFooter>{content}</ActionFooter>;
};
