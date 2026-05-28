import { http, HttpResponse } from 'msw';
import { mockAssessmentsDb } from './db';

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
  })
];
