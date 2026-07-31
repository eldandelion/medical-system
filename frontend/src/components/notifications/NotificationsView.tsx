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
  switch (notification.messageCode) {
    case 'REFERRAL_SUBMITTED_STUDENT':
      return (
        <span>由 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{notification.payload.initiatorName || '教师'}</span> 发起的转诊申请已成功提交。</span>
      );
    case 'REFERRAL_SUBMITTED_INITIATOR': {
      const studentName = notification.payload.studentName || '';
      return (
        <span>您为 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 发起的转诊申请已成功记录，并进入后续评估流程。</span>
      );
    }
    case 'REFERRAL_REQUIRES_REVIEW_HC':
      return (
        <span>由 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{notification.payload.initiatorName || '教师'}</span> 为 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{notification.payload.studentName || '未知学生'}</span> 发起的转诊申请需要您审核。</span>
      );
    case 'REFERRAL_CREATED_FOR_STUDENT_TEACHER': {
      const initiatorName = notification.payload.initiatorName || '心理咨询师';
      const studentName = notification.payload.studentName || '未知学生';
      return (
        <span>心理咨询师 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{initiatorName}</span> 为您的学生 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 发起了转诊申请。</span>
      );
    }
    default:
      return notification.messageCode.replace(/_/g, ' ');
  }
};

const getNotificationTitle = (notification: NotificationDto) => {
  if (notification.messageCode === 'REFERRAL_SUBMITTED_INITIATOR') return '转诊申请提交成功';
  if (notification.messageCode === 'REFERRAL_CREATED_FOR_STUDENT_TEACHER') return '学生转诊申请已创建';
  if (notification.messageCode.includes('SUBMITTED')) return '转诊申请已提交';
  if (notification.messageCode.includes('REVIEW')) return '待审核转诊申请';
  return '新通知';
};

const getNotificationIcon = (notification: NotificationDto) => {
  if (notification.actionType === 'REVIEW_REFERRAL') return 'assignment_turned_in';
  if (notification.messageCode === 'REFERRAL_CREATED_FOR_STUDENT_TEACHER') return 'assignment_ind';
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
                ...(notification.actionType === 'VIEW_REFERRAL' ? [{
                  label: '查看详情',
                  variant: 'text' as const,
                  onClick: () => {
                    const targetId = notification.payload?.referralId || notification.actionTargetId;
                    if (onViewReferral && targetId) onViewReferral(String(targetId));
                  }
                }] : []),
                ...(notification.actionType === 'REVIEW_REFERRAL' ? [{
                  label: '查看详情',
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
