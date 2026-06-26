import { Referral, ReferralAction } from '../types';

export const computeAvailableActions = (referral: Referral, authHeader: string): ReferralAction[] => {
  const actions: ReferralAction[] = [];
  const status = referral.status;
  
  if (authHeader.includes('teacher_token_zhang')) {
    if (status === 'Draft') {
      actions.push('recreate', 'delete_draft');
    } else if (status === 'Recalled') {
      actions.push('recreate');
    } else if (status === 'AwaitingApproval') {
      actions.push('recall_referral');
    }
  }
  
  if (authHeader.includes('head_councillor')) {
    if (status === 'Draft') {
      actions.push('recreate', 'delete_draft');
    } else if (status === 'AwaitingApproval') {
      actions.push('approve_referral', 'reject_referral');
    } else if (status === 'AwaitingFeedbackApproval') {
      actions.push('acknowledge_feedback');
    }
  }
  
  if (authHeader.includes('trial_admin')) {
    if (status === 'AwaitingTriage') {
      const isDoctorRejected = referral.extendedData?.rejectedBy?.some(r => r.includes('医生'));
      if (isDoctorRejected) {
        actions.push('reassign_doctor', 'reject_referral');
      } else {
        actions.push('assign_doctor', 'reject_referral');
      }
    }
  }
  
  if (authHeader.includes('doctor')) {
    if (status === 'WaitingForScheduling') {
      actions.push('schedule_appointment', 'reject_referral');
    } else if (status === 'WaitingForAppointment') {
      actions.push('write_feedback', 'report_problem');
    }
  }
  
  return actions;
};
