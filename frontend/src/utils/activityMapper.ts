import { DashboardActivityDto, ActivityType } from '../api/dashboard';
import { ActivityStatusType } from '../config/dashboardConfig';
import { TEST_NAME_LABELS } from '../config/referralConstants';
import { getNotificationText } from './notificationText';

export interface UIActivityItem {
  id: string;
  title: string;
  statusText: string;
  statusType: ActivityStatusType;
  timestamp: string;
  originalData: DashboardActivityDto;
}

const COMMON_REFERENCE_LABELS: Record<string, string> = {
  SYSTEM_ALERT: '系统安全提醒',
  STUDENT_RISK: '学生高危预警',
  HOSPITAL_ALERT: '医院号源预警',
};

export function mapActivityTypeToUI(activity: DashboardActivityDto): UIActivityItem {
  const resolvedNotificationText = activity.messageCode
    ? getNotificationText({
        messageCode: activity.messageCode,
        payload: activity.payload,
      })
    : '';

  let resolvedReferenceName = activity.referenceName;
  if (resolvedReferenceName && COMMON_REFERENCE_LABELS[resolvedReferenceName]) {
    resolvedReferenceName = COMMON_REFERENCE_LABELS[resolvedReferenceName];
  }

  let title = resolvedNotificationText || resolvedReferenceName || '系统通知';
  let statusText = '';
  let statusType: ActivityStatusType = 'neutral';

  switch (activity.type) {
    case 'REFERRAL_PENDING_TRIAGE':
      statusText = '待分诊';
      statusType = 'warning';
      title = `转诊单: ${title}`;
      break;
    case 'REFERRAL_PENDING_SCHEDULING':
      statusText = '待排期';
      statusType = 'warning';
      title = `转诊单: ${title}`;
      break;
    case 'REFERRAL_PENDING_FEEDBACK':
      statusText = '待反馈';
      statusType = 'warning';
      title = `转诊单: ${title}`;
      break;
    case 'REFERRAL_STATUS_UPDATED':
      statusText = '状态更新';
      statusType = 'info';
      title = `转诊单: ${title}`;
      break;
    case 'ASSESSMENT_PENDING_COMPLETION': {
      statusText = '待完成';
      statusType = 'warning';
      const scaleName = TEST_NAME_LABELS[title] || title;
      title = `测评: ${scaleName}`;
      break;
    }
    case 'HIGH_RISK_ASSESSMENT_SUBMITTED':
      statusText = '高危预警';
      statusType = 'error';
      break;
    case 'USER_APPROVAL_PENDING':
      statusText = '待审核';
      statusType = 'warning';
      title = `用户注册: ${title}`;
      break;
    case 'UNREAD_NOTIFICATION':
      statusText = '未读';
      statusType = 'info';
      break;
    case 'SYSTEM_NOTIFICATION':
      statusText = '系统';
      statusType = 'neutral';
      break;
    case 'HOSPITAL_CAPACITY_ALERT':
      statusText = '人员饱和';
      statusType = 'error';
      break;
    default:
      statusText = '未知';
      statusType = 'neutral';
  }

  return {
    id: activity.id,
    title,
    statusText,
    statusType,
    timestamp: activity.timestamp,
    originalData: activity,
  };
}
