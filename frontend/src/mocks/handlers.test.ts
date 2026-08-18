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

