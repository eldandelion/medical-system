import { apiFetch } from './client';

export type ActivityType = 
  | 'REFERRAL_PENDING_TRIAGE'
  | 'REFERRAL_PENDING_SCHEDULING'
  | 'REFERRAL_PENDING_FEEDBACK'
  | 'REFERRAL_STATUS_UPDATED'
  | 'ASSESSMENT_PENDING_COMPLETION'
  | 'HIGH_RISK_ASSESSMENT_SUBMITTED'
  | 'USER_APPROVAL_PENDING'
  | 'UNREAD_NOTIFICATION'
  | 'SYSTEM_NOTIFICATION'
  | 'HOSPITAL_CAPACITY_ALERT';

export interface DashboardActivityDto {
  id: string;
  type: ActivityType;
  timestamp: string;
  referenceId: number;
  referenceName?: string | null;
}

export interface DashboardActivityFeedDto {
  activities: DashboardActivityDto[];
}

export async function fetchRecentActivity(token: string): Promise<DashboardActivityFeedDto> {
  return apiFetch<DashboardActivityFeedDto>('/api/dashboard/activity', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
