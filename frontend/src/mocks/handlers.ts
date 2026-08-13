import { http, HttpResponse, delay } from 'msw';
import { mockAssessmentsDb, mockAssessmentCatalog, mockDashboardDb, mockStudentsDb, mockReferralsDb, generateTrackerSteps } from './db';
const MOCK_DELAY_MS = 1000;

import { Referral, ReferralAction } from '../types';

const mockComputeAvailableActions = (referral: Referral, authHeader: string): ReferralAction[] => {
  const actions: ReferralAction[] = [];
  const status = referral.status;
  
  if (authHeader.includes('teacher')) {
    if (status === 'DRAFT') actions.push('recreate', 'delete_draft');
    else if (status === 'RECALLED') actions.push('recreate');
    else if (status === 'AWAITING_REVIEW') actions.push('recall_referral');
  } else if (authHeader.includes('head_councillor')) {
    if (status === 'DRAFT') actions.push('recreate', 'delete_draft');
    else if (status === 'AWAITING_REVIEW') actions.push('approve_referral', 'reject_referral');
    else if (status === 'AWAITING_FEEDBACK_APPROVAL') actions.push('acknowledge_feedback');
  } else if (authHeader.includes('trial_admin')) {
    if (status === 'AWAITING_TRIAGE') actions.push('assign_doctor', 'reject_referral');
  } else if (authHeader.includes('doctor')) {
    if (status === 'WAITING_FOR_SCHEDULING') actions.push('schedule_appointment', 'reject_referral');
    else if (status === 'WAITING_FOR_APPOINTMENT') actions.push('write_feedback', 'report_problem');
  }
  
  return actions;
};

