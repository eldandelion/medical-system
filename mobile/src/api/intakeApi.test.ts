import { describe, it, expect, beforeEach, vi } from 'vitest';
import { intakeApi, tokenStorage } from './intakeApi';

describe('intakeApi referral methods', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    tokenStorage.set('test-jwt-token');
  });

  it('getReferrals invokes GET /api/referrals with Authorization header and parses list', async () => {
    const mockReferrals = [
      {
        id: 'ref-1',
        studentId: 3,
        studentName: '李明',
        studentNumber: 'S2023001',
        type: 'INITIAL',
        date: '2026-10-31T10:00:00',
        title: '期中考试后急性焦虑',
        description: '情绪低落、睡眠障碍',
        riskLevel: 'HIGH',
        status: 'WAITING_FOR_APPOINTMENT',
        referredBy: { name: '张辅导员' },
        availableActions: [],
      },
    ];

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockReferrals),
      json: async () => mockReferrals,
    } as Response);

    const result = await intakeApi.getReferrals();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/referrals',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token',
        }),
      })
    );
    expect(result).toEqual(mockReferrals);
  });

  it('getReferralDetails invokes GET /api/referrals/{id}', async () => {
    const mockDetails = {
      baseInfo: {
        id: 'ref-1',
        studentId: 3,
        studentName: '李明',
        studentNumber: 'S2023001',
        type: 'INITIAL',
        date: '2026-10-31T10:00:00',
        title: '期中考试后急性焦虑',
        description: '情绪低落',
        riskLevel: 'HIGH',
        status: 'WAITING_FOR_APPOINTMENT',
        referredBy: { name: '张辅导员' },
        availableActions: [],
      },
      studentDemographics: {
        studentId: 'S2023001',
        school: '计算机学院',
        grade: '大二',
        phone: '13800138000',
      },
      triageInfo: {
        isFirstVisit: true,
        isMedicated: false,
        priorTherapy: '无',
        fullDescription: '详细主诉',
      },
      riskAssessment: {
        ideation: true,
        attempt: false,
        selfHarm: false,
      },
      attachments: [],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockDetails),
      json: async () => mockDetails,
    } as Response);

    const result = await intakeApi.getReferralDetails('ref-1');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/referrals/ref-1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token',
        }),
      })
    );
    expect(result).toEqual(mockDetails);
  });

  it('getReferralTracking invokes GET /api/referrals/{id}/tracking', async () => {
    const mockTracking = {
      destination: {
        hospital: '湘雅附二医院',
        department: '临床心理科',
        doctor: '王医生',
        admin: '张初审',
        transferDate: '2026-10-31',
        appointmentTime: '2026-11-02 09:30',
      },
      steps: [
        {
          id: 'step-1',
          type: 'INITIATION',
          time: '2026-10-31 10:00',
          status: 'COMPLETED',
        },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockTracking),
      json: async () => mockTracking,
    } as Response);

    const result = await intakeApi.getReferralTracking('ref-1');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/referrals/ref-1/tracking',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token',
        }),
      })
    );
    expect(result).toEqual(mockTracking);
  });

  it('throws descriptive Error when API returns HTTP 4xx/5xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: '未授权访问此转诊记录' }),
    } as Response);

    await expect(intakeApi.getReferrals()).rejects.toThrow('未授权访问此转诊记录');
  });
});
