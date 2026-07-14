import { describe, it, expect } from 'vitest';
import { enrichReferralStatus } from './referralUtils';
import { Referral } from '../types';

describe('enrichReferralStatus', () => {
  it('returns the same referral if it has no extendedData or appointments', () => {
    const referral = { id: '1', status: 'AWAITING_TRIAGE' } as Referral;
    const enriched = enrichReferralStatus(referral);
    expect(enriched.displayStatus).toBe('AWAITING_TRIAGE');
  });

  it('returns Rejected if status is already explicitly Rejected', () => {
    const referral = { 
      id: '1', 
      status: 'REJECTED'
    } as Referral;
    const result = enrichReferralStatus(referral, [{ type: 'TRIAGE', status: 'ACTIVE' }]);
    expect(result.displayStatus).toBe('REJECTED');
  });

  it('returns Rejected if any step has an issue status', () => {
    const referral = { 
      id: '1', 
      status: 'PENDING'
    } as unknown as Referral;
    const steps = [
      { type: 'TRIAGE', status: 'COMPLETED' },
      { type: 'EVALUATION', status: 'ISSUE' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('REJECTED');
  });

  it('maps active triage step to AwaitingTriage', () => {
    const referral = { 
      id: '1', 
      status: 'PENDING'
    } as unknown as Referral;
    const steps = [
      { type: 'TRIAGE', status: 'ACTIVE' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('AWAITING_TRIAGE');
  });

  it('maps active evaluation step to Pending if appointment time is reached', () => {
    const referral = { 
      id: '1', 
      status: 'AWAITING_TRIAGE'
    } as Referral;
    const steps = [
      { type: 'TRIAGE', status: 'COMPLETED' },
      { type: 'EVALUATION', status: 'ACTIVE' }
    ];
    const result = enrichReferralStatus(referral, steps, '2020-01-01T00:00:00Z');
    expect(result.displayStatus).toBe('PENDING');
  });

  it('maps active evaluation step to WaitingForAppointment if appointment time is in future or missing', () => {
    const referral = { 
      id: '1', 
      status: 'AWAITING_TRIAGE'
    } as Referral;
    const steps = [
      { type: 'TRIAGE', status: 'COMPLETED' },
      { type: 'EVALUATION', status: 'ACTIVE' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('WAITING_FOR_APPOINTMENT');
  });

  it('falls back to raw status if active step type is unknown', () => {
    const referral = { 
      id: '1', 
      status: 'CustomStatus'
    } as unknown as Referral;
    const steps = [
      { type: 'unknownStep', status: 'ACTIVE' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('CustomStatus');
  });
});
