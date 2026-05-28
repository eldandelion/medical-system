import { http, HttpResponse } from 'msw';
import { mockAssessmentsDb } from './db';

export const handlers = [
  http.get('/api/assessments', () => {
    return HttpResponse.json(mockAssessmentsDb);
  })
];
