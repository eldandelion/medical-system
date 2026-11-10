import { describe, it, expect } from 'vitest';
import { getNotificationText, formatCrisisFlags } from './notificationText';

describe('notificationText', () => {
  describe('formatCrisisFlags', () => {
    it('translates raw enum strings to localized Chinese separated by dunhao', () => {
      expect(formatCrisisFlags('SUICIDAL_IDEATION, SELF_HARM')).toBe('自杀意念、自残行为');
      expect(formatCrisisFlags('SUICIDAL_IDEATION, SUICIDE_ATTEMPT')).toBe('自杀意念、自杀企图');
      expect(formatCrisisFlags('SUBSTANCE_ABUSE, HIGH_RISK_FLAG')).toBe('物质滥用、高危预警标识');
    });

    it('translates string array of enums', () => {
      expect(formatCrisisFlags(['SUICIDAL_IDEATION', 'SELF_HARM'])).toBe('自杀意念、自残行为');
    });

    it('preserves already translated or custom flags', () => {
      expect(formatCrisisFlags('自杀意念')).toBe('自杀意念');
      expect(formatCrisisFlags('重度自伤倾向')).toBe('重度自伤倾向');
    });

    it('returns empty string for null, undefined, or empty flags', () => {
      expect(formatCrisisFlags(undefined)).toBe('');
      expect(formatCrisisFlags('')).toBe('');
      expect(formatCrisisFlags([])).toBe('');
    });
  });

  describe('referral notification codes', () => {
    it('formats REFERRAL_INITIATED and REFERRAL_STATUS_CHANGED', () => {
      expect(
        getNotificationText({
          messageCode: 'REFERRAL_INITIATED',
          payload: { studentName: '赵小明' },
        })
      ).toBe('关于 赵小明 的新转诊申请已发起，等待后续处理。');

      expect(
        getNotificationText({
          messageCode: 'REFERRAL_STATUS_CHANGED',
          payload: { studentName: '赵小明' },
        })
      ).toBe('关于 赵小明 的转诊申请状态已发生变更，请进入系统查看最新进展。');
    });

    it('formats APPOINTMENT_SCHEDULED and EVALUATION_COMPLETED', () => {
      expect(
        getNotificationText({
          messageCode: 'APPOINTMENT_SCHEDULED',
          payload: { studentName: '钱小华' },
        })
      ).toBe('医生已为 钱小华 安排了预约就诊时间。');

      expect(
        getNotificationText({
          messageCode: 'EVALUATION_COMPLETED',
          payload: { studentName: '钱小华' },
        })
      ).toBe('医生已完成对 钱小华 的就诊评估与随访建议。');
    });

    it('formats REFERRAL_SUBMITTED_STUDENT with default initiator', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_SUBMITTED_STUDENT',
        payload: {},
      });
      expect(text).toBe('由 教师 发起的转诊申请已成功提交。');
    });

    it('formats REFERRAL_SUBMITTED_STUDENT with custom initiator', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_SUBMITTED_STUDENT',
        payload: { initiatorName: '张老师' },
      });
      expect(text).toBe('由 张老师 发起的转诊申请已成功提交。');
    });

    it('formats REFERRAL_SUBMITTED_INITIATOR with student name', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_SUBMITTED_INITIATOR',
        payload: { studentName: '张三' },
      });
      expect(text).toBe('您为 张三 发起的转诊申请已成功记录，并进入后续评估流程。');
    });

    it('formats REFERRAL_REQUIRES_REVIEW_HC', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_REQUIRES_REVIEW_HC',
        payload: { studentName: '李四', initiatorName: '王老师' },
      });
      expect(text).toBe('由 王老师 为 李四 发起的转诊申请需要您审核。');
    });

    it('formats REFERRAL_CREATED_FOR_STUDENT_TEACHER', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_CREATED_FOR_STUDENT_TEACHER',
        payload: { studentName: '赵六', initiatorName: '王主任' },
      });
      expect(text).toBe('心理咨询师 王主任 为您的学生 赵六 发起了转诊申请。');
    });

    it('formats REFERRAL_APPROVED_BY_HC_TEACHER and REFERRAL_APPROVED_BY_HC_STUDENT', () => {
      expect(
        getNotificationText({
          messageCode: 'REFERRAL_APPROVED_BY_HC_TEACHER',
          payload: { studentName: '钱七' },
        })
      ).toBe('转诊中心已审核通过 钱七 的转诊申请，正在等待医院分诊。');

      expect(
        getNotificationText({
          messageCode: 'REFERRAL_APPROVED_BY_HC_STUDENT',
          payload: { studentName: '钱七' },
        })
      ).toBe('转诊中心已审核通过 钱七 的转诊申请，正在等待医院分诊。');
    });

    it('formats REFERRAL_NEEDS_TRIAGE_ADMIN', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_NEEDS_TRIAGE_ADMIN',
        payload: { studentName: '孙八' },
      });
      expect(text).toBe('有一份关于 孙八 的新转诊申请，请及时分配医生。');
    });

    it('formats REFERRAL_DOCTOR_ASSIGNED_DOCTOR', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_DOCTOR_ASSIGNED_DOCTOR',
        payload: { studentName: '周九' },
      });
      expect(text).toBe('您被分配了一份关于 周九 的转诊申请，请尽快安排就诊时间。');
    });

    it('formats REFERRAL_DOCTOR_ASSIGNED for teacher, student, and hc', () => {
      ['REFERRAL_DOCTOR_ASSIGNED_TEACHER', 'REFERRAL_DOCTOR_ASSIGNED_STUDENT', 'REFERRAL_DOCTOR_ASSIGNED_HC'].forEach(
        (code) => {
          expect(
            getNotificationText({
              messageCode: code,
              payload: { studentName: '吴十' },
            })
          ).toBe('吴十 的转诊申请已分配医生，正在等待排期。');
        }
      );
    });

    it('formats REFERRAL_SCHEDULED codes', () => {
      [
        'REFERRAL_SCHEDULED_STUDENT',
        'REFERRAL_SCHEDULED_TEACHER',
        'REFERRAL_SCHEDULED_HC',
        'REFERRAL_SCHEDULED_ADMIN',
      ].forEach((code) => {
        expect(
          getNotificationText({
            messageCode: code,
            payload: { studentName: '郑十一' },
          })
        ).toBe('医生已为 郑十一 安排了就诊时间。');
      });
    });

    it('formats REFERRAL_FEEDBACK_SUBMITTED_HC', () => {
      const text = getNotificationText({
        messageCode: 'REFERRAL_FEEDBACK_SUBMITTED_HC',
        payload: { studentName: '王十二' },
      });
      expect(text).toBe('医生已提交 王十二 的就诊反馈，请审核。');
    });

    it('formats REFERRAL_FEEDBACK_SUBMITTED for others', () => {
      [
        'REFERRAL_FEEDBACK_SUBMITTED_TEACHER',
        'REFERRAL_FEEDBACK_SUBMITTED_ADMIN',
        'REFERRAL_FEEDBACK_SUBMITTED_STUDENT',
      ].forEach((code) => {
        expect(
          getNotificationText({
            messageCode: code,
            payload: { studentName: '王十二' },
          })
        ).toBe('医生已提交 王十二 的就诊反馈。');
      });
    });

    it('formats REFERRAL_CLOSED, REJECTED, REASSIGNMENT, and RECALLED', () => {
      expect(
        getNotificationText({
          messageCode: 'REFERRAL_CLOSED_TEACHER',
          payload: { studentName: '冯十三' },
        })
      ).toBe('冯十三 的转诊流程已完成并关闭。');

      expect(
        getNotificationText({
          messageCode: 'REFERRAL_REJECTED_TEACHER',
          payload: { studentName: '陈十四' },
        })
      ).toBe('关于 陈十四 的转诊申请已被拒绝。');

      expect(
        getNotificationText({
          messageCode: 'REFERRAL_NEEDS_REASSIGNMENT_ADMIN',
          payload: { studentName: '褚十五' },
        })
      ).toBe('医生要求重新分配 褚十五 的转诊申请，请处理。');

      expect(
        getNotificationText({
          messageCode: 'REFERRAL_RECALLED_HC',
          payload: { studentName: '卫十六' },
        })
      ).toBe('关于 卫十六 的转诊申请已被撤回。');
    });
  });

  describe('assessment notification codes', () => {
    it('formats ASSESSMENT_HIGH_RISK_ALERT with crisis flags', () => {
      ['ASSESSMENT_HIGH_RISK_ALERT_HC', 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER'].forEach((code) => {
        expect(
          getNotificationText({
            messageCode: code,
            payload: { studentName: '蒋十七', crisisFlags: '自杀意念' },
          })
        ).toBe('学生 蒋十七 的心理测评结果触发高危预警（自杀意念），请及时关注并干预处理。');
      });
    });

    it('translates raw backend enum crisis flags in ASSESSMENT_HIGH_RISK_ALERT', () => {
      expect(
        getNotificationText({
          messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER',
          payload: { studentName: '蒋十七', crisisFlags: 'SUICIDAL_IDEATION, SELF_HARM' },
        })
      ).toBe('学生 蒋十七 的心理测评结果触发高危预警（自杀意念、自残行为），请及时关注并干预处理。');
    });

    it('formats ASSESSMENT_HIGH_RISK_ALERT without crisis flags', () => {
      expect(
        getNotificationText({
          messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER',
          payload: { studentName: '蒋十七' },
        })
      ).toBe('学生 蒋十七 的心理测评结果触发高危预警，请及时关注并干预处理。');
    });

    it('formats ASSESSMENT_ASSIGNED_STUDENT and ASSESSMENT_COMPLETED_TEACHER', () => {
      expect(
        getNotificationText({
          messageCode: 'ASSESSMENT_ASSIGNED_STUDENT',
          payload: {},
        })
      ).toBe('您收到了一项新的心理健康测评任务，请及时前往完成测评。');

      expect(
        getNotificationText({
          messageCode: 'ASSESSMENT_COMPLETED_TEACHER',
          payload: { studentName: '沈十八' },
        })
      ).toBe('您的学生 沈十八 已完成心理健康测评。');
    });
  });

  describe('edge cases and fallbacks', () => {
    it('handles missing studentName by defaulting to 未知学生', () => {
      expect(
        getNotificationText({
          messageCode: 'REFERRAL_SUBMITTED_INITIATOR',
          payload: {},
        })
      ).toBe('您为 未知学生 发起的转诊申请已成功记录，并进入后续评估流程。');
    });

    it('handles missing initiatorName by defaulting to 教师', () => {
      expect(
        getNotificationText({
          messageCode: 'REFERRAL_REQUIRES_REVIEW_HC',
          payload: { studentName: '测试' },
        })
      ).toBe('由 教师 为 测试 发起的转诊申请需要您审核。');
    });

    it('formats unmapped code by replacing underscores with spaces', () => {
      expect(
        getNotificationText({
          messageCode: 'SOME_UNKNOWN_CODE',
          payload: {},
        })
      ).toBe('SOME UNKNOWN CODE');
    });

    it('returns empty string if messageCode is missing or undefined', () => {
      expect(getNotificationText(undefined)).toBe('');
      expect(getNotificationText({})).toBe('');
      expect(getNotificationText({ messageCode: '' })).toBe('');
    });
  });
});