const api = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const handlers = [
  http.get(api('/api/assessments'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`[MSW Bypass] Backend rejected /api/assessments with status ${res.status}`);
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not fetch real assessments data, falling back to mock", e);
      }
    }
    return HttpResponse.json(mockAssessmentsDb);
  }),

  http.get(api('/api/assessments/catalog'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`[MSW Bypass] Backend rejected /api/assessments/catalog with status ${res.status}`);
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not fetch real assessment catalog, falling back to mock", e);
      }
    }
    return HttpResponse.json(mockAssessmentCatalog);
  }),

  http.get(api('/api/assessments/:id'), async ({ request, params }) => {
    const { id } = params;
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`[MSW Bypass] Backend rejected /api/assessments/${id} with status ${res.status}`);
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn(`Could not fetch real assessment ${id}, falling back to mock`, e);
      }
    }
    const assessment = mockAssessmentsDb.find((a) => a.id === id);
    if (!assessment) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(assessment);
  }),

  http.post(api('/api/assessments/assignments'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`[MSW Bypass] Backend rejected /api/assessments/assignments with status ${res.status}`);
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not assign real assessment, falling back to mock", e);
      }
    }
    const body = await request.json() as { studentId: string | number; batteryCode: string };
    
    // Simulate conflict
    if (body.batteryCode === 'GAD_7') {
      return HttpResponse.json({ error: 'DUPLICATE_ASSIGNMENT' }, { status: 409 });
    }
    
    return HttpResponse.json({
      id: Math.floor(Math.random() * 1000),
      batteryCode: body.batteryCode,
      assignedByName: "Mock User",
      assignedById: 1,
      status: 'PENDING',
      assignedAt: new Date().toISOString()
    }, { status: 201 });
  }),

  http.post(api('/api/assessments/assignments/:id/revoke'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return new HttpResponse(null, { status: 200 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not revoke assignment, falling back to mock", e);
      }
    }
    return new HttpResponse(null, { status: 200 });
  }),

  http.get(api('/api/assessments/assignments/student/:studentId'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not fetch assignments, falling back to mock", e);
      }
    }
    return HttpResponse.json({
      content: [
        {
          id: 1,
          batteryCode: 'PHQ_9',
          assignedByName: 'Teacher A',
          assignedById: 2,
          status: 'PENDING',
          assignedAt: new Date().toISOString()
        }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    });
  }),

  http.post(api('/api/assessments/assign/cohort'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`[MSW Bypass] Backend rejected /api/assessments/assign/cohort with status ${res.status}`);
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not assign cohort assessment, falling back to mock", e);
      }
    }
    return HttpResponse.json({
      assignedCount: 5
    }, { status: 201 });
  }),

  http.post(api('/api/assessments/:id/submit'), async ({ request, params }) => {
    const { id } = params;
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`[MSW Bypass] Backend rejected /api/assessments/${id}/submit with status ${res.status}`);
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn(`Could not submit real assessment ${id}, falling back to mock`, e);
      }
    }
    const data = await request.json() as { answers: { questionId: string; selectedValue: number }[] };
    const answeredCount = data?.answers?.length || 0;
    return HttpResponse.json({
      success: true,
      assignmentId: id,
      totalQuestionsAnswered: answeredCount,
      completedAt: new Date().toISOString()
    });
  }),

  http.put(api('/api/assessments/:id/progress'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not save real progress, falling back to mock");
      }
    }
    return HttpResponse.json({ success: true });
  }),

  http.get(api('/api/students'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    
    // Attempt to fetch from real backend first
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real students data, falling back to mock");
      }
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const status = url.searchParams.get('status') || 'ALL';
    const academicYear = url.searchParams.get('academicYear') || 'ALL';
    const department = url.searchParams.get('department') || 'ALL';
    const hasActiveReferral = url.searchParams.get('hasActiveReferral');

    let filtered = [...mockStudentsDb];

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.studentNumber.toLowerCase().includes(search)
      );
    }

    if (status !== 'ALL') {
      filtered = filtered.filter((s) => s.riskLevel && s.riskLevel.toUpperCase() === status.toUpperCase());
    }

    if (academicYear !== 'ALL') {
      filtered = filtered.filter((s) => s.year === academicYear);
    }

    if (department !== 'ALL') {
      filtered = filtered.filter((s) => s.major === department || s.demographics?.school === department);
    }

    if (hasActiveReferral !== null && hasActiveReferral !== undefined && hasActiveReferral !== '') {
      const boolVal = hasActiveReferral === 'true';
      filtered = filtered.filter((s) => {
        const hasReferral = mockReferralsDb.some(r => r.studentNumber === s.studentNumber && !['CLOSED', 'REJECTED'].includes(r.status));
        return hasReferral === boolVal;
      });
    }

    return HttpResponse.json(filtered);
  }),


  http.get(api('/api/dashboard/:role'), async ({ params, request }) => {
    await delay(MOCK_DELAY_MS);

    // Attempt to fetch from real backend first
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn(`Could not fetch real dashboard data for ${params.role}, falling back to mock`);
      }
    }

    const { role } = params;
    const dashboardData = mockDashboardDb[role as string];
    if (!dashboardData) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(dashboardData);
  }),

  http.get(api('/api/dashboard/:role/profile'), async ({ params, request }) => {
    await delay(MOCK_DELAY_MS);
    
    // Attempt to fetch from real backend first
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn(`Could not fetch real profile data for ${params.role}, falling back to mock`);
      }
    }

    const { role } = params;
    const dashboardData = mockDashboardDb[role as string];
    if (!dashboardData) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(dashboardData.profileSummary);
  }),

  // Intercept detail fetches and return rich mock data
  http.get(api('/api/students/:id'), async ({ request, params }) => {
    const { id } = params;
    await delay(MOCK_DELAY_MS);
    
    // Attempt to fetch from real backend first
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real student data, falling back to mock");
      }
    }

    const student = mockStudentsDb.find((s) => s.id === id);
    if (!student) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(student);
  }),

  http.get(api('/api/referrals'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    
    // Attempt to fetch from real backend first
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          const liveData = await res.json();
          const authHeader = request.headers.get('Authorization') || '';
          const enriched = liveData.map((item: Referral) => ({
            ...item,
            availableActions: mockComputeAvailableActions(item, authHeader)
          }));
          return HttpResponse.json(enriched);
        }
      } catch (e) {
        console.warn("Could not fetch real referrals data, falling back to mock");
      }
    }

    const authHeader = request.headers.get('Authorization') || '';
    const enrichedDb = mockReferralsDb.map((item) => ({
      ...item,
      availableActions: mockComputeAvailableActions(item, authHeader)
    }));

    return HttpResponse.json(enrichedDb);
  }),

  http.post(api('/api/referrals'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    await delay(MOCK_DELAY_MS);
    const data = await request.json() as any;
    
    const newReferral = {
      id: Math.random().toString(36).substring(7),
      studentName: data.studentName || '待指定学生',
      studentNumber: data.studentNumber || 'STU-NEW',
      type: data.type || 'INITIAL',
      date: new Date().toISOString().split('T')[0],
      title: data.title || '无标题转诊',
      description: data.description || '无详细描述',
      riskLevel: data.riskLevel || 'LOW',
      status: 'DRAFT',
      referredBy: {
        name: '当前用户',
        avatar: undefined
      },
      ...data
    };

    mockReferralsDb.push(newReferral);
    return HttpResponse.json(newReferral, { status: 201 });
  }),

  http.get(api('/api/referrals/:id'), async ({ request, params }) => {
    const { id } = params;
    await delay(MOCK_DELAY_MS);
    
    // Attempt to fetch from real backend first
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real referral data, falling back to mock");
      }
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    const authHeader = request.headers.get('Authorization') || '';
    const availableActions = mockComputeAvailableActions(referral, authHeader);

    return HttpResponse.json({
      baseInfo: {
        ...referral,
        availableActions
      },
      studentDemographics: {
        age: 20,
        phone: '138-0000-0000',
        email: 'student@example.edu.cn',
        academicYear: '大二',
        grade: '大二',
        studentId: referral.studentNumber || 'STU-001',
        school: '计算机科学与技术学院',
        department: '计算机科学与技术学院',
        gender: '未知'
      },
      triageInfo: {
        isFirstVisit: true,
        isMedicated: false,
        priorTherapy: '无',
        scidDiagnosis: '待诊断',
        fullDescription: referral.description
      },
      riskAssessment: {
        ideation: referral.riskLevel === 'HIGH',
        attempt: false,
        selfHarm: referral.riskLevel === 'HIGH',
        notes: ''
      },
      feedback: (referral as any).extendedData?.feedback || null
    });
  }),

  http.get(api('/api/referrals/:id/tracking'), async ({ request, params }) => {
    const { id } = params;
    await delay(MOCK_DELAY_MS); // Simulate network delay for skeleton loader
    
    // Attempt to fetch from real backend first
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real tracking data, falling back to mock");
      }
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      // Return dummy tracking data if not found
      const fallback = mockReferralsDb[0];
      return HttpResponse.json({
        destination: ['APPROVED', 'AWAITING_FEEDBACK_APPROVAL', 'CLOSED'].includes(fallback.status) ? {
          hospital: '中央大学医学中心',
          department: '精神医学与行为科学科',
          doctor: '李医生',
          admin: '系统处理程序 (自动分配)',
          transferDate: fallback.date
        } : undefined,
        steps: generateTrackerSteps(fallback)
      });
    }

    return HttpResponse.json({
      destination: ['APPROVED', 'AWAITING_FEEDBACK_APPROVAL', 'CLOSED'].includes(referral.status) ? {
          hospital: '中央大学医学中心',
          department: '精神医学与行为科学科',
          doctor: ['2', '5', '9'].includes(referral.id) ? '李医生' : '张医生 (总住院医师)',
          admin: '系统处理程序 (自动分配)',
          transferDate: referral.date
      } : undefined,
      steps: generateTrackerSteps(referral)
    });
  }),


  http.post(api('/api/referrals/:id/recall'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    // According to feedback, we just verify it's a teacher token.
    if (!authHeader.includes('teacher')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only teachers can recall' });
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (referral.status !== 'AWAITING_REVIEW') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting approval referrals can be recalled' });
    }

    referral.status = 'RECALLED';

    return HttpResponse.json({ success: true });
  }),

  http.delete(api('/api/referrals/:id'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.includes('teacher') && !authHeader.includes('head_councillor')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only teachers and head councillors can delete drafts' });
    }

    const index = mockReferralsDb.findIndex((r) => r.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    if (mockReferralsDb[index].status !== 'DRAFT') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only draft referrals can be deleted' });
    }

    mockReferralsDb.splice(index, 1);

    return HttpResponse.json({ success: true });
  }),

  http.post(api('/api/referrals/:id/approve'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.includes('head_councillor')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only head councillors can approve referrals' });
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (referral.status !== 'AWAITING_REVIEW') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting approval referrals can be approved' });
    }

    referral.status = 'AWAITING_TRIAGE';
    if ((referral as any).extendedData?.steps) {
      const reviewStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'review');
      if (reviewStep) {
        reviewStep.status = 'completed';
        reviewStep.subtitle = '审核已通过';
        reviewStep.time = new Date().toISOString();
      }
      const triageStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'triage');
      if (triageStep) {
        triageStep.status = 'active';
        triageStep.subtitle = '正在处理分诊信息...';
        triageStep.time = '进行中';
      }
    }

    return HttpResponse.json({ success: true });
  }),

  http.post(api('/api/referrals/:id/reject'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (authHeader.includes('head_councillor')) {
      if (referral.status !== 'AWAITING_REVIEW') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting approval referrals can be rejected by head councillor' });
      }
    } else if (authHeader.includes('trial_admin')) {
      if (referral.status !== 'AWAITING_TRIAGE') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting triage referrals can be rejected by trial admin' });
      }
      const triageStep = (referral as any).extendedData?.steps?.find((s: any) => s.type === 'triage');
      if (triageStep?.status !== 'active') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Triage must be active' });
      }
    } else if (authHeader.includes('doctor')) {
      if (referral.status !== 'WAITING_FOR_SCHEDULING') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only referrals waiting for scheduling can be rejected by doctors' });
      }
    } else {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only head councillors, trial admins, or doctors can reject' });
    }

    const data = await request.json() as any;
    const reason = data?.reason || '无拒绝原因';

    if (authHeader.includes('doctor')) {
      referral.status = 'AWAITING_TRIAGE';
      if ((referral as any).extendedData) {
        if (!(referral as any).extendedData.rejectedBy) {
          (referral as any).extendedData.rejectedBy = [];
        }
        (referral as any).extendedData.rejectedBy.push('李医生');
      }
    } else {
      referral.status = 'REJECTED';
    }

    if ((referral as any).extendedData?.steps) {
      if (authHeader.includes('head_councillor')) {
        const reviewStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'review');
        if (reviewStep) {
          reviewStep.status = 'issue';
          reviewStep.subtitle = `申请被拒绝: ${reason}`;
          reviewStep.time = new Date().toISOString();
        }
      } else if (authHeader.includes('trial_admin')) {
        const triageStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'triage');
        if (triageStep) {
          triageStep.status = 'issue';
          triageStep.subtitle = `分诊被拒绝: ${reason}`;
          triageStep.time = new Date().toISOString();
        }
      } else if (authHeader.includes('doctor')) {
        const schedulingStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'scheduling');
        if (schedulingStep) {
          schedulingStep.status = 'issue';
          schedulingStep.subtitle = `排诊被拒绝: ${reason}`;
          schedulingStep.time = new Date().toISOString();
        }
        const triageStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'triage');
        if (triageStep) {
          triageStep.status = 'active';
          triageStep.subtitle = '等待重新分配医生';
        }
      }
    }

    return HttpResponse.json({ success: true });
  }),

  http.post(api('/api/referrals/:id/assign'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.includes('trial_admin')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only trial admins can assign referrals' });
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (referral.status !== 'AWAITING_TRIAGE' && referral.status !== 'REJECTED') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting triage or rejected referrals can be assigned' });
    }

    const data = await request.json() as any;
    const doctorId = data?.doctorId;
    
    let targetReferral = referral;

    if (referral.status === 'REJECTED') {
      targetReferral = JSON.parse(JSON.stringify(referral));
      targetReferral.id = Math.random().toString(36).substring(7);
      mockReferralsDb.push(targetReferral as any);
    }

    targetReferral.status = 'WAITING_FOR_SCHEDULING';

    if ((targetReferral as any).extendedData?.steps) {
      const triageStep = (targetReferral as any).extendedData.steps.find((s: any) => s.type === 'triage');
      if (triageStep && (triageStep.status === 'active' || triageStep.status === 'completed')) {
        triageStep.status = 'completed';
        triageStep.subtitle = '已分诊';
        triageStep.time = new Date().toISOString();
      }
      const schedulingStep = (targetReferral as any).extendedData.steps.find((s: any) => s.type === 'scheduling');
      if (schedulingStep) {
        schedulingStep.status = 'active';
        schedulingStep.subtitle = '等待医生安排就诊时间';
        schedulingStep.time = '进行中';
      }
      
      if (!(targetReferral as any).extendedData.destination) {
        (targetReferral as any).extendedData.destination = { hospital: '待分配', department: '待分配', doctor: doctorId || '未知医生', admin: '待分配', transferDate: '' };
      } else {
        (targetReferral as any).extendedData.destination.doctor = doctorId || '未知医生';
      }
    }

    return HttpResponse.json({ success: true, newId: targetReferral.id });
  }),

  http.get(api('/api/doctors/:id/calendar'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real calendar data, falling back to mock");
      }
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    // Security check: Only allow doctors to view the schedule.
    // In a real application, we would also verify that the decoded JWT token matches the requested doctor ID.
    // This ensures no other doctor or user can query this endpoint.
    if (!authHeader.includes('doctor')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only the assigned doctor can view their schedule' });
    }

    await delay(MOCK_DELAY_MS);

    // Dynamically calculate occupied slots from mockReferralsDb
    const occupiedSlots = mockReferralsDb
      .filter(r => {
        const appointment = (r as any).extendedData?.appointment;
        return appointment && String(appointment.doctorId) === String(id) && appointment.appointmentTime;
      })
      .map(r => (r as any).extendedData!.appointment!.appointmentTime);

    return HttpResponse.json({ occupiedSlots });
  }),

  http.post(api('/api/referrals/:id/schedule'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.includes('doctor')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only doctors can schedule appointments' });
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (referral.status !== 'WAITING_FOR_SCHEDULING') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only referrals waiting for scheduling can be scheduled' });
    }

    const data = await request.json() as any;
    const appointmentTime = data?.appointmentTime;
    
    referral.status = 'WAITING_FOR_APPOINTMENT';

    if ((referral as any).extendedData) {
      (referral as any).extendedData.appointment = {
        doctorId: 1, // Mock doctor ID
        appointmentTime: appointmentTime,
        status: 'SCHEDULED'
      };

      if ((referral as any).extendedData.steps) {
        const schedulingStep = (referral as any).extendedData.steps.find(s => s.type === 'scheduling');
        if (schedulingStep && schedulingStep.status === 'active') {
          schedulingStep.status = 'completed';
          schedulingStep.subtitle = `已预约: ${new Date(appointmentTime).toLocaleString('zh-CN')}`;
          schedulingStep.time = new Date().toISOString();
        }
        const evaluationStep = (referral as any).extendedData.steps.find(s => s.type === 'evaluation');
        if (evaluationStep) {
          evaluationStep.status = 'active';
          evaluationStep.subtitle = '等待医生评估';
          evaluationStep.time = '进行中';
        }
      }
    }

    return HttpResponse.json({ success: true });
  }),

  http.post(api('/api/feedback'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    await delay(MOCK_DELAY_MS);
    
    const data = await request.json() as any;
    const { referralId, feedback, attachments } = data;

    const referral = mockReferralsDb.find((r) => r.id === referralId);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    referral.status = 'AWAITING_FEEDBACK_APPROVAL';

    if ((referral as any).extendedData) {
      if (!(referral as any).extendedData.feedback) {
        (referral as any).extendedData.feedback = { summary: '', followUp: '', attachments: [] };
      }
      (referral as any).extendedData.feedback.summary = feedback;
      (referral as any).extendedData.feedback.attachments = attachments || [];

      if ((referral as any).extendedData.steps) {
        const evaluationStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'evaluation');
        if (evaluationStep) {
          evaluationStep.status = 'completed';
          evaluationStep.subtitle = '医生已完成评估';
          evaluationStep.time = new Date().toISOString();
        }

        const feedbackStep = (referral as any).extendedData.steps.find((s: any) => s.type === 'feedback');
        if (feedbackStep) {
          feedbackStep.status = 'active';
          feedbackStep.subtitle = '等待辅导员确认反馈';
          feedbackStep.time = new Date().toISOString();
        }
      }
    }

    return HttpResponse.json({ success: true, message: 'Feedback submitted' });
  }),

  http.post(api('/api/referrals/:id/acknowledge-feedback'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      const { passthrough } = await import('msw');
      return passthrough();
    }

    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.includes('head_councillor')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only head councillors can acknowledge feedback' });
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (referral.status !== 'AWAITING_FEEDBACK_APPROVAL') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting feedback approval referrals can be acknowledged' });
    }

    referral.status = 'CLOSED';
    
    if ((referral as any).extendedData?.steps) {
      const feedbackStep = (referral as any).extendedData.steps.find(s => s.type === 'feedback');
      if (feedbackStep) {
        feedbackStep.status = 'completed';
        feedbackStep.subtitle = '已出具随访计划并反馈';
        feedbackStep.time = new Date().toISOString();
      }
    }

    return HttpResponse.json({ success: true });
  })
];
