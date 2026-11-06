/**
 * Referral Details Tab Routing Helper
 */

import { ReferralStatus } from '../api/intakeApi';

export type ReferralDetailsTab = 'overview' | 'tracker' | 'feedback';

const TRACKER_STATUSES = new Set<string>([
  'AWAITING_APPROVAL',
  'AWAITING_REVIEW',
  'AWAITING_TRIAGE',
  'WAITING_FOR_SCHEDULING',
  'WAITING_FOR_APPOINTMENT',
  'NEEDS_REASSIGNMENT',
  'PENDING',
]);

const FEEDBACK_STATUSES = new Set<string>([
  'AWAITING_FEEDBACK_APPROVAL',
  'CLOSED',
]);

/**
 * Maps referral status or data state to appropriate details tab
 */
export function getTargetTabForStatus(
  status?: ReferralStatus | string,
  hasFeedback = false
): ReferralDetailsTab {
  if (hasFeedback || (status && FEEDBACK_STATUSES.has(status))) {
    return 'feedback';
  }
  if (status && TRACKER_STATUSES.has(status)) {
    return 'tracker';
  }
  return 'overview';
}
