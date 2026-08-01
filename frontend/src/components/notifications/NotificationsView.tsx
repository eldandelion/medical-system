import React from 'react';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDto } from '../../api/notifications';

interface NotificationsViewProps {
  onViewReferral?: (referralId: string) => void;
  onViewRecords?: () => void;
}

// Helper to translate message codes to readable Chinese text
const getNotificationText = (notification: NotificationDto) => {
  const studentName = notification.payload?.studentName || '未知学生';
  const initiatorName = notification.payload?.initiatorName || '教师';
  
  switch (notification.messageCode) {
    case 'REFERRAL_SUBMITTED_STUDENT':
      return <span>由 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{initiatorName}</span> 发起的转诊申请已成功提交。</span>;
    case 'REFERRAL_SUBMITTED_INITIATOR': 
      return <span>您为 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 发起的转诊申请已成功记录，并进入后续评估流程。</span>;
    case 'REFERRAL_REQUIRES_REVIEW_HC':
      return <span>由 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{initiatorName}</span> 为 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 发起的转诊申请需要您审核。</span>;
    case 'REFERRAL_CREATED_FOR_STUDENT_TEACHER':
      return <span>心理咨询师 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{initiatorName}</span> 为您的学生 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 发起了转诊申请。</span>;
    case 'REFERRAL_APPROVED_BY_HC_TEACHER':
    case 'REFERRAL_APPROVED_BY_HC_STUDENT':
      return <span>转诊中心已审核通过 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的转诊申请，正在等待医院分诊。</span>;
    case 'REFERRAL_NEEDS_TRIAGE_ADMIN':
      return <span>有一份关于 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的新转诊申请，请及时分配医生。</span>;
    case 'REFERRAL_DOCTOR_ASSIGNED_DOCTOR':
      return <span>您被分配了一份关于 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的转诊申请，请尽快安排就诊时间。</span>;
    case 'REFERRAL_DOCTOR_ASSIGNED_TEACHER':
    case 'REFERRAL_DOCTOR_ASSIGNED_STUDENT':
    case 'REFERRAL_DOCTOR_ASSIGNED_HC':
      return <span><span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的转诊申请已分配医生，正在等待排期。</span>;
    case 'REFERRAL_SCHEDULED_STUDENT':
    case 'REFERRAL_SCHEDULED_TEACHER':
    case 'REFERRAL_SCHEDULED_HC':
    case 'REFERRAL_SCHEDULED_ADMIN':
      return <span>医生已为 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 安排了就诊时间。</span>;
    case 'REFERRAL_FEEDBACK_SUBMITTED_HC':
      return <span>医生已提交 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的就诊反馈，请审核。</span>;
    case 'REFERRAL_FEEDBACK_SUBMITTED_TEACHER':
    case 'REFERRAL_FEEDBACK_SUBMITTED_ADMIN':
    case 'REFERRAL_FEEDBACK_SUBMITTED_STUDENT':
      return <span>医生已提交 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的就诊反馈。</span>;
    case 'REFERRAL_CLOSED_TEACHER':
    case 'REFERRAL_CLOSED_STUDENT':
      return <span><span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的转诊流程已完成并关闭。</span>;
    case 'REFERRAL_REJECTED_TEACHER':
    case 'REFERRAL_REJECTED_STUDENT':
    case 'REFERRAL_REJECTED_HC':
      return <span>关于 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的转诊申请已被拒绝。</span>;
    case 'REFERRAL_NEEDS_REASSIGNMENT_ADMIN':
      return <span>医生要求重新分配 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的转诊申请，请处理。</span>;
    case 'REFERRAL_RECALLED_HC':
      return <span>关于 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 的转诊申请已被撤回。</span>;
    default:
      return notification.messageCode.replace(/_/g, ' ');
  }
};

const getNotificationTitle = (notification: NotificationDto) => {
  if (notification.messageCode === 'REFERRAL_SUBMITTED_INITIATOR') return '转诊申请提交成功';
  if (notification.messageCode === 'REFERRAL_CREATED_FOR_STUDENT_TEACHER') return '学生转诊申请已创建';
  if (notification.messageCode.includes('SUBMITTED')) return '转诊申请已提交';
  if (notification.messageCode.includes('REVIEW') || notification.messageCode.includes('NEEDS')) return '待处理转诊申请';
  if (notification.messageCode.includes('APPROVED')) return '转诊申请已通过';
  if (notification.messageCode.includes('ASSIGNED')) return '已分配医生';
  if (notification.messageCode.includes('SCHEDULED')) return '就诊时间已排期';
  if (notification.messageCode.includes('FEEDBACK')) return '就诊反馈已提交';
  if (notification.messageCode.includes('CLOSED')) return '转诊已完成';
  if (notification.messageCode.includes('REJECTED')) return '转诊被拒绝';
  if (notification.messageCode.includes('RECALLED')) return '转诊已撤回';
  return '新通知';
};

