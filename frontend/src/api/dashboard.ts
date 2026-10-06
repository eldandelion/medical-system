import { apiFetch } from './client';

export type ActivityType = 
  | 'REFERRAL_PENDING_TRIAGE'
  | 'REFERRAL_PENDING_SCHEDULING'
  | 'REFERRAL_PENDING_FEEDBACK'
  | 'ASSESSMENT_PENDING_COMPLETION'
  | 'ASSESSMENT_RECENTLY_COMPLETED'
  | 'USER_APPROVAL_PENDING'
  | 'UNREAD_NOTIFICATION';

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
