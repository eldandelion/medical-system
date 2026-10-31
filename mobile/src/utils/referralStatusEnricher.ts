/**
 * Referral Status Enricher
 * Provides desktop parity for calculating current active step and display status
 */

import { ReferralDto, ReferralStepDto, ReferralStatus } from '../api/intakeApi';

export interface EnrichedReferral extends ReferralDto {
  displayStatus: ReferralStatus | string;
}

const ACTIVE_STEP_STATUS_MAP: Record<string, ReferralStatus | string> = {
  REVIEW: 'AWAITING_REVIEW',
  TRIAGE: 'AWAITING_TRIAGE',
  SCHEDULING: 'WAITING_FOR_SCHEDULING',
  EVALUATION: 'WAITING_FOR_APPOINTMENT',
  FEEDBACK: 'AWAITING_FEEDBACK_APPROVAL',
};

/**
 * Enriches a referral's status based on tracking steps and appointment timeline
 */
export function enrichReferralStatus(
  referral: ReferralDto,
  steps?: ReferralStepDto[] | null,
  appointmentTime?: string | null
): EnrichedReferral {
  if (!steps || steps.length === 0 || referral.status === 'REJECTED') {
    return { ...referral, displayStatus: referral.status };
  }

  // Rule 1: Any issue in tracker steps marks the referral as REJECTED
  const hasIssue = steps.some((step) => step.status === 'ISSUE');
  if (hasIssue) {
    return { ...referral, displayStatus: 'REJECTED' };
  }

  // Rule 2: Derive status based on currently active step
  const activeStep = steps.find((step) => step.status === 'ACTIVE');
  let displayStatus: ReferralStatus | string = activeStep
    ? ACTIVE_STEP_STATUS_MAP[activeStep.type] || referral.status
    : referral.status;

  // Rule 3: For evaluation step, check if appointment time has arrived
  if (activeStep?.type === 'EVALUATION' && appointmentTime) {
    const apptTime = new Date(appointmentTime).getTime();
    if (!isNaN(apptTime) && Date.now() >= apptTime) {
      displayStatus = 'PENDING';
    }
  }

  return { ...referral, displayStatus };
}
