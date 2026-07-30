import { http, HttpResponse, delay } from 'msw';
import { mockAssessmentsDb, mockDashboardDb, mockStudentsDb, mockReferralsDb } from './db';
const MOCK_DELAY_MS = 1000;

import { Referral, ReferralAction } from '../types';

const mockComputeAvailableActions = (referral: Referral, authHeader: string): ReferralAction[] => {
  const actions: ReferralAction[] = [];
  const status = referral.status;
  
  if (authHeader.includes('teacher')) {
    if (status === 'Draft') actions.push('recreate', 'delete_draft');
    else if (status === 'Recalled') actions.push('recreate');
    else if (status === 'AwaitingApproval') actions.push('recall_referral');
  } else if (authHeader.includes('head_councillor')) {
    if (status === 'Draft') actions.push('recreate', 'delete_draft');
    else if (status === 'AwaitingApproval') actions.push('approve_referral', 'reject_referral');
    else if (status === 'AwaitingFeedbackApproval') actions.push('acknowledge_feedback');
  } else if (authHeader.includes('trial_admin')) {
    if (status === 'AwaitingTriage') actions.push('assign_doctor', 'reject_referral');
  } else if (authHeader.includes('doctor')) {
    if (status === 'WaitingForScheduling') actions.push('schedule_appointment', 'reject_referral');
    else if (status === 'WaitingForAppointment') actions.push('write_feedback', 'report_problem');
  }
  
  return actions;
};

