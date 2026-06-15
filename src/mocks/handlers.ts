import { http, HttpResponse, delay } from 'msw';
import { mockAssessmentsDb, mockPsychiatricRecordsDb, mockDashboardDb, mockStudentsDb, mockReferralsDb } from './db';
const MOCK_DELAY_MS = 1000;

export const handlers = [
  http.get('/api/assessments', async () => {
    await delay(MOCK_DELAY_MS);
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

  http.get('/api/records', async () => {
    await delay(MOCK_DELAY_MS);
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

  http.get('/api/dashboard/:role', async ({ params }) => {
    await delay(MOCK_DELAY_MS);
    const { role } = params;
    const dashboardData = mockDashboardDb[role as string];
    if (!dashboardData) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(dashboardData);
  }),

  http.get('/api/students', async () => {
    await delay(MOCK_DELAY_MS);
    return HttpResponse.json(mockStudentsDb);
  }),

  http.get('/api/referrals', async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    const authHeader = request.headers.get('Authorization') || '';
    let filteredReferrals = [...mockReferralsDb];

    const isReferralAccessibleByTrialAdmin = (r: any) => {
      if (r.status === 'Draft' || r.status === 'AwaitingApproval' || r.status === 'Recalled') {
        return false;
      }
      if (r.status === 'Rejected') {
        // If rejected before handover (e.g., during the 'review' step by head councillor)
        const reviewStep = r.extendedData?.steps?.find((s: any) => s.type === 'review');
        if (reviewStep?.status === 'issue') {
          return false;
        }
      }
      return true;
    };

    // Decode mock token logic
    if (authHeader.includes('teacher_token_zhang')) {
      // Teacher role sees only referrals they created
      filteredReferrals = mockReferralsDb.filter(r => r.referredBy?.name === '张教授');
    } else if (authHeader.includes('head_councillor')) {
      // Head Councillor role sees all referrals (no filtering)
      filteredReferrals = [...mockReferralsDb];
    } else if (authHeader.includes('trial_admin')) {
      // Trial Admin role sees only handed over referrals
      filteredReferrals = mockReferralsDb.filter(isReferralAccessibleByTrialAdmin);
    } else {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Invalid or missing token' });
    }
    
    return HttpResponse.json(filteredReferrals);
  }),

  http.get('/api/referrals/:id', ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    const isReferralAccessibleByTrialAdmin = (r: any) => {
      if (r.status === 'Draft' || r.status === 'AwaitingApproval' || r.status === 'Recalled') {
        return false;
      }
      if (r.status === 'Rejected') {
        const reviewStep = r.extendedData?.steps?.find((s: any) => s.type === 'review');
        if (reviewStep?.status === 'issue') {
          return false;
        }
      }
      return true;
    };

    // Authorization checks
    if (authHeader.includes('trial_admin')) {
      if (!isReferralAccessibleByTrialAdmin(referral)) {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Trial Admin cannot access this referral' });
      }
    } else if (authHeader.includes('teacher_token_zhang')) {
      if (referral.referredBy?.name !== '张教授') {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden: You can only access your own referrals' });
      }
    }

    return HttpResponse.json(referral);
  }),

  http.post('/api/referrals', async ({ request }) => {
    const authHeader = request.headers.get('Authorization') || '';
    
    let creatorName = '';
    if (authHeader.includes('teacher_token_zhang')) {
      creatorName = '张教授';
    } else if (authHeader.includes('head_councillor')) {
      creatorName = '总辅导员';
    } else {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden' });
    }

    const data = await request.json() as any;
    const { actionType, studentId, title, reason, riskLevel, clinicalStatus, severeRiskFactors, attachments } = data;

    if (actionType !== 'draft') {
      if (!studentId || !title?.trim() || !reason?.trim() || !riskLevel) {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Missing required fields for submission' });
      }
    }

    const student = mockStudentsDb.find(s => s.id === studentId);
    const studentName = student ? student.name : '未知学生';

    const newReferral = {
      id: Math.random().toString(36).substring(7),
      studentName,
      type: '初次转诊',
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      title: title || '无标题',
      description: reason,
      riskLevel: riskLevel,
      status: actionType === 'draft' ? 'Draft' : 'AwaitingApproval',
      referredBy: { name: creatorName },
      extendedData: {
        age: 20,
        gender: '未知',
        studentId: student?.demographics?.studentId || studentId,
        school: student?.major || '未知',
        grade: '未知',
        phone: '未知',
        triage: {
          isFirstVisit: clinicalStatus?.includes('FirstVisit') || false,
          isMedicated: clinicalStatus?.includes('Medicated') || false,
          priorTherapy: clinicalStatus?.includes('PriorTherapy') ? '有' : '无',
          scidDiagnosis: '',
          fullDescription: reason
        },
        destination: {
          hospital: '待分配',
          department: '待分配',
          doctor: '待分配',
          admin: '待分配',
          transferDate: ''
        },
        risk: {
          ideation: severeRiskFactors?.includes('Ideation') || false,
          attempt: severeRiskFactors?.includes('Attempt') || false,
          selfHarm: severeRiskFactors?.includes('SelfHarm') || false,
          notes: severeRiskFactors?.join('、') || '无'
        },
        scores: [],
        feedback: {
          summary: '',
          followUp: '',
          attachments: attachments || []
        },
        steps: [
          {
            id: `step-1`,
            type: 'initiation',
            title: '发起转诊',
            subtitle: actionType === 'draft' ? '等待提交' : `${creatorName} 提交了转诊申请`,
            time: actionType === 'draft' ? '' : new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: actionType === 'draft' ? 'pending' : 'completed'
          },
          {
            id: `step-2`,
            type: 'review',
            title: '辅导员审核',
            subtitle: actionType === 'draft' ? '等待提交申请' : '等待辅导员审核中',
            time: actionType === 'draft' ? '' : '等待中',
            status: actionType === 'draft' ? 'pending' : 'active'
          },
          {
            id: `step-3`,
            type: 'triage',
            title: '心理中心分诊',
            subtitle: '等待审核完成',
            time: '',
            status: 'pending'
          },
          {
            id: `step-4`,
            type: 'evaluation',
            title: '医生评估',
            subtitle: '等待分诊分配',
            time: '',
            status: 'pending'
          },
          {
            id: `step-5`,
            type: 'feedback',
            title: '评估反馈与随访计划',
            subtitle: '等待医生评估完成',
            time: '',
            status: 'pending'
          }
        ]
      }
    };

    mockReferralsDb.push(newReferral as any);

    return HttpResponse.json({ success: true, id: newReferral.id }, { status: 201 });
  }),

  http.post('/api/referrals/:id/recall', async ({ request, params }) => {
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

  http.delete('/api/referrals/:id', async ({ request, params }) => {
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

  http.post('/api/referrals/:id/approve', async ({ request, params }) => {
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

    referral.status = 'Approved';
    if (referral.extendedData?.steps) {
      const reviewStep = referral.extendedData.steps.find(s => s.type === 'review');
      if (reviewStep) {
        reviewStep.status = 'completed';
        reviewStep.subtitle = '审核已通过';
        reviewStep.time = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      const triageStep = referral.extendedData.steps.find(s => s.type === 'triage');
      if (triageStep) {
        triageStep.status = 'active';
        triageStep.subtitle = '正在处理分诊信息...';
        triageStep.time = '进行中';
      }
    }

    return HttpResponse.json({ success: true });
  }),

  http.post('/api/referrals/:id/reject', async ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.includes('head_councillor')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only head councillors can reject referrals' });
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (referral.status !== 'AwaitingApproval') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only awaiting approval referrals can be rejected' });
    }

    const data = await request.json() as any;
    const reason = data?.reason || '无拒绝原因';

    referral.status = 'Rejected';
    if (referral.extendedData?.steps) {
      const reviewStep = referral.extendedData.steps.find(s => s.type === 'review');
      if (reviewStep) {
        reviewStep.status = 'issue';
        reviewStep.subtitle = `申请被拒绝: ${reason}`;
        reviewStep.time = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    }

    return HttpResponse.json({ success: true });
  })
];
