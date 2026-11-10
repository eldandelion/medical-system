import { RISK_FACTOR_LABELS } from '../config/referralConstants';

export interface NotificationTextParams {
  messageCode?: string;
  payload?: Record<string, any>;
}

export function formatCrisisFlags(flags?: string | string[]): string {
  if (!flags) return '';
  const flagList = Array.isArray(flags)
    ? flags
    : typeof flags === 'string'
      ? flags.split(/[,，]\s*/).map(s => s.trim()).filter(Boolean)
      : [];

  if (flagList.length === 0) return '';
  return flagList.map(flag => RISK_FACTOR_LABELS[flag] || flag).join('、');
}

export function getNotificationText(notification?: NotificationTextParams): string {
  if (!notification || !notification.messageCode) {
    return '';
  }

  const studentName = notification.payload?.studentName || '未知学生';
  const initiatorName = notification.payload?.initiatorName || '教师';

  switch (notification.messageCode) {
    case 'REFERRAL_INITIATED':
      return `关于 ${studentName} 的新转诊申请已发起，等待后续处理。`;
    case 'REFERRAL_STATUS_CHANGED':
      return `关于 ${studentName} 的转诊申请状态已发生变更，请进入系统查看最新进展。`;
    case 'APPOINTMENT_SCHEDULED':
      return `医生已为 ${studentName} 安排了预约就诊时间。`;
    case 'EVALUATION_COMPLETED':
      return `医生已完成对 ${studentName} 的就诊评估与随访建议。`;
    case 'REFERRAL_SUBMITTED_STUDENT':
      return `由 ${initiatorName} 发起的转诊申请已成功提交。`;
    case 'REFERRAL_SUBMITTED_INITIATOR':
      return `您为 ${studentName} 发起的转诊申请已成功记录，并进入后续评估流程。`;
    case 'REFERRAL_REQUIRES_REVIEW_HC':
      return `由 ${initiatorName} 为 ${studentName} 发起的转诊申请需要您审核。`;
    case 'REFERRAL_CREATED_FOR_STUDENT_TEACHER':
      return `心理咨询师 ${initiatorName} 为您的学生 ${studentName} 发起了转诊申请。`;
    case 'REFERRAL_APPROVED_BY_HC_TEACHER':
    case 'REFERRAL_APPROVED_BY_HC_STUDENT':
      return `转诊中心已审核通过 ${studentName} 的转诊申请，正在等待医院分诊。`;
    case 'REFERRAL_NEEDS_TRIAGE_ADMIN':
      return `有一份关于 ${studentName} 的新转诊申请，请及时分配医生。`;
    case 'REFERRAL_DOCTOR_ASSIGNED_DOCTOR':
      return `您被分配了一份关于 ${studentName} 的转诊申请，请尽快安排就诊时间。`;
    case 'REFERRAL_DOCTOR_ASSIGNED_TEACHER':
    case 'REFERRAL_DOCTOR_ASSIGNED_STUDENT':
    case 'REFERRAL_DOCTOR_ASSIGNED_HC':
      return `${studentName} 的转诊申请已分配医生，正在等待排期。`;
    case 'REFERRAL_SCHEDULED_STUDENT':
    case 'REFERRAL_SCHEDULED_TEACHER':
    case 'REFERRAL_SCHEDULED_HC':
    case 'REFERRAL_SCHEDULED_ADMIN':
      return `医生已为 ${studentName} 安排了就诊时间。`;
    case 'REFERRAL_FEEDBACK_SUBMITTED_HC':
      return `医生已提交 ${studentName} 的就诊反馈，请审核。`;
    case 'REFERRAL_FEEDBACK_SUBMITTED_TEACHER':
    case 'REFERRAL_FEEDBACK_SUBMITTED_ADMIN':
    case 'REFERRAL_FEEDBACK_SUBMITTED_STUDENT':
      return `医生已提交 ${studentName} 的就诊反馈。`;
    case 'REFERRAL_CLOSED_TEACHER':
    case 'REFERRAL_CLOSED_STUDENT':
      return `${studentName} 的转诊流程已完成并关闭。`;
    case 'REFERRAL_REJECTED_TEACHER':
    case 'REFERRAL_REJECTED_STUDENT':
    case 'REFERRAL_REJECTED_HC':
      return `关于 ${studentName} 的转诊申请已被拒绝。`;
    case 'REFERRAL_NEEDS_REASSIGNMENT_ADMIN':
      return `医生要求重新分配 ${studentName} 的转诊申请，请处理。`;
    case 'REFERRAL_RECALLED_HC':
      return `关于 ${studentName} 的转诊申请已被撤回。`;
    case 'ASSESSMENT_HIGH_RISK_ALERT_HC':
    case 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER': {
      const rawFlags = notification.payload?.crisisFlags || notification.payload?.riskFlags;
      const formattedFlags = formatCrisisFlags(rawFlags);
      const flags = formattedFlags ? `（${formattedFlags}）` : '';
      return `学生 ${studentName} 的心理测评结果触发高危预警${flags}，请及时关注并干预处理。`;
    }
    case 'ASSESSMENT_ASSIGNED_STUDENT':
      return '您收到了一项新的心理健康测评任务，请及时前往完成测评。';
    case 'ASSESSMENT_COMPLETED_TEACHER':
      return `您的学生 ${studentName} 已完成心理健康测评。`;
    default:
      return notification.messageCode.replace(/_/g, ' ');
  }
}
