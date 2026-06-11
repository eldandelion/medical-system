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

  http.get('/api/referrals', ({ request }) => {
    const authHeader = request.headers.get('Authorization') || '';
    let filteredReferrals = [...mockReferralsDb];

    // Decode mock token logic
    if (authHeader.includes('teacher_token_zhang')) {
      // Teacher role sees only referrals they created
      filteredReferrals = mockReferralsDb.filter(r => r.referredBy?.name === '张教授');
    } else if (authHeader.includes('head_councillor')) {
      // Head Councillor role sees all referrals (no filtering)
      filteredReferrals = [...mockReferralsDb];
    }
    
    return HttpResponse.json(filteredReferrals);
  }),

  http.get('/api/referrals/:id', ({ params }) => {
    const { id } = params;
    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
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
            subtitle: `${creatorName} 提交了转诊申请`,
            time: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
            status: actionType === 'draft' ? 'active' : 'completed'
          },
          {
            id: `step-2`,
            type: 'review',
            title: '辅导员审核',
            subtitle: actionType === 'draft' ? '等待提交申请' : '等待辅导员审核中',
            time: actionType === 'draft' ? '' : '等待中',
            status: actionType === 'draft' ? 'pending' : 'active'
          }
        ]
      }
    };

    mockReferralsDb.push(newReferral as any);

    return HttpResponse.json({ success: true, id: newReferral.id }, { status: 201 });
  })
];
