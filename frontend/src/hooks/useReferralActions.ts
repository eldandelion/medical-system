import { useState } from 'react';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useAuth } from '../contexts/AuthContext';

interface UseReferralActionsProps {
  referralId: string;
  onUpdate?: () => void;
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useReferralActions({ referralId, onUpdate }: UseReferralActionsProps) {
  const { showSnackbar } = useSnackbar();
  const { session } = useAuth();

  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRecallDialogOpen, setIsRecallDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);
  const [isReportProblemDialogOpen, setIsReportProblemDialogOpen] = useState(false);
  const [isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen] = useState(false);
  
  const [reportProblemReason, setReportProblemReason] = useState('');
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const ACTION_MESSAGES = {
    RECALL: { success: '转诊申请已撤回', error: '撤回失败，该申请可能已被处理' },
    DELETE: { success: '草案已删除', error: '删除失败，请稍后重试' },
    APPROVE: { success: '转诊已批准', error: '批准失败，该申请可能已被撤回' },
    REJECT: { success: '转诊已拒绝', error: '操作失败，该申请可能已被撤回' },
    ASSIGN: { success: '转诊已分配', error: '分配失败，请稍后重试' },
    SCHEDULE: { success: '预约已排期', error: '预约排期失败，请稍后重试' },
    REPORT_PROBLEM: { success: '问题已报告', error: '报告失败，请稍后重试' },
    ACKNOWLEDGE: { success: '反馈已确认，转诊已结案', error: '操作失败，请稍后重试' }
  };

  const mutation = useMutation({
    mutationFn: async ({ endpoint, method, body }: any) => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${referralId}${endpoint}`.replace('//api', '/api'), {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          'Authorization': `Bearer ${session?.token || ''}`
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      if (!res.ok) {
        let errorMessage = `Failed to ${endpoint}`;
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error && errorData.details) {
            errorMessage = Object.values(errorData.details).join(', ');
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      }
      return res;
    },
    onSuccess: async (_, { successMsg }) => {
      setIsActionCompleted(true);
      showSnackbar({ message: successMsg, duration: 3000 });
      await queryClient.invalidateQueries(); // Invalidate all queries (dashboard, calendar, lists) to ensure everything stays in sync
      setIsActionCompleted(false);
      onUpdate?.();
    },
    onError: (error: any, { errorMsg, endpoint }: any) => {
      // The snackbar logic is kept but can be suppressed if desired.
      const isGeneric = error.message === `Failed to ${endpoint}`;
      const displayMsg = !isGeneric && error.message ? `${errorMsg}: ${error.message}` : errorMsg;
      showSnackbar({ message: displayMsg, duration: 5000 });
    }
  });

  const resolveErrorMessage = (error: any, endpoint: string, fallbackMsg: string) => {
    const isGeneric = error.message === `Failed to ${endpoint}`;
    return !isGeneric && error.message ? `${fallbackMsg}: ${error.message}` : fallbackMsg;
  };

  const executeAction = async (endpoint: string, method: string, successMsg: string, errorMsg: string, body?: any) => {
    try {
      await mutation.mutateAsync({ endpoint, method, body, successMsg, errorMsg });
      return true;
    } catch (e: any) {
      const resolvedMessage = resolveErrorMessage(e, endpoint, errorMsg);
      setActionError(resolvedMessage);
      return false;
    }
  };

  const handleRecall = async () => {
    const success = await executeAction('/recall', 'POST', ACTION_MESSAGES.RECALL.success, ACTION_MESSAGES.RECALL.error);
    if (success) setIsRecallDialogOpen(false);
  };

  const handleDelete = async () => {
    const success = await executeAction('', 'DELETE', ACTION_MESSAGES.DELETE.success, ACTION_MESSAGES.DELETE.error);
    if (success) setIsDeleteDialogOpen(false);
  };

  const handleApprove = async () => {
    if (!selectedHospitalId) {
      setActionError('请选择医院');
      return;
    }
    const success = await executeAction('/approve', 'POST', ACTION_MESSAGES.APPROVE.success, ACTION_MESSAGES.APPROVE.error, { hospitalId: parseInt(selectedHospitalId, 10) });
    if (success) {
      setIsApprovalDialogOpen(false);
      setSelectedHospitalId('');
    }
  };

  const handleReject = async () => {
    const success = await executeAction('/reject', 'POST', ACTION_MESSAGES.REJECT.success, ACTION_MESSAGES.REJECT.error, { reason: rejectionReason });
    if (success) {
      setIsRejectionDialogOpen(false);
      setRejectionReason('');
    }
  };

  const handleAssign = async () => {
    if (!selectedDoctorId) {
      setActionError('请选择医生');
      return;
    }
    const success = await executeAction('/assign-doctor', 'POST', ACTION_MESSAGES.ASSIGN.success, ACTION_MESSAGES.ASSIGN.error, { doctorId: parseInt(selectedDoctorId, 10) });
    if (success) setIsAssignDialogOpen(false);
  };

  const handleSchedule = async () => {
    if (!scheduleDateTime) {
      setActionError('请选择预约时间');
      return;
    }
    const success = await executeAction('/schedule', 'POST', ACTION_MESSAGES.SCHEDULE.success, ACTION_MESSAGES.SCHEDULE.error, { appointmentTime: scheduleDateTime });
    if (success) {
      setIsSchedulingDialogOpen(false);
      setScheduleDateTime('');
    }
  };

  const handleReportProblem = async () => {
    const success = await executeAction('/report-problem', 'POST', ACTION_MESSAGES.REPORT_PROBLEM.success, ACTION_MESSAGES.REPORT_PROBLEM.error, { reason: reportProblemReason });
    if (success) {
      setIsReportProblemDialogOpen(false);
      setReportProblemReason('');
    }
  };

  const handleAcknowledgeFeedback = async () => {
    const success = await executeAction('/acknowledge-feedback', 'POST', ACTION_MESSAGES.ACKNOWLEDGE.success, ACTION_MESSAGES.ACKNOWLEDGE.error);
    if (success) setIsAcknowledgeDialogOpen(false);
  };

  return {
    state: {
      isRejectionDialogOpen, setIsRejectionDialogOpen,
      isApprovalDialogOpen, setIsApprovalDialogOpen,
      isRecallDialogOpen, setIsRecallDialogOpen,
      isDeleteDialogOpen, setIsDeleteDialogOpen,
      isAssignDialogOpen, setIsAssignDialogOpen,
      isSchedulingDialogOpen, setIsSchedulingDialogOpen,
      isReportProblemDialogOpen, setIsReportProblemDialogOpen,
      isAcknowledgeDialogOpen, setIsAcknowledgeDialogOpen,
      reportProblemReason, setReportProblemReason,
      rejectionReason, setRejectionReason,
      scheduleDateTime, setScheduleDateTime,
      selectedDoctorId, setSelectedDoctorId,
      selectedHospitalId, setSelectedHospitalId,
      isActionCompleted,
      actionError, setActionError,
    },
    actions: {
      handleRecall,
      handleDelete,
      handleApprove,
      handleReject,
      handleAssign,
      handleSchedule,
      handleReportProblem,
      handleAcknowledgeFeedback,
    }
  };
}
