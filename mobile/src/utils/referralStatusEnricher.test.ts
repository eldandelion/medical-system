import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enrichReferralStatus } from './referralStatusEnricher';
import { ReferralDto, ReferralStepDto } from '../api/intakeApi';

describe('enrichReferralStatus', () => {
  const baseReferral: ReferralDto = {
    id: 'ref-1',
    studentId: 1,
    studentName: '张同学',
    studentNumber: '20230001',
    type: 'INITIAL',
    date: '2026-10-31T09:00:00',
    title: '情绪困扰',
    description: '长期失眠',
    riskLevel: 'MEDIUM',
    status: 'AWAITING_TRIAGE',
    referredBy: { name: '李老师' },
    availableActions: [],
  };

  it('retains original status when steps are empty or null', () => {
    const enrichedNull = enrichReferralStatus(baseReferral, null);
    expect(enrichedNull.displayStatus).toBe('AWAITING_TRIAGE');

    const enrichedEmpty = enrichReferralStatus(baseReferral, []);
    expect(enrichedEmpty.displayStatus).toBe('AWAITING_TRIAGE');
  });

  it('overrides to REJECTED if any step has status ISSUE', () => {
    const steps: ReferralStepDto[] = [
      { id: '1', type: 'INITIATION', time: '2026-10-31 09:00', status: 'COMPLETED' },
      { id: '2', type: 'TRIAGE', time: '2026-10-31 09:30', status: 'ISSUE', reason: '资料不符' },
    ];
    const enriched = enrichReferralStatus(baseReferral, steps);
    expect(enriched.displayStatus).toBe('REJECTED');
  });

  it('maps ACTIVE step type to corresponding status', () => {
    const steps: ReferralStepDto[] = [
      { id: '1', type: 'INITIATION', time: '2026-10-31 09:00', status: 'COMPLETED' },
      { id: '2', type: 'SCHEDULING', time: '2026-10-31 10:00', status: 'ACTIVE' },
    ];
    const enriched = enrichReferralStatus(baseReferral, steps);
    expect(enriched.displayStatus).toBe('WAITING_FOR_SCHEDULING');
  });

  describe('appointment time thresholds for EVALUATION step', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-01T10:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('defaults to WAITING_FOR_APPOINTMENT when appointment time is in future', () => {
      const steps: ReferralStepDto[] = [
        { id: '1', type: 'EVALUATION', time: '2026-11-01 09:00', status: 'ACTIVE' },
      ];
      const futureAppt = '2026-11-02T10:00:00Z';
      const enriched = enrichReferralStatus(baseReferral, steps, futureAppt);
      expect(enriched.displayStatus).toBe('WAITING_FOR_APPOINTMENT');
    });

    it('marks status as PENDING when appointment time is reached or passed', () => {
      const steps: ReferralStepDto[] = [
        { id: '1', type: 'EVALUATION', time: '2026-11-01 09:00', status: 'ACTIVE' },
      ];
      const pastAppt = '2026-10-31T10:00:00Z';
      const enriched = enrichReferralStatus(baseReferral, steps, pastAppt);
      expect(enriched.displayStatus).toBe('PENDING');
    });
  });
});
