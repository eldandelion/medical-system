import { Referral } from '../types';

// Map active step types directly to their corresponding UI statuses
const ACTIVE_STEP_STATUS_MAP: Record<string, string> = {
  'triage': 'AwaitingTriage',
  'scheduling': 'WaitingForScheduling',
  'evaluation': 'WaitingForAppointment', // Default for evaluation, will be overridden dynamically
  'feedback': 'AwaitingFeedbackApproval',
};

export function enrichReferralStatus(referral: Referral): Referral {
  const steps = referral.extendedData?.steps;

  // Guard Clause: If there are no steps or it's already explicitly rejected, skip processing
  if (!steps || referral.status === 'Rejected') {
    return { ...referral, displayStatus: referral.status };
  }

  // Rule 1: Any active issue in the tracker overrides the status to 'Rejected'
  const hasIssue = steps.some(step => step.status === 'issue');
  if (hasIssue) {
    return { ...referral, displayStatus: 'Rejected' };
  }

  // Rule 2: Derive the status based on the currently active step, falling back to the raw status
  const activeStep = steps.find(step => step.status === 'active');
  let displayStatus = activeStep 
    ? ACTIVE_STEP_STATUS_MAP[activeStep.type] || referral.status
    : referral.status;

  // Rule 3: For evaluation step, if the scheduled time is reached, change status to Pending
  if (activeStep?.type === 'evaluation' && referral.extendedData?.destination?.appointmentTime) {
    const apptTime = new Date(referral.extendedData.destination.appointmentTime).getTime();
    if (Date.now() >= apptTime) {
      displayStatus = 'Pending';
    }
  }

  return { ...referral, displayStatus };
}
