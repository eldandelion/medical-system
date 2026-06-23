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
  const [reportProblemReason, setReportProblemReason] = useState('');
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('李医生');
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  const queryClient = useQueryClient();

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
      if (!res.ok) throw new Error(`Failed to ${endpoint}`);
      return res;
    },
    onSuccess: async (_, { successMsg }) => {
      setIsActionCompleted(true);
      showSnackbar({ message: successMsg, duration: 3000 });
      await queryClient.invalidateQueries(); // Invalidate all queries (dashboard, calendar, lists) to ensure everything stays in sync
      setIsActionCompleted(false);
      onUpdate?.();
    },
    onError: (_, { errorMsg }) => {
      showSnackbar({ message: errorMsg, duration: 3000 });
    }
  });

  const executeAction = async (endpoint: string, method: string, successMsg: string, errorMsg: string, body?: any) => {
    try {
      await mutation.mutateAsync({ endpoint, method, body, successMsg, errorMsg });
      return true;
    } catch {
      return false;
    }
  };

  const handleRecall = async () => {
    setIsRecallDialogOpen(false);
    await executeAction('/recall', 'POST', '转诊申请已撤回', '撤回失败，请稍后重试');
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    await executeAction('', 'DELETE', '草案已删除', '删除失败，请稍后重试');
  };

  const handleApprove = async () => {
    setIsApprovalDialogOpen(false);
    await executeAction('/approve', 'POST', '转诊已批准', '批准失败，请稍后重试');
  };

  const handleReject = async () => {
    setIsRejectionDialogOpen(false);
    const success = await executeAction('/reject', 'POST', '转诊已拒绝', '操作失败，请稍后重试', { reason: rejectionReason });
    if (success) {
      setRejectionReason('');
    }
  };

  const handleAssign = async () => {
    setIsAssignDialogOpen(false);
    await executeAction('/assign', 'POST', '转诊已分配', '分配失败，请稍后重试', { doctorId: selectedDoctorId });
  };

  const handleSchedule = async () => {
    if (!scheduleDateTime) {
      showSnackbar({ message: '请选择预约时间', duration: 3000 });
      return;
    }
    setIsSchedulingDialogOpen(false);
    const success = await executeAction('/schedule', 'POST', '预约已排期', '预约排期失败，请稍后重试', { appointmentTime: scheduleDateTime });
    if (success) {
      setScheduleDateTime('');
    }
  };

  const handleReportProblem = async () => {
    setIsReportProblemDialogOpen(false);
    const success = await executeAction('/report-problem', 'POST', '问题已报告', '报告失败，请稍后重试', { reason: reportProblemReason });
    if (success) {
      setReportProblemReason('');
    }
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
      reportProblemReason, setReportProblemReason,
      rejectionReason, setRejectionReason,
      scheduleDateTime, setScheduleDateTime,
      selectedDoctorId, setSelectedDoctorId,
      isActionCompleted,
    },
    actions: {
      handleRecall,
      handleDelete,
      handleApprove,
      handleReject,
      handleAssign,
      handleSchedule,
      handleReportProblem,
    }
  };
}
