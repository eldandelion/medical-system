import { describe, it, expect } from 'vitest';
import { getTargetTabForStatus } from './referralRouting';

describe('getTargetTabForStatus', () => {
  it('routes CLOSED and AWAITING_FEEDBACK_APPROVAL to feedback tab', () => {
    expect(getTargetTabForStatus('CLOSED')).toBe('feedback');
    expect(getTargetTabForStatus('AWAITING_FEEDBACK_APPROVAL')).toBe('feedback');
    expect(getTargetTabForStatus('WAITING_FOR_APPOINTMENT', true)).toBe('feedback');
  });

  it('routes operational progress statuses to tracker tab', () => {
    const progressStatuses = [
      'AWAITING_APPROVAL',
      'AWAITING_REVIEW',
      'AWAITING_TRIAGE',
      'WAITING_FOR_SCHEDULING',
      'WAITING_FOR_APPOINTMENT',
      'NEEDS_REASSIGNMENT',
      'PENDING',
    ];

    for (const status of progressStatuses) {
      expect(getTargetTabForStatus(status)).toBe('tracker');
    }
  });

  it('falls back to overview tab for other statuses', () => {
    expect(getTargetTabForStatus('DRAFT')).toBe('overview');
    expect(getTargetTabForStatus('RECALLED')).toBe('overview');
    expect(getTargetTabForStatus('UNKNOWN_STATUS')).toBe('overview');
    expect(getTargetTabForStatus(undefined)).toBe('overview');
  });
});