const getNotificationIcon = (notification: NotificationDto) => {
  if (notification.actionType === 'REVIEW_REFERRAL') return 'assignment_turned_in';
  if (notification.actionType === 'ASSIGN_DOCTOR') return 'person_add';
  if (notification.actionType === 'CREATE_APPOINTMENT') return 'edit_calendar';
  if (notification.actionType === 'APPROVE_FEEDBACK') return 'fact_check';
  if (notification.messageCode === 'REFERRAL_CREATED_FOR_STUDENT_TEACHER') return 'assignment_ind';
  if (notification.messageCode.includes('SUBMITTED')) return 'send';
  if (notification.messageCode.includes('APPROVED')) return 'check_circle';
  if (notification.messageCode.includes('ASSIGNED')) return 'local_hospital';
  if (notification.messageCode.includes('SCHEDULED')) return 'event_available';
  if (notification.messageCode.includes('CLOSED')) return 'task_alt';
  if (notification.messageCode.includes('REJECTED') || notification.messageCode.includes('NEEDS_REASSIGNMENT')) return 'error_outline';
  if (notification.messageCode.includes('RECALLED')) return 'settings_backup_restore';
  return 'info';
};

export function NotificationsView({ onViewReferral, onViewRecords }: NotificationsViewProps) {
  const { session } = useAuth();
  const { notifications, markAsRead, isLoading } = useNotifications(session?.token);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
        {/* @ts-ignore */}
        <md-circular-progress indeterminate></md-circular-progress>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-stretch overflow-y-auto px-6 md:px-12 lg:px-24 pb-20 pt-8">
      <div className="max-w-3xl w-full flex flex-col mx-auto">
        <h3 className="text-[12px] font-medium tracking-wide text-[var(--md-sys-color-on-surface-variant)] mb-4 uppercase">
          所有通知
        </h3>
        
        <div className="flex flex-col gap-4 mb-4">
          {notifications.map((notification: NotificationDto) => (
            <NotificationItem 
              key={notification.id}
              icon={getNotificationIcon(notification)}
              iconBgColor={notification.isRead ? 'var(--md-sys-color-surface-variant)' : 'var(--md-sys-color-secondary-container)'}
              iconTextColor={notification.isRead ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-secondary-container)'}
              header={getNotificationTitle(notification)}
              time={new Date(notification.createdAt).toLocaleString()}
              body={getNotificationText(notification)}
              actions={[
                ...(['VIEW_REFERRAL', 'REVIEW_REFERRAL'].includes(notification.actionType) ? [{
                  label: '查看详情',
                  variant: 'text' as const,
                  onClick: () => {
                    const targetId = notification.payload?.referralId || notification.actionTargetId;
                    if (onViewReferral && targetId) onViewReferral(String(targetId));
                  }
                }] : []),
                ...(notification.actionType === 'ASSIGN_DOCTOR' ? [{
                  label: '立即分诊',
                  variant: 'text' as const,
                  onClick: () => {
                    const targetId = notification.payload?.referralId || notification.actionTargetId;
                    if (onViewReferral && targetId) onViewReferral(String(targetId));
                  }
                }] : []),
                ...(notification.actionType === 'CREATE_APPOINTMENT' ? [{
                  label: '安排就诊',
                  variant: 'text' as const,
                  onClick: () => {
                    const targetId = notification.payload?.referralId || notification.actionTargetId;
                    if (onViewReferral && targetId) onViewReferral(String(targetId));
                  }
                }] : []),
                ...(notification.actionType === 'APPROVE_FEEDBACK' ? [{
                  label: '确认反馈',
                  variant: 'text' as const,
                  onClick: () => {
                    const targetId = notification.payload?.referralId || notification.actionTargetId;
                    if (onViewReferral && targetId) onViewReferral(String(targetId));
                  }
                }] : []),
                ...(notification.actionType === 'VIEW_RECORDS' ? [{
                  label: '查看记录',
                  variant: 'text' as const,
                  onClick: () => onViewRecords && onViewRecords()
                }] : [])
              ]}
            />
          ))}
          
          {notifications.length === 0 && (
            <div className="text-center text-[var(--md-sys-color-on-surface-variant)] pt-12">
              暂无通知
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
