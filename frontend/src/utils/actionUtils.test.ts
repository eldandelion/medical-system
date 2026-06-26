import { describe, it, expect } from 'vitest';
import { computeAvailableActions } from './actionUtils';
import { Referral } from '../types';

describe('computeAvailableActions', () => {
  const createMockReferral = (status: string, rejectedBy?: string[]): Referral => ({
    id: '1',
    studentName: 'Test',
    studentNumber: '123',
    type: 'Test',
    date: '2023-01-01',
    title: 'Test',
    description: 'Test',
    riskLevel: 'Low',
    status: status as any,
    extendedData: {
      rejectedBy
    } as any
  });

  describe('Teacher Role', () => {
    const authHeader = 'Bearer teacher_token_zhang';

    it('returns recreate and delete_draft for Draft status', () => {
      const actions = computeAvailableActions(createMockReferral('Draft'), authHeader);
      expect(actions).toEqual(['recreate', 'delete_draft']);
    });

    it('returns recreate for Recalled status', () => {
      const actions = computeAvailableActions(createMockReferral('Recalled'), authHeader);
      expect(actions).toEqual(['recreate']);
    });

    it('returns recall_referral for AwaitingApproval status', () => {
      const actions = computeAvailableActions(createMockReferral('AwaitingApproval'), authHeader);
      expect(actions).toEqual(['recall_referral']);
    });
  });

  describe('Head Councillor Role', () => {
    const authHeader = 'Bearer head_councillor_token';

    it('returns approve_referral and reject_referral for AwaitingApproval', () => {
      const actions = computeAvailableActions(createMockReferral('AwaitingApproval'), authHeader);
      expect(actions).toEqual(['approve_referral', 'reject_referral']);
    });

    it('returns acknowledge_feedback for AwaitingFeedbackApproval', () => {
      const actions = computeAvailableActions(createMockReferral('AwaitingFeedbackApproval'), authHeader);
      expect(actions).toEqual(['acknowledge_feedback']);
    });
  });

  describe('Trial Admin Role', () => {
    const authHeader = 'Bearer trial_admin_token';

    it('returns assign_doctor and reject_referral for AwaitingTriage', () => {
      const actions = computeAvailableActions(createMockReferral('AwaitingTriage'), authHeader);
      expect(actions).toEqual(['assign_doctor', 'reject_referral']);
    });

    it('returns reassign_doctor and reject_referral for AwaitingTriage if rejected by doctor', () => {
      const actions = computeAvailableActions(createMockReferral('AwaitingTriage', ['李医生']), authHeader);
      expect(actions).toEqual(['reassign_doctor', 'reject_referral']);
    });
    
    it('returns empty for Rejected if completely rejected', () => {
      const actions = computeAvailableActions(createMockReferral('Rejected', ['Head Councillor']), authHeader);
      expect(actions).toEqual([]);
    });
  });

  describe('Doctor Role', () => {
    const authHeader = 'Bearer doctor_token';

    it('returns schedule_appointment and reject_referral for WaitingForScheduling', () => {
      const actions = computeAvailableActions(createMockReferral('WaitingForScheduling'), authHeader);
      expect(actions).toEqual(['schedule_appointment', 'reject_referral']);
    });

    it('returns write_feedback and report_problem for WaitingForAppointment', () => {
      const actions = computeAvailableActions(createMockReferral('WaitingForAppointment'), authHeader);
      expect(actions).toEqual(['write_feedback', 'report_problem']);
    });
  });
});
