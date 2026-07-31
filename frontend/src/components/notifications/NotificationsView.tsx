import React from 'react';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDto } from '../../api/notifications';

interface NotificationsViewProps {
  onViewReferral?: (referralId: string) => void;
}

// Helper to translate message codes to readable Chinese text
const getNotificationText = (notification: NotificationDto) => {
  switch (notification.messageCode) {
    case 'REFERRAL_SUBMITTED_STUDENT':
      return `您的转诊申请已提交。风险等级评估为: ${notification.messageArgs[0] || '未知'}`;
    case 'REFERRAL_SUBMITTED_INITIATOR': {
      const studentName = notification.messageArgs[0] || '';
      return (
        <span>您为 <span className="font-medium text-[var(--md-sys-color-on-surface)]">{studentName}</span> 发起的转诊申请已成功记录，并进入后续评估流程。</span>
      );
    }
    case 'REFERRAL_REQUIRES_REVIEW_HC':
      return `有新的转诊申请需要审核(学生ID: ${notification.messageArgs[0] || ''})。风险等级: ${notification.messageArgs[1] || '未知'}`;
    default:
      return notification.messageCode.replace(/_/g, ' ');
  }
};

const getNotificationTitle = (notification: NotificationDto) => {
  if (notification.messageCode === 'REFERRAL_SUBMITTED_INITIATOR') return '转诊申请提交成功';
  if (notification.messageCode.includes('SUBMITTED')) return '转诊申请已提交';
  if (notification.messageCode.includes('REVIEW')) return '待审核转诊申请';
  return '新通知';
};

export function NotificationsView({ onViewReferral }: NotificationsViewProps) {
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
              icon={notification.actionType === 'REVIEW_REFERRAL' ? 'assignment_turned_in' : 'info'}
              iconBgColor={notification.isRead ? 'var(--md-sys-color-surface-variant)' : 'var(--md-sys-color-secondary-container)'}
              iconTextColor={notification.isRead ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-secondary-container)'}
              header={getNotificationTitle(notification)}
              time={new Date(notification.createdAt).toLocaleString()}
              body={getNotificationText(notification)}
              actions={[
                ...(notification.actionType === 'VIEW_REFERRAL' ? [{
                  label: '查看详情',
                  variant: 'text' as const,
                  onClick: () => onViewReferral && notification.actionTargetId && onViewReferral(String(notification.actionTargetId))
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
