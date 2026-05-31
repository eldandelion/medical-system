import { http, HttpResponse } from 'msw';
import { mockAssessmentsDb, mockPsychiatricRecordsDb, mockDashboardDb, mockStudentsDb, mockReferralsDb } from './db';

export const handlers = [
  http.get('/api/assessments', () => {
    return HttpResponse.json(mockAssessmentsDb);
  }),

  http.get('/api/assessments/:id', ({ params }) => {
    const { id } = params;
    const assessment = mockAssessmentsDb.find((a) => a.id === id);
    if (!assessment) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(assessment);
  }),

  http.get('/api/records', () => {
    return HttpResponse.json(mockPsychiatricRecordsDb);
  }),

  http.get('/api/records/:id', ({ params }) => {
    const { id } = params;
    const record = mockPsychiatricRecordsDb.find((r) => r.id === id);
    if (!record) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(record);
  }),

  http.get('/api/dashboard/:role', ({ params }) => {
    const { role } = params;
    const dashboardData = mockDashboardDb[role as string];
    if (!dashboardData) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(dashboardData);
  }),

  http.get('/api/students', () => {
    return HttpResponse.json(mockStudentsDb);
  }),

  http.get('/api/referrals', () => {
    return HttpResponse.json(mockReferralsDb);
  }),

  http.get('/api/referrals/:id', ({ params }) => {
    const { id } = params;
    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(referral);
  })
];
