import { describe, it, expect } from 'vitest';
import { resolveActivityNavigation } from './activityNavigation';
import { DashboardActivityDto } from '../api/dashboard';

describe('activityNavigation', () => {
  describe('SYSTEM_NOTIFICATION and UNREAD_NOTIFICATION', () => {
    it('routes to Referral Management when notification payload contains referralId for staff', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-sys-1',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 501,
        messageCode: 'REFERRAL_REQUIRES_REVIEW_HC',
        payload: { referralId: 104, studentName: '张三' },
      };

      const result = resolveActivityNavigation(activity, 'head-councillor');
      expect(result.tab).toBe('Referral Management');
      expect(result.entityId).toBe(104);
      expect(result.viewReferralId).toBe(104);
    });

    it('routes to My Records when notification payload contains referralId for student', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-sys-2',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 502,
        messageCode: 'REFERRAL_SCHEDULED_STUDENT',
        payload: { referralId: 202, studentName: '李四' },
      };

      const result = resolveActivityNavigation(activity, 'student');
      expect(result.tab).toBe('My Records');
      expect(result.entityId).toBe(202);
      expect(result.viewReferralId).toBe(202);
    });

    it('routes to Students when notification payload contains studentId for teacher without referralId', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-sys-3',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 503,
        messageCode: 'STUDENT_PROFILE_UPDATED',
        payload: { studentId: 303, studentName: '王五' },
      };

      const result = resolveActivityNavigation(activity, 'teacher');
      expect(result.tab).toBe('Students');
      expect(result.entityId).toBe(303);
      expect(result.viewStudentId).toBe(303);
    });

    it('routes to Referral Management when messageCode starts with REFERRAL_ but no payload referralId', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-sys-4',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 504,
        messageCode: 'REFERRAL_INITIATED',
        payload: {},
      };

      const result = resolveActivityNavigation(activity, 'teacher');
      expect(result.tab).toBe('Referral Management');
    });

    it('routes to Assessments for student when messageCode starts with ASSESSMENT_', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-sys-5',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 505,
        messageCode: 'ASSESSMENT_ASSIGNED_STUDENT',
        payload: {},
      };

      const result = resolveActivityNavigation(activity, 'student');
      expect(result.tab).toBe('Assessments');
    });

    it('falls back to Notifications for generic system notifications', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-sys-6',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 506,
        referenceName: '系统安全提醒',
      };

      const result = resolveActivityNavigation(activity, 'teacher');
      expect(result.tab).toBe('Notifications');
    });
  });

  describe('direct activity types', () => {
    it('routes direct REFERRAL_ activities with referenceId', () => {
      const activity: DashboardActivityDto = {
        id: 'ref-1',
        type: 'REFERRAL_PENDING_TRIAGE',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 88,
        referenceName: '转诊申请',
      };

      const result = resolveActivityNavigation(activity, 'head-councillor');
      expect(result.tab).toBe('Referral Management');
      expect(result.entityId).toBe(88);
      expect(result.viewReferralId).toBe(88);
    });

    it('routes ASSESSMENT_PENDING_COMPLETION to Assessments', () => {
      const activity: DashboardActivityDto = {
        id: 'assess-1',
        type: 'ASSESSMENT_PENDING_COMPLETION',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 99,
        referenceName: 'PHQ_9',
      };

      const result = resolveActivityNavigation(activity, 'student');
      expect(result.tab).toBe('Assessments');
      expect(result.entityId).toBe(99);
    });

    it('routes HIGH_RISK_ASSESSMENT_SUBMITTED to Notifications with studentId if present', () => {
      const activity: DashboardActivityDto = {
        id: 'hr-1',
        type: 'HIGH_RISK_ASSESSMENT_SUBMITTED',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 101,
        payload: { studentId: 12 },
      };

      const result = resolveActivityNavigation(activity, 'teacher');
      expect(result.tab).toBe('Notifications');
      expect(result.viewStudentId).toBe(12);
    });

    it('routes USER_APPROVAL_PENDING to User Management for admin and Staff for head-councillor', () => {
      const activity: DashboardActivityDto = {
        id: 'user-1',
        type: 'USER_APPROVAL_PENDING',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 77,
      };

      expect(resolveActivityNavigation(activity, 'admin').tab).toBe('User Management');
      expect(resolveActivityNavigation(activity, 'head-councillor').tab).toBe('Staff');
    });

    it('routes HOSPITAL_CAPACITY_ALERT to Staff for trial-admin', () => {
      const activity: DashboardActivityDto = {
        id: 'cap-1',
        type: 'HOSPITAL_CAPACITY_ALERT',
        timestamp: '2026-11-10T10:00:00Z',
        referenceId: 66,
      };

      expect(resolveActivityNavigation(activity, 'trial-admin').tab).toBe('Staff');
    });
  });
});
