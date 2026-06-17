import { describe, it, expect } from 'vitest';
import { enrichReferralStatus } from './referralUtils';
import { Referral } from '../types';

describe('enrichReferralStatus', () => {
  it('returns the same status if no steps are present', () => {
    const referral = { id: '1', status: 'Pending' } as Referral;
    const result = enrichReferralStatus(referral);
    expect(result.displayStatus).toBe('Pending');
  });

  it('returns Rejected if status is already explicitly Rejected', () => {
    const referral = { 
      id: '1', 
      status: 'Rejected', 
      extendedData: { steps: [{ type: 'triage', status: 'active' }] } 
    } as unknown as Referral;
    const result = enrichReferralStatus(referral);
    expect(result.displayStatus).toBe('Rejected');
  });

  it('returns Rejected if any step has an issue status', () => {
    const referral = { 
      id: '1', 
      status: 'Pending', 
      extendedData: { 
        steps: [
          { type: 'triage', status: 'completed' },
          { type: 'evaluation', status: 'issue' }
        ] 
      } 
    } as unknown as Referral;
    const result = enrichReferralStatus(referral);
    expect(result.displayStatus).toBe('Rejected');
  });

  it('maps active triage step to AwaitingTriage', () => {
    const referral = { 
      id: '1', 
      status: 'Pending', 
      extendedData: { 
        steps: [
          { type: 'triage', status: 'active' }
        ] 
      } 
    } as unknown as Referral;
    const result = enrichReferralStatus(referral);
    expect(result.displayStatus).toBe('AwaitingTriage');
  });

  it('maps active evaluation step to Pending', () => {
    const referral = { 
      id: '1', 
      status: 'AwaitingTriage', 
      extendedData: { 
        steps: [
          { type: 'triage', status: 'completed' },
          { type: 'evaluation', status: 'active' }
        ] 
      } 
    } as unknown as Referral;
    const result = enrichReferralStatus(referral);
    expect(result.displayStatus).toBe('Pending');
  });

  it('falls back to raw status if active step type is unknown', () => {
    const referral = { 
      id: '1', 
      status: 'CustomStatus', 
      extendedData: { 
        steps: [
          { type: 'unknownStep', status: 'active' }
        ] 
      } 
    } as unknown as Referral;
    const result = enrichReferralStatus(referral);
    expect(result.displayStatus).toBe('CustomStatus');
  });
});
