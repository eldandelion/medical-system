import { Referral } from '../types';

// Map active step types directly to their corresponding UI statuses
const ACTIVE_STEP_STATUS_MAP: Record<string, string> = {
  'REVIEW': 'AWAITING_REVIEW',
  'TRIAGE': 'AWAITING_TRIAGE',
  'SCHEDULING': 'WAITING_FOR_SCHEDULING',
  'EVALUATION': 'WAITING_FOR_APPOINTMENT', // Default for evaluation, will be overridden dynamically
  'FEEDBACK': 'AWAITING_FEEDBACK_APPROVAL',
};

export function enrichReferralStatus(
  referral: Referral,
  steps?: any[],
  appointmentTime?: string
): Referral {
  // Guard Clause: If there are no steps or it's already explicitly rejected, skip processing
  if (!steps || referral.status === 'REJECTED') {
    return { ...referral, displayStatus: referral.status };
  }

  // Rule 1: Any active issue in the tracker overrides the status to 'REJECTED'
  const hasIssue = steps.some(step => step.status === 'ISSUE');
  if (hasIssue) {
    return { ...referral, displayStatus: 'REJECTED' };
  }

  // Rule 2: Derive the status based on the currently active step, falling back to the raw status
  const activeStep = steps.find(step => step.status === 'ACTIVE');
  let displayStatus = activeStep 
    ? ACTIVE_STEP_STATUS_MAP[activeStep.type] || referral.status
    : referral.status;

  // Rule 3: For evaluation step, if the scheduled time is reached, change status to Pending
  if (activeStep?.type === 'EVALUATION' && appointmentTime) {
    const apptTime = new Date(appointmentTime).getTime();
    if (Date.now() >= apptTime) {
      displayStatus = 'PENDING';
    }
  }

  return { ...referral, displayStatus };
}
