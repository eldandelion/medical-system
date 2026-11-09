import { describe, it, expect } from 'vitest';
import { mapActivityTypeToUI } from './activityMapper';
import { DashboardActivityDto } from '../api/dashboard';

describe('activityMapper', () => {
  describe('when activity has messageCode', () => {
    it('resolves HIGH_RISK_ASSESSMENT_SUBMITTED title using notification formatter', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-1',
        type: 'HIGH_RISK_ASSESSMENT_SUBMITTED',
        timestamp: '2026-11-09T16:00:00Z',
        referenceId: 101,
        referenceName: null,
        messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER',
        payload: {
          studentName: '李华',
          crisisFlags: '自杀意念',
        },
      };

      const result = mapActivityTypeToUI(activity);
      expect(result.title).toBe('学生 李华 的心理测评结果触发高危预警（自杀意念），请及时关注并干预处理。');
      expect(result.statusText).toBe('高危预警');
      expect(result.statusType).toBe('error');
    });

    it('resolves UNREAD_NOTIFICATION title using notification formatter', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-2',
        type: 'UNREAD_NOTIFICATION',
        timestamp: '2026-11-09T16:05:00Z',
        referenceId: 102,
        referenceName: null,
        messageCode: 'REFERRAL_DOCTOR_ASSIGNED_DOCTOR',
        payload: {
          studentName: '王五',
        },
      };

      const result = mapActivityTypeToUI(activity);
      expect(result.title).toBe('您被分配了一份关于 王五 的转诊申请，请尽快安排就诊时间。');
      expect(result.statusText).toBe('未读');
      expect(result.statusType).toBe('info');
    });

    it('resolves SYSTEM_NOTIFICATION title using notification formatter', () => {
      const activity: DashboardActivityDto = {
        id: 'notif-3',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-09T16:10:00Z',
        referenceId: 103,
        referenceName: null,
        messageCode: 'REFERRAL_NEEDS_TRIAGE_ADMIN',
        payload: {
          studentName: '张三',
        },
      };

      const result = mapActivityTypeToUI(activity);
      expect(result.title).toBe('有一份关于 张三 的新转诊申请，请及时分配医生。');
      expect(result.statusText).toBe('系统');
      expect(result.statusType).toBe('neutral');
    });
  });

  describe('when activity does not have messageCode', () => {
    it('formats REFERRAL_PENDING_TRIAGE with referenceName', () => {
      const activity: DashboardActivityDto = {
        id: 'ref-1',
        type: 'REFERRAL_PENDING_TRIAGE',
        timestamp: '2026-11-09T15:00:00Z',
        referenceId: 201,
        referenceName: '焦虑情绪转诊',
      };

      const result = mapActivityTypeToUI(activity);
      expect(result.title).toBe('转诊单: 焦虑情绪转诊');
      expect(result.statusText).toBe('待分诊');
      expect(result.statusType).toBe('warning');
    });

    it('falls back to 系统通知 when referenceName is null and no messageCode', () => {
      const activity: DashboardActivityDto = {
        id: 'sys-anon',
        type: 'SYSTEM_NOTIFICATION',
        timestamp: '2026-11-09T15:00:00Z',
        referenceId: 301,
        referenceName: null,
      };

      const result = mapActivityTypeToUI(activity);
      expect(result.title).toBe('系统通知');
      expect(result.statusText).toBe('系统');
      expect(result.statusType).toBe('neutral');
    });

    it('formats ASSESSMENT_PENDING_COMPLETION with prefix', () => {
      const activity: DashboardActivityDto = {
        id: 'assess-1',
        type: 'ASSESSMENT_PENDING_COMPLETION',
        timestamp: '2026-11-09T15:00:00Z',
        referenceId: 401,
        referenceName: 'PHQ-9',
      };

      const result = mapActivityTypeToUI(activity);
      expect(result.title).toBe('测评: PHQ-9');
      expect(result.statusText).toBe('待完成');
      expect(result.statusType).toBe('warning');
    });
  });
});
