import { http, HttpResponse, delay } from 'msw';
import { mockAssessmentsDb, mockPsychiatricRecordsDb, mockDashboardDb, mockStudentsDb, mockReferralsDb } from './db';
const MOCK_DELAY_MS = 1000;

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

  http.get(api('/api/records'), async () => {
    await delay(MOCK_DELAY_MS);
    return HttpResponse.json(mockPsychiatricRecordsDb);
  }),

  http.get(api('/api/records/:id'), ({ params }) => {
    const { id } = params;
    const record = mockPsychiatricRecordsDb.find((r) => r.id === id);
    if (!record) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(record);
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

  http.get(api('/api/students'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    const url = new URL(request.url);
    const nameQuery = url.searchParams.get('name');
    if (nameQuery) {
      const match = mockStudentsDb.find((s) => s.name === nameQuery);
      return HttpResponse.json(match ? [match] : []);
    }
    return HttpResponse.json(mockStudentsDb);
  }),

  http.get(api('/api/referrals'), async ({ request }) => {
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
      filteredReferrals = mockReferralsDb.filter(r => r.referredBy?.name === '艾米丽·沃森');
    } else if (authHeader.includes('head_councillor')) {
      // Head Councillor role sees all referrals (no filtering)
      filteredReferrals = [...mockReferralsDb];
    } else if (authHeader.includes('trial_admin')) {
      // Trial Admin role sees only handed over referrals
      filteredReferrals = mockReferralsDb.filter(isReferralAccessibleByTrialAdmin);
    } else if (authHeader.includes('doctor')) {
      // Doctor role sees only assigned referrals, drafts by this doctor, filled out by this doctor, or rejected by this doctor
      filteredReferrals = mockReferralsDb.filter(r => {
        const createdByMe = r.referredBy?.name === '李医生';
        const isDraftByMe = r.status === 'Draft' && createdByMe;
        // Check assignment explicitly by status and destination doctor
        const isAssignedStatus = ['Approved', 'WaitingForScheduling', 'WaitingForAppointment', 'Pending', 'AwaitingFeedbackApproval', 'Closed'].includes(r.status);
        const assignedToMe = isAssignedStatus && r.extendedData?.destination?.doctor?.includes('李医生');
        const rejectedByMe = r.extendedData?.rejectedBy?.includes('李医生');
        
        return isDraftByMe || assignedToMe || rejectedByMe;
      }).map(r => {
        if (r.extendedData?.rejectedBy?.includes('李医生')) {
          return { ...r, status: 'Rejected' };
        }
        return r;
      });
    }
    
    return HttpResponse.json(filteredReferrals);
  }),

  http.get(api('/api/referrals/:id'), ({ request, params }) => {
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
      if (referral.referredBy?.name !== '艾米丽·沃森') {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden: You can only access your own referrals' });
      }
    } else if (authHeader.includes('doctor')) {
      const createdByMe = referral.referredBy?.name === '李医生';
      const isDraftByMe = referral.status === 'Draft' && createdByMe;
      const isAssignedStatus = ['Approved', 'WaitingForScheduling', 'WaitingForAppointment', 'Pending', 'AwaitingFeedbackApproval', 'Closed'].includes(referral.status);
      const assignedToMe = isAssignedStatus && referral.extendedData?.destination?.doctor?.includes('李医生');
      const rejectedByMe = referral.extendedData?.rejectedBy?.includes('李医生');
      
      if (!isDraftByMe && !assignedToMe && !rejectedByMe) {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Doctor cannot access this referral' });
      }

      if (rejectedByMe) {
        return HttpResponse.json({ ...referral, status: 'Rejected' });
      }
    }

    return HttpResponse.json(referral);
  }),

  http.post(api('/api/referrals'), async ({ request }) => {
    const authHeader = request.headers.get('Authorization') || '';
    
    let creatorName = '';
    if (authHeader.includes('teacher_token_zhang')) {
      creatorName = '艾米丽·沃森';
    } else if (authHeader.includes('head_councillor')) {
      creatorName = '张明诚';
    } else if (authHeader.includes('doctor')) {
      creatorName = '李医生';
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

    const isHeadCouncillor = authHeader.includes('head_councillor');

    const newReferral = {
      id: Math.random().toString(36).substring(7),
      studentName,
      type: '初次转诊',
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      title: title || '无标题',
      description: reason,
      riskLevel: riskLevel,
      status: actionType === 'draft' ? 'Draft' : (isHeadCouncillor ? 'Approved' : 'AwaitingApproval'),
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
            subtitle: actionType === 'draft' ? '等待提交申请' : (isHeadCouncillor ? '自动跳过（院系级发起）' : '等待辅导员审核中'),
            time: actionType === 'draft' ? '' : (isHeadCouncillor ? new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '等待中'),
            status: actionType === 'draft' ? 'pending' : (isHeadCouncillor ? 'completed' : 'active')
          },
          {
            id: `step-3`,
            type: 'triage',
            title: '心理中心分诊',
            subtitle: actionType !== 'draft' && isHeadCouncillor ? '等待分配医生' : '等待审核完成',
            time: '',
            status: actionType !== 'draft' && isHeadCouncillor ? 'active' : 'pending'
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

  http.post(api('/api/referrals/:id/recall'), async ({ request, params }) => {
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

  http.post(api('/api/referrals/:id/reject'), async ({ request, params }) => {
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
      if (referral.status !== 'Approved' && referral.status !== 'Pending') {
        return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only approved or pending referrals can be rejected by trial admin' });
      }
      const triageStep = referral.extendedData?.steps?.find(s => s.type === 'triage');
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

    referral.status = 'Rejected';
    if (authHeader.includes('doctor') && referral.extendedData) {
      if (!referral.extendedData.rejectedBy) {
        referral.extendedData.rejectedBy = [];
      }
      referral.extendedData.rejectedBy.push('李医生');
    }

    if (referral.extendedData?.steps) {
      if (authHeader.includes('head_councillor')) {
        const reviewStep = referral.extendedData.steps.find(s => s.type === 'review');
        if (reviewStep) {
          reviewStep.status = 'issue';
          reviewStep.subtitle = `申请被拒绝: ${reason}`;
          reviewStep.time = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        }
      } else if (authHeader.includes('trial_admin')) {
        const triageStep = referral.extendedData.steps.find(s => s.type === 'triage');
        if (triageStep) {
          triageStep.status = 'issue';
          triageStep.subtitle = `分诊被拒绝: ${reason}`;
          triageStep.time = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        }
      } else if (authHeader.includes('doctor')) {
        const schedulingStep = referral.extendedData.steps.find(s => s.type === 'scheduling');
        if (schedulingStep) {
          schedulingStep.status = 'issue';
          schedulingStep.subtitle = `排诊被拒绝: ${reason}`;
          schedulingStep.time = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        }
      }
    }

    return HttpResponse.json({ success: true });
  }),

  http.post(api('/api/referrals/:id/assign'), async ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization') || '';
    
    if (!authHeader.includes('trial_admin')) {
      return new HttpResponse(null, { status: 403, statusText: 'Forbidden: Only trial admins can assign referrals' });
    }

    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    if (referral.status !== 'Approved' && referral.status !== 'Pending' && referral.status !== 'Rejected') {
      return new HttpResponse(null, { status: 400, statusText: 'Bad Request: Only approved, pending, or rejected referrals can be assigned' });
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

    if (targetReferral.extendedData?.steps) {
      const triageStep = targetReferral.extendedData.steps.find(s => s.type === 'triage');
      if (triageStep && (triageStep.status === 'active' || triageStep.status === 'completed')) {
        triageStep.status = 'completed';
        triageStep.subtitle = '已分诊';
        triageStep.time = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      const schedulingStep = targetReferral.extendedData.steps.find(s => s.type === 'scheduling');
      if (schedulingStep) {
        schedulingStep.status = 'active';
        schedulingStep.subtitle = '等待医生安排就诊时间';
        schedulingStep.time = '进行中';
      }
      
      if (!targetReferral.extendedData.destination) {
        targetReferral.extendedData.destination = { hospital: '待分配', department: '待分配', doctor: doctorId || '未知医生', admin: '待分配', transferDate: '' };
      } else {
        targetReferral.extendedData.destination.doctor = doctorId || '未知医生';
      }
    }

    return HttpResponse.json({ success: true, newId: targetReferral.id });
  }),

  http.get(api('/api/doctors/:id/calendar'), async ({ request, params }) => {
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
      .filter(r => 
        r.extendedData?.destination?.doctor?.includes(id as string) &&
        r.extendedData?.destination?.appointmentTime
      )
      .map(r => r.extendedData!.destination!.appointmentTime!);

    return HttpResponse.json({ occupiedSlots });
  }),

  http.post(api('/api/referrals/:id/schedule'), async ({ request, params }) => {
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

    if (referral.extendedData) {
      if (!referral.extendedData.destination) {
        referral.extendedData.destination = { hospital: '', department: '', doctor: '', admin: '', transferDate: '' };
      }
      referral.extendedData.destination.appointmentTime = appointmentTime;

      if (referral.extendedData.steps) {
        const schedulingStep = referral.extendedData.steps.find(s => s.type === 'scheduling');
        if (schedulingStep && schedulingStep.status === 'active') {
          schedulingStep.status = 'completed';
          schedulingStep.subtitle = `已预约: ${new Date(appointmentTime).toLocaleString('zh-CN')}`;
          schedulingStep.time = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        const evaluationStep = referral.extendedData.steps.find(s => s.type === 'evaluation');
        if (evaluationStep) {
          evaluationStep.status = 'active';
          evaluationStep.subtitle = '等待医生评估';
          evaluationStep.time = '进行中';
        }
      }
    }

    return HttpResponse.json({ success: true });
  }),

  http.post(api('/api/feedback'), async () => {
    await delay(MOCK_DELAY_MS);
    return HttpResponse.json({ success: true, message: 'Feedback submitted' });
  }),
];
