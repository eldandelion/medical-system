import { describe, it, expect } from 'vitest';
import { enrichReferralStatus } from './referralUtils';
import { Referral } from '../types';

describe('enrichReferralStatus', () => {
  it('returns the same referral if it has no extendedData or appointments', () => {
    const referral = { id: '1', status: 'AwaitingTriage' } as Referral;
    const enriched = enrichReferralStatus(referral);
    expect(enriched.displayStatus).toBe('AwaitingTriage');
  });

  it('returns Rejected if status is already explicitly Rejected', () => {
    const referral = { 
      id: '1', 
      status: 'Rejected'
    } as Referral;
    const result = enrichReferralStatus(referral, [{ type: 'triage', status: 'active' }]);
    expect(result.displayStatus).toBe('Rejected');
  });

  it('returns Rejected if any step has an issue status', () => {
    const referral = { 
      id: '1', 
      status: 'Pending'
    } as Referral;
    const steps = [
      { type: 'triage', status: 'completed' },
      { type: 'evaluation', status: 'issue' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('Rejected');
  });

  it('maps active triage step to AwaitingTriage', () => {
    const referral = { 
      id: '1', 
      status: 'Pending'
    } as Referral;
    const steps = [
      { type: 'triage', status: 'active' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('AwaitingTriage');
  });

  it('maps active evaluation step to Pending if appointment time is reached', () => {
    const referral = { 
      id: '1', 
      status: 'AwaitingTriage'
    } as Referral;
    const steps = [
      { type: 'triage', status: 'completed' },
      { type: 'evaluation', status: 'active' }
    ];
    const result = enrichReferralStatus(referral, steps, '2020-01-01T00:00:00Z');
    expect(result.displayStatus).toBe('Pending');
  });

  it('maps active evaluation step to WaitingForAppointment if appointment time is in future or missing', () => {
    const referral = { 
      id: '1', 
      status: 'AwaitingTriage'
    } as Referral;
    const steps = [
      { type: 'triage', status: 'completed' },
      { type: 'evaluation', status: 'active' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('WaitingForAppointment');
  });

  it('falls back to raw status if active step type is unknown', () => {
    const referral = { 
      id: '1', 
      status: 'CustomStatus'
    } as Referral;
    const steps = [
      { type: 'unknownStep', status: 'active' }
    ];
    const result = enrichReferralStatus(referral, steps);
    expect(result.displayStatus).toBe('CustomStatus');
  });
});