const api = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const handlers = [
  http.get(api('/api/assessments'), async () => {
    await delay(MOCK_DELAY_MS);
    return HttpResponse.json(mockAssessmentsDb);
  }),

  http.get(api('/api/assessments/:id'), ({ params }) => {
    const { id } = params;
    const assessment = mockAssessmentsDb.find((a) => a.id === id);
    if (!assessment) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(assessment);
  }),

  http.get(api('/api/notifications'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn('Could not fetch real notifications, falling back to mock');
      }
    }

    return HttpResponse.json([
      {
        id: 1,
        userId: 1,
        messageCode: 'REFERRAL_SUBMITTED_INITIATOR',
        messageArgs: ['S12345', 'HIGH'],
        actionType: 'NONE',
        isRead: false,
        createdAt: new Date().toISOString(),
        isActionAvailable: false
      },
      {
        id: 2,
        userId: 1,
        messageCode: 'REFERRAL_REQUIRES_REVIEW_HC',
        messageArgs: ['S98765', 'MEDIUM'],
        actionType: 'REVIEW_REFERRAL',
        actionTargetId: 100,
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isActionAvailable: true
      }
    ]);
  }),

  http.patch(api('/api/notifications/:id/read'), async ({ request, params }) => {
    await delay(500);
    
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return new HttpResponse(null, { status: 200 });
        }
      } catch (e) {
        console.warn('Could not mock read on backend, falling back to mock');
      }
    }
    
    return new HttpResponse(null, { status: 200 });
  }),


  http.get(api('/api/dashboard/:role'), async ({ params }) => {
    await delay(MOCK_DELAY_MS);
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
    await delay(MOCK_DELAY_MS);
    const { id } = params;
    const match = mockStudentsDb.find((s) => s.id === id);
    if (match) {
      return HttpResponse.json(match);
    }
    // Fallback if ID not found (since real DB has 1,2,3,4 but mock DB has s1, s2, s3, s4)
    const fallbackStudent = mockStudentsDb[0];
    return HttpResponse.json({ ...fallbackStudent, id: id as string });
  }),


  http.get(api('/api/referrals/:id'), async ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    // Attempt to fetch real referral from the backend (Vite proxy)
    // Skip bypass if we are running in tests since there's no real backend running
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          // Pass the real response through directly since the backend now computes availableActions natively
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real referral, falling back to mock");
      }
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      // If we can't find it in the mock DB,
      // we generate a dummy referral
      const fallbackBaseInfo = { 
        ...mockReferralsDb[0], 
        id: id as string, 
        title: "Backend Referral Detail", 
        description: "This is a fallback referral generated by MSW because the backend is offline."
      };
      
      const actions = mockComputeAvailableActions(fallbackBaseInfo, authHeader);
      const fallbackReferralWithActions = {
          ...fallbackBaseInfo,
          availableActions: actions
      };
      
      return HttpResponse.json({
        baseInfo: fallbackReferralWithActions,
        studentDemographics: {
            studentId: fallbackReferralWithActions.studentNumber,
            school: '未知',
            grade: '未知',
            phone: '未知'
        },
        triageInfo: {
            isFirstVisit: true,
            isMedicated: false,
            priorTherapy: '无',
            fullDescription: fallbackReferralWithActions.description
        },
        riskAssessment: {
            ideation: false,
            attempt: false,
            selfHarm: false
        }
      });
    }

    const mockActions = mockComputeAvailableActions(referral, authHeader);
    const referralWithActions = { 
      ...referral, 
      availableActions: mockActions,
      appointment: (referral as any).extendedData?.appointment
    };

    return HttpResponse.json({
      baseInfo: referralWithActions,
      studentDemographics: {
        studentId: referral.studentNumber,
        school: '计算机科学与技术学院',
        grade: '大二',
        phone: '138-0000-0000',
        age: 21,
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
        ideation: referral.riskLevel === 'High',
        attempt: false,
        selfHarm: referral.riskLevel === 'High',
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

    if (referral.status !== 'AwaitingApproval') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting approval referrals can be recalled' });
    }

    referral.status = 'Recalled';

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

    if (mockReferralsDb[index].status !== 'Draft') {
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

    if (referral.status !== 'AwaitingApproval') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting approval referrals can be approved' });
    }

    referral.status = 'AwaitingTriage';
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
      if (referral.status !== 'AwaitingApproval') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting approval referrals can be rejected by head councillor' });
      }
    } else if (authHeader.includes('trial_admin')) {
      if (referral.status !== 'AwaitingTriage') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting triage referrals can be rejected by trial admin' });
      }
      const triageStep = (referral as any).extendedData?.steps?.find((s: any) => s.type === 'triage');
      if (triageStep?.status !== 'active') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Triage must be active' });
      }
    } else if (authHeader.includes('doctor')) {
      if (referral.status !== 'WaitingForScheduling') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only referrals waiting for scheduling can be rejected by doctors' });
      }
    } else {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only head councillors, trial admins, or doctors can reject' });
    }

    const data = await request.json() as any;
    const reason = data?.reason || '无拒绝原因';

    if (authHeader.includes('doctor')) {
      referral.status = 'AwaitingTriage';
      if ((referral as any).extendedData) {
        if (!(referral as any).extendedData.rejectedBy) {
          (referral as any).extendedData.rejectedBy = [];
        }
        (referral as any).extendedData.rejectedBy.push('李医生');
      }
    } else {
      referral.status = 'Rejected';
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

    if (referral.status !== 'AwaitingTriage' && referral.status !== 'Rejected') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting triage or rejected referrals can be assigned' });
    }

    const data = await request.json() as any;
    const doctorId = data?.doctorId;
    
    let targetReferral = referral;

    if (referral.status === 'Rejected') {
      targetReferral = JSON.parse(JSON.stringify(referral));
      targetReferral.id = Math.random().toString(36).substring(7);
      mockReferralsDb.push(targetReferral as any);
    }

    targetReferral.status = 'WaitingForScheduling';

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

    if (referral.status !== 'WaitingForScheduling') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only referrals waiting for scheduling can be scheduled' });
    }

    const data = await request.json() as any;
    const appointmentTime = data?.appointmentTime;
    
    referral.status = 'WaitingForAppointment';

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

    referral.status = 'AwaitingFeedbackApproval';

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

    if (referral.status !== 'AwaitingFeedbackApproval') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting feedback approval referrals can be acknowledged' });
    }

    referral.status = 'Closed';
    
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
