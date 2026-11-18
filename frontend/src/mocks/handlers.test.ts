import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { mockReferralsDb } from './db';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('MSW Handlers - Referrals', () => {
  it('should return complete ReferralDetails including triageInfo on fallback', async () => {
    // Get a valid referral ID from the mock DB
    const testReferralId = mockReferralsDb[0].id;
    
    // We fetch the referral details endpoint (JSDOM default origin is localhost:3000)
    const response = await fetch(`http://localhost:3000/api/referrals/${testReferralId}`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // Validate that the fallback correctly populates baseInfo
    expect(data.baseInfo).toBeDefined();
    expect(data.baseInfo.id).toBe(testReferralId);
    
    // Validate that triageInfo and riskAssessment are populated
    expect(data.triageInfo).toBeDefined();
    expect(data.triageInfo.fullDescription).toBe(data.baseInfo.description);
    
    expect(data.riskAssessment).toBeDefined();
    
    // Validate demographics
    expect(data.studentDemographics).toBeDefined();
    expect(data.studentDemographics.school).toBe('计算机科学与技术学院');

    // Validate attachments
    expect(data.attachments).toBeDefined();
    expect(Array.isArray(data.attachments)).toBe(true);
  });
});

describe('MSW Handlers - Assessments', () => {
  it('should return assessment catalog with psychometric scale definitions', async () => {
    const response = await fetch('http://localhost:3000/api/assessments/catalog');
    expect(response.status).toBe(200);

    const catalog = await response.json();
    expect(Array.isArray(catalog)).toBe(true);
    expect(catalog.length).toBeGreaterThanOrEqual(5);

    const phq9 = catalog.find((item: any) => item.batteryCode === 'PHQ_9');
    expect(phq9).toBeDefined();
    expect(phq9.title).toContain('情绪状况评估');
    expect(phq9.questionCount).toBe(9);
  });

  it('should return assessments list for student', async () => {
    const response = await fetch('http://localhost:3000/api/assessments');
    expect(response.status).toBe(200);

    const assessments = await response.json();
    expect(Array.isArray(assessments)).toBe(true);
    expect(assessments.length).toBeGreaterThan(0);
  });

  it('should assign assessments to student successfully', async () => {
    const response = await fetch('http://localhost:3000/api/assessments/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: '101',
        batteryCode: 'PHQ_9'
      })
    });
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.batteryCode).toBe('PHQ_9');
  });

  it('should submit assessment answers successfully', async () => {
    const response = await fetch('http://localhost:3000/api/assessments/1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: [
          { questionId: 'phq9_1', selectedValue: 1 },
          { questionId: 'phq9_2', selectedValue: 2 }
        ]
      })
    });
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.totalQuestionsAnswered).toBe(2);
  });
});

