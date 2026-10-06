import { DashboardActivityDto, ActivityType } from '../api/dashboard';
import { ActivityStatusType } from '../config/dashboardConfig';

export interface UIActivityItem {
  id: string;
  title: string;
  statusText: string;
  statusType: ActivityStatusType;
  timestamp: string;
  originalData: DashboardActivityDto;
}

export function mapActivityTypeToUI(activity: DashboardActivityDto): UIActivityItem {
  let title = activity.referenceName || '系统通知';
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
    case 'ASSESSMENT_PENDING_COMPLETION':
      statusText = '待完成';
      statusType = 'warning';
      title = `测评: ${title}`;
      break;
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
