import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
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