describe('MSW Handlers - Admin Governance', () => {
  it('should fetch admin users list with role and status filtering', async () => {
    const response = await fetch('http://localhost:3000/api/admin/users?role=TEACHER');
    expect(response.status).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.every((u: any) => u.role === 'TEACHER')).toBe(true);
  });

  it('should update user account status and manage soft deletion', async () => {
    const response = await fetch('http://localhost:3000/api/admin/users/2/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DISABLED' })
    });
    expect(response.status).toBe(200);

    const updated = await response.json();
    expect(updated.status).toBe('DISABLED');
  });

  it('should toggle assessment catalog scale availability', async () => {
    const response = await fetch('http://localhost:3000/api/assessments/catalog/PHQ_9/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: false })
    });
    expect(response.status).toBe(200);

    const updated = await response.json();
    expect(updated.isEnabled).toBe(false);
  });

  it('should cancel referral and transition to CLOSED', async () => {
    const testId = mockReferralsDb[0].id;
    const response = await fetch(`http://localhost:3000/api/referrals/${testId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Admin cancelled' })
    });
    expect(response.status).toBe(200);

    const cancelled = await response.json();
    expect(cancelled.status).toBe('CLOSED');
  });
});

describe('MSW Handlers - Teachers & Student Assignment', () => {
  it('should reject unauthorized roles with 403 on /api/teachers', async () => {
    const res = await fetch('http://localhost:3000/api/teachers', {
      headers: { Authorization: 'Bearer mock_teacher_token_zhang' }
    });
    expect(res.status).toBe(403);
  });

  it('should list teachers with assignedStudentCount and fetch teacher detail caseload', async () => {
    // Ensure teacher 2 is ACTIVE (previous admin governance test sets id 2 to DISABLED)
    await fetch('http://localhost:3000/api/admin/users/2/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' })
    });

    const listRes = await fetch('http://localhost:3000/api/teachers', {
      headers: { Authorization: 'Bearer mock_head_councillor_token_wang' }
    });
    expect(listRes.status).toBe(200);
    const teachers = await listRes.json();
    expect(Array.isArray(teachers)).toBe(true);
    const teacher2 = teachers.find((t: any) => t.id === 2);
    expect(teacher2).toBeDefined();
    expect(teacher2.assignedStudentCount).toBeGreaterThanOrEqual(2);

    const detailRes = await fetch('http://localhost:3000/api/teachers/2', {
      headers: { Authorization: 'Bearer mock_admin_token' }
    });
    expect(detailRes.status).toBe(200);
    const detail = await detailRes.json();
    expect(detail.id).toBe(2);
    expect(Array.isArray(detail.assignedStudents)).toBe(true);
    expect(detail.assignedStudents.every((s: any) => s.assignedTeacherId === 2)).toBe(true);
  });

  it('should assign and unassign students and return 409 for inactive teacher or mismatched unassign', async () => {
    await fetch('http://localhost:3000/api/admin/users/2/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' })
    });

    // Assign student 3 (unassigned) to teacher 2
    const assignRes = await fetch('http://localhost:3000/api/teachers/2/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock_head_councillor_token_wang'
      },
      body: JSON.stringify({ studentIds: [3] })
    });
    expect(assignRes.status).toBe(200);
    const assignBody = await assignRes.json();
    expect(assignBody.assignedCount).toBe(1);
    expect(assignBody.assignedStudentIds).toEqual([3]);

    // Pending teacher 9 should return 409 Conflict
    const pendingRes = await fetch('http://localhost:3000/api/teachers/9/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock_admin_token'
      },
      body: JSON.stringify({ studentIds: [3] })
    });
    expect(pendingRes.status).toBe(409);

    // Unassign student 3 from teacher 2
    const unassignRes = await fetch('http://localhost:3000/api/teachers/2/students/3', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer mock_admin_token' }
    });
    expect(unassignRes.status).toBe(200);
    const unassignBody = await unassignRes.json();
    expect(unassignBody.success).toBe(true);
    expect(unassignBody.unassignedStudentId).toBe(3);

    // Unassigning again returns 409 Conflict
    const mismatchRes = await fetch('http://localhost:3000/api/teachers/2/students/3', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer mock_admin_token' }
    });
    expect(mismatchRes.status).toBe(409);
  });
});

describe('MSW Handlers - SMS Auth', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('send-code LOGIN enforces phone lookup, active account status, and REGISTRATION duplicate checks', async () => {
    // Active student
    const studentRes = await fetch('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', purpose: 'LOGIN' }),
    });
    expect(studentRes.status).toBe(200);
    expect(await studentRes.json()).toEqual({
      phone: '13800138000',
      devCode: '123456',
      expiresInSeconds: 300,
    });

    // Unregistered phone -> 404
    const missingRes = await fetch('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13999999999', purpose: 'LOGIN' }),
    });
    expect(missingRes.status).toBe(404);

    // Disabled and pending accounts -> 401
    for (const phone of ['13800138055', '13800138099']) {
      const inactiveRes = await fetch('http://localhost:3000/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'LOGIN' }),
      });
      expect(inactiveRes.status).toBe(401);
    }

    // Registration with existing phone -> 409; unregistered -> 200
    const conflictRes = await fetch('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', purpose: 'REGISTRATION' }),
    });
    expect(conflictRes.status).toBe(409);

    const newRegRes = await fetch('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13999999999', purpose: 'REGISTRATION' }),
    });
    expect(newRegRes.status).toBe(200);
  });

  it('login-sms returns full AuthResponse matching role and rejects unregistered/inactive accounts', async () => {
    // Active student (李明)
    const stuRes = await fetch('http://localhost:3000/api/auth/login-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138000', code: '123456' }),
    });
    expect(stuRes.status).toBe(200);
    const stuBody = await stuRes.json();
    expect(stuBody.role).toBe('STUDENT');
    expect(stuBody.userId).toBe(7);
    expect(stuBody.email).toBe('liming@univ.edu.cn');
    expect(stuBody.name).toBe('李明');
    expect(stuBody.student?.studentNumber).toBe('S2023001');

    // Active teacher (艾米丽·沃森) -> student must be null
    const teacherRes = await fetch('http://localhost:3000/api/auth/login-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138002', code: '123456' }),
    });
    expect(teacherRes.status).toBe(200);
    const teacherBody = await teacherRes.json();
    expect(teacherBody.role).toBe('TEACHER');
    expect(teacherBody.name).toBe('艾米丽·沃森');
    expect(teacherBody.student).toBeNull();

    // Unregistered -> 404
    const notFoundRes = await fetch('http://localhost:3000/api/auth/login-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13999999999', code: '123456' }),
    });
    expect(notFoundRes.status).toBe(404);

    // Disabled -> 401
    const disabledRes = await fetch('http://localhost:3000/api/auth/login-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800138055', code: '123456' }),
    });
    expect(disabledRes.status).toBe(401);
  });

  it('forwards live backend 404 responses instead of masking them with mock data', async () => {
    vi.stubEnv('MODE', 'development');
    server.close();
    const fetchSpy = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: '该手机号码尚未登记，请先创建账号' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    const prevFetch = globalThis.fetch;
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    server.listen({ onUnhandledRequest: 'error' });

    try {
      for (const [url, payload] of [
        ['http://localhost:3000/api/auth/send-code', { phone: '13800138000', purpose: 'LOGIN' }],
        ['http://localhost:3000/api/auth/verify-code', { phone: '13800138000', code: '123456', purpose: 'LOGIN' }],
        ['http://localhost:3000/api/auth/login-sms', { phone: '13800138000', code: '123456' }],
      ] as const) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toBe('该手机号码尚未登记，请先创建账号');
      }

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    } finally {
      server.close();
      globalThis.fetch = prevFetch;
      server.listen({ onUnhandledRequest: 'error' });
    }
  });
});


