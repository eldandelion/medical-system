import { http, HttpResponse, delay } from 'msw';
import {
  mockAssessmentsDb,
  mockAssessmentCatalog,
  mockDashboardDb,
  mockStudentsDb,
  mockReferralsDb,
  mockAdminUsersDb,
  generateTrackerSteps,
  mockCollegesDb,
  mockSchoolsDb,
  mockMajorsDb,
  mockSchoolDepartmentsDb,
  mockAdminHospitalsDb,
  mockHospitalDepartmentsDb,
  mockEthnicitiesDb,
  mockDegreeLevelsDb,
} from './db';
import {
  SchoolDto,
  CollegeDto,
  MajorDto,
  SchoolDepartmentDto,
  AdminHospitalDto,
  HospitalDepartmentDto,
  EthnicityDto,
  DegreeLevelDto,
  ReferenceCategory,
} from '../types/references';
const MOCK_DELAY_MS = 1000;

import { Referral, ReferralAction, UserProfileDto, UpdateUserProfileRequest, StudentImportPreview, StudentImportCommitRequest, StudentImportResult, StudentImportRow } from '../types';

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
  } else if (authHeader.includes('admin')) {
    if (status === 'DRAFT') actions.push('recreate', 'delete_draft');
    else if (status === 'AWAITING_REVIEW') actions.push('approve_referral', 'reject_referral', 'cancel_referral');
    else if (status === 'AWAITING_TRIAGE') actions.push('assign_doctor', 'reject_referral', 'cancel_referral');
    else if (status === 'AWAITING_FEEDBACK_APPROVAL') actions.push('acknowledge_feedback', 'cancel_referral');
    else if (status !== 'CLOSED' && status !== 'REJECTED' && status !== 'RECALLED') actions.push('cancel_referral');
  }
  
  return actions;
};

const api = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

export const handlers = [
  http.post(api('/api/auth/verify-identifier'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          console.warn(`[MSW Bypass] Backend rejected /api/auth/verify-identifier with status ${res.status}`);
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn('Could not verify identifier against real backend, falling back to mock', e);
      }
    }

    const body = (await request.json().catch(() => ({}))) as { identifier?: string };
    const rawInput = (body.identifier || '').trim();

    if (!rawInput) {
      return HttpResponse.json({ exists: false, isAccountActive: false });
    }

    // 1. Try matching student number or student demographics email
    const student = mockStudentsDb.find(
      (s) =>
        s.studentNumber.toLowerCase() === rawInput.toLowerCase() ||
        (s.demographics?.email && s.demographics.email.toLowerCase() === rawInput.toLowerCase())
    );

    if (student) {
      const isActive = student.status?.toLowerCase() !== 'disabled' && student.status?.toLowerCase() !== 'deleted';
      return HttpResponse.json({
        exists: true,
        isAccountActive: isActive,
        maskedIdentifier: rawInput.includes('@')
          ? `${rawInput.slice(0, 2)}***${rawInput.slice(rawInput.indexOf('@') - 1)}`
          : `${rawInput.slice(0, 2)}****${rawInput.slice(-2)}`,
        role: 'STUDENT',
      });
    }

    // 2. Try matching admin / staff users (email or employeeOrStudentId)
    const adminUser = mockAdminUsersDb.find(
      (u) =>
        u.email.toLowerCase() === rawInput.toLowerCase() ||
        (u.employeeOrStudentId && u.employeeOrStudentId.toLowerCase() === rawInput.toLowerCase())
    );

    if (adminUser) {
      const isActive = adminUser.status === 'ACTIVE';
      return HttpResponse.json({
        exists: true,
        isAccountActive: isActive,
        maskedIdentifier: rawInput.includes('@')
          ? `${rawInput.slice(0, 2)}***${rawInput.slice(rawInput.indexOf('@') - 1)}`
          : `${rawInput.slice(0, 2)}****${rawInput.slice(-2)}`,
        role: adminUser.role,
      });
    }

    // 3. Fallback check for common test mock accounts
    if (rawInput.toLowerCase().includes('warfacealpine10@gmail.com') || rawInput.toLowerCase().includes('alice@university.edu') || rawInput.toLowerCase().includes('testuser@example.com') || rawInput.toLowerCase().includes('user@example.com')) {
      return HttpResponse.json({
        exists: true,
        isAccountActive: true,
        maskedIdentifier: rawInput,
        role: 'STUDENT',
      });
    }

    return HttpResponse.json({
      exists: false,
      isAccountActive: false,
    });
  }),

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

    const authHeader = request.headers.get('Authorization') || '';
    let filtered = [...mockStudentsDb];

    // For teacher accounts, only return students assigned to the teacher
    if (authHeader.includes('teacher')) {
      filtered = filtered.filter(
        (s) => ['1', '2'].includes(s.id) || s.major === '计算机科学' || s.major === '心理学'
      );
    }

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

  http.get(api('/api/students/import/template'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return res;
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not fetch real template, falling back to mock", e);
      }
    }
    const templateContent = '\uFEFF学号,姓名,专业,入学日期,身份证号,性别,民族,联系电话,电子邮箱,家庭住址,紧急联系人,紧急联系电话,班主任/辅导员工号\n';
    return new HttpResponse(templateContent, {
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': 'attachment; filename="student_import_template.csv"'
      }
    });
  }),

  http.post(api('/api/students/import/preview'), async ({ request }) => {
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
        console.warn("Could not fetch real preview, falling back to mock", e);
      }
    }

    const mockPreview: StudentImportPreview = {
      totalRows: 3,
      readyCount: 1,
      duplicateCount: 1,
      invalidCount: 1,
      rows: [
        {
          rowNumber: 2,
          studentNumber: 'S2026001',
          name: '陈志远',
          major: '计算机科学',
          enrollmentDate: '2026-09-01',
          idCardNumber: '110101200801011234',
          gender: 'MALE',
          ethnicity: '汉族',
          contactNumber: '13800138000',
          email: 'chenzy@univ.edu.cn',
          teacherEmployeeNumber: 'EMP-00001',
          status: 'READY',
          errors: []
        },
        {
          rowNumber: 3,
          studentNumber: '2021001',
          name: '张伟',
          major: '计算机科学',
          enrollmentDate: '2021-09-01',
          idCardNumber: '110101200301011234',
          gender: 'MALE',
          ethnicity: '汉族',
          contactNumber: '13800138001',
          email: 'zhangwei@univ.edu.cn',
          teacherEmployeeNumber: 'EMP-00001',
          status: 'DUPLICATE',
          errors: [
            {
              field: 'studentNumber',
              code: 'DUPLICATE_IN_DATABASE',
              invalidValue: '2021001'
            }
          ]
        },
        {
          rowNumber: 4,
          studentNumber: 'S2026002',
          name: '王某',
          major: '不存在的专业',
          enrollmentDate: '2026-09-01',
          idCardNumber: '123',
          gender: 'MALE',
          ethnicity: '汉族',
          contactNumber: '12345',
          email: 'invalid-email',
          teacherEmployeeNumber: null,
          status: 'INVALID',
          errors: [
            {
              field: 'major',
              code: 'MAJOR_NOT_FOUND',
              invalidValue: '不存在的专业'
            },
            {
              field: 'idCardNumber',
              code: 'INVALID_ID_CARD_FORMAT',
              invalidValue: '123'
            },
            {
              field: 'contactNumber',
              code: 'INVALID_PHONE_FORMAT',
              invalidValue: '12345'
            }
          ]
        }
      ]
    };

    return HttpResponse.json(mockPreview);
  }),

  http.post(api('/api/students/import/commit'), async ({ request }) => {
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
        console.warn("Could not fetch real commit, falling back to mock", e);
      }
    }

    const body = (await request.json()) as StudentImportCommitRequest;
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const failedRows: StudentImportRow[] = [];

    body.rows.forEach(row => {
      if (row.status === 'INVALID') {
        failedRows.push(row);
      } else if (row.status === 'READY') {
        imported++;
        mockStudentsDb.push({
          id: String(mockStudentsDb.length + 1),
          studentNumber: row.studentNumber,
          name: row.name,
          major: row.major,
          year: '大一',
          status: 'Active',
          riskLevel: 'LOW',
          demographics: {
            gender: (row.gender as any) || 'MALE',
            ethnicity: row.ethnicity || '汉族',
            idCardNumber: row.idCardNumber || undefined,
            contactNumber: row.contactNumber || undefined,
            email: row.email || `${row.studentNumber}@univ.edu.cn`,
            homeAddress: row.homeAddress || undefined,
            emergencyContactName: row.emergencyContactName || undefined,
            emergencyContactPhone: row.emergencyContactPhone || undefined
          }
        });
      } else if (row.status === 'DUPLICATE') {
        if (body.overwriteDuplicates) {
          updated++;
          const idx = mockStudentsDb.findIndex(s => s.studentNumber === row.studentNumber);
          if (idx !== -1) {
            mockStudentsDb[idx] = {
              ...mockStudentsDb[idx],
              name: row.name,
              major: row.major,
              demographics: {
                ...mockStudentsDb[idx].demographics,
                gender: (row.gender as any) || mockStudentsDb[idx].demographics?.gender,
                ethnicity: row.ethnicity || mockStudentsDb[idx].demographics?.ethnicity,
                contactNumber: row.contactNumber || mockStudentsDb[idx].demographics?.contactNumber,
                email: row.email || mockStudentsDb[idx].demographics?.email,
                homeAddress: row.homeAddress || mockStudentsDb[idx].demographics?.homeAddress
              }
            };
          }
        } else {
          skipped++;
        }
      }
    });

    const result: StudentImportResult = {
      totalProcessed: body.rows.length,
      importedCount: imported,
      updatedCount: updated,
      skippedCount: skipped,
      failedRows
    };

    return HttpResponse.json(result);
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

    const student = mockStudentsDb.find((s) => String(s.id) === String(id) || s.studentNumber === String(id));
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
      feedback: (referral as any).extendedData?.feedback || null,
      attachments: referral.attachments || []
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
    const { referralId, feedback, content, attachments } = data;

    const referral = mockReferralsDb.find((r) => r.id === referralId);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }

    referral.status = 'AWAITING_FEEDBACK_APPROVAL';

    if (!(referral as any).extendedData) {
      (referral as any).extendedData = {};
    }
    if (!(referral as any).extendedData.feedback) {
      (referral as any).extendedData.feedback = { summary: '', followUp: '', attachments: [] };
    }
    (referral as any).extendedData.feedback.summary = content || feedback || '诊疗反馈已提交';
    (referral as any).extendedData.feedback.attachments = (attachments || []).map((att: any, idx: number) => ({
      name: att.name,
      size: att.size || '1.0 MB',
      fileId: att.fileId || (300 + idx)
    }));

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
  }),

  http.post(api('/api/files/upload-intent'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not fetch real file upload intent, falling back to mock", e);
      }
    }
    const body = await request.json() as any;
    return HttpResponse.json({
      fileId: Date.now(),
      presignedUploadUrl: 'https://mock-storage.university.edu/upload',
      storageKey: `mock/${body?.filename || 'file'}`,
      expiresInSeconds: 300
    }, { status: 201 });
  }),

  http.post(api('/api/files/:id/complete'), async ({ request, params }) => {
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
        console.warn("Could not fetch real file complete, falling back to mock", e);
      }
    }
    return HttpResponse.json({
      fileId: Number(params.id),
      status: 'ACTIVE'
    });
  }),

  http.get(api('/api/referrals/:referralId/attachments/:fileId/download-url'), async ({ request, params }) => {
    const url = new URL(request.url);
    const intent = url.searchParams.get('intent') || 'DOWNLOAD';
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
        console.warn("Could not fetch real download url, falling back to mock", e);
      }
    }
    return HttpResponse.json({
      downloadUrl: `https://mock-storage.university.edu/download/${params.fileId}?intent=${intent}`,
      expiresInSeconds: 60
    });
  }),

  // Admin User Management Handlers
  http.get(api('/api/admin/users'), async ({ request }) => {
    await delay(MOCK_DELAY_MS);
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real admin users, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword')?.toLowerCase();

    let users = [...mockAdminUsersDb];
    if (role) users = users.filter((u) => u.role === role);
    if (status) users = users.filter((u) => u.status === status);
    if (keyword) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword) ||
          u.employeeOrStudentId?.toLowerCase().includes(keyword)
      );
    }
    return HttpResponse.json(users);
  }),

  http.get(api('/api/admin/users/:id'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real user details, falling back to mock", e);
      }
    }
    const userId = Number(params.id);
    const user = mockAdminUsersDb.find((u) => u.id === userId);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.put(api('/api/admin/users/:id/status'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not update real user status, falling back to mock", e);
      }
    }
    const userId = Number(params.id);
    const body = (await request.json()) as any;
    const user = mockAdminUsersDb.find((u) => u.id === userId);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    user.status = body.status;
    if (body.status === 'DELETED') {
      user.deletedAt = new Date().toISOString();
    } else if (body.status === 'ACTIVE' && user.deletedAt) {
      delete user.deletedAt;
    }
    return HttpResponse.json(user);
  }),

  http.delete(api('/api/admin/users/:id'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not delete real user, falling back to mock", e);
      }
    }
    const userId = Number(params.id);
    const user = mockAdminUsersDb.find((u) => u.id === userId);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    user.status = 'DELETED';
    user.deletedAt = new Date().toISOString();
    return HttpResponse.json(user);
  }),

  // Admin Catalog Availability Toggle
  http.put(api('/api/assessments/catalog/:batteryCode/availability'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not update real scale availability, falling back to mock", e);
      }
    }
    const { batteryCode } = params;
    const body = (await request.json()) as any;
    const item = mockAssessmentCatalog.find((c) => c.batteryCode === batteryCode);
    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }
    item.isEnabled = body.isAvailable;
    return HttpResponse.json(item);
  }),

  // Admin Referral Cancellation
  http.post(api('/api/referrals/:id/cancel'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not cancel referral on real backend, falling back to mock", e);
      }
    }
    const { id } = params;
    const referral = mockReferralsDb.find((r) => r.id === id);
    if (!referral) {
      return new HttpResponse(null, { status: 404 });
    }
    referral.status = 'CLOSED';
    return HttpResponse.json(referral);
  }),

  // User Profile
  http.get(api('/api/user/profile'), async ({ request }) => {
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
        console.warn("Could not fetch real user profile, falling back to mock", e);
      }
    }
    const authHeader = request.headers.get('Authorization') || '';
    let roleKey = 'student';
    if (authHeader.includes('teacher')) roleKey = 'teacher';
    else if (authHeader.includes('head_councillor')) roleKey = 'head_councillor';
    else if (authHeader.includes('trial_admin')) roleKey = 'trial_admin';
    else if (authHeader.includes('doctor')) roleKey = 'doctor';
    else if (authHeader.includes('admin')) roleKey = 'admin';

    const profile = mockProfilesDb[roleKey] || mockProfilesDb.student;
    return HttpResponse.json(profile);
  }),

  http.put(api('/api/user/profile'), async ({ request }) => {
    const rawCloned = request.clone();
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(rawCloned));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not update real user profile, falling back to mock", e);
      }
    }
    const body = (await request.json()) as UpdateUserProfileRequest;

    const authHeader = request.headers.get('Authorization') || '';
    let roleKey = 'student';
    if (authHeader.includes('teacher')) roleKey = 'teacher';
    else if (authHeader.includes('head_councillor')) roleKey = 'head_councillor';
    else if (authHeader.includes('trial_admin')) roleKey = 'trial_admin';
    else if (authHeader.includes('doctor')) roleKey = 'doctor';
    const profile = mockProfilesDb[roleKey] || mockProfilesDb.student;
    if (body.name) {

      profile.name = body.name;
      if (!body.avatarInitial) {
        profile.avatarInitial = body.name.charAt(0);
      }
    }
    if (body.email) profile.email = body.email;
    if (body.avatarInitial) profile.avatarInitial = body.avatarInitial;
    if (body.avatarBg) profile.avatarBg = body.avatarBg;


    if (profile.studentProfile) {
      if (body.gender !== undefined) profile.studentProfile.gender = body.gender;
      if (body.birthday !== undefined) profile.studentProfile.birthday = body.birthday;
      if (body.ethnicity !== undefined) profile.studentProfile.ethnicity = body.ethnicity;
      if (body.idCardNumber !== undefined) profile.studentProfile.idCardNumber = body.idCardNumber;
      if (body.contactNumber !== undefined) profile.studentProfile.contactNumber = body.contactNumber;
      if (body.homeAddress !== undefined) profile.studentProfile.homeAddress = body.homeAddress;
      if (body.emergencyContactName !== undefined) profile.studentProfile.emergencyContactName = body.emergencyContactName;
      if (body.emergencyContactPhone !== undefined) profile.studentProfile.emergencyContactPhone = body.emergencyContactPhone;
      if (body.emergencyContactRelation !== undefined) profile.studentProfile.emergencyContactRelation = body.emergencyContactRelation;
    }

    return HttpResponse.json(profile);
  }),

  // === Admin References Management Endpoints ===

  http.get(api('/api/admin/references/schools'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real schools, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockSchoolsDb;
    if (!includeDeprecated) res = res.filter((c) => c.status === 'ACTIVE');
    if (query) res = res.filter((c) => c.name.toLowerCase().includes(query));
    return HttpResponse.json(res);
  }),

  http.get(api('/api/admin/references/colleges'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real colleges, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockCollegesDb;
    if (!includeDeprecated) res = res.filter((c) => c.status === 'ACTIVE');
    if (query) res = res.filter((c) => c.name.toLowerCase().includes(query));
    return HttpResponse.json(res);
  }),

  http.get(api('/api/admin/references/majors'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real majors, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const collegeId = url.searchParams.get('collegeId');
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockMajorsDb;
    if (collegeId) res = res.filter((m) => m.collegeId === Number(collegeId));
    if (!includeDeprecated) res = res.filter((m) => m.status === 'ACTIVE');
    if (query) res = res.filter((m) => m.name.toLowerCase().includes(query) || m.collegeName.toLowerCase().includes(query));
    return HttpResponse.json(res);
  }),

  http.get(api('/api/admin/references/school-departments'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real school departments, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockSchoolDepartmentsDb;
    if (!includeDeprecated) res = res.filter((d) => d.status === 'ACTIVE');
    if (query) res = res.filter((d) => d.name.toLowerCase().includes(query));
    return HttpResponse.json(res);
  }),

  http.get(api('/api/admin/references/hospitals'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real hospitals, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockAdminHospitalsDb;
    if (!includeDeprecated) res = res.filter((h) => h.status === 'ACTIVE');
    if (query) res = res.filter((h) => h.name.toLowerCase().includes(query) || (h.address?.toLowerCase().includes(query) ?? false));
    return HttpResponse.json(res);
  }),

  http.get(api('/api/admin/references/hospital-departments'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real hospital departments, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const hospitalId = url.searchParams.get('hospitalId');
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockHospitalDepartmentsDb;
    if (hospitalId) res = res.filter((d) => d.hospitalId === Number(hospitalId));
    if (!includeDeprecated) res = res.filter((d) => d.status === 'ACTIVE');
    if (query) res = res.filter((d) => d.name.toLowerCase().includes(query) || d.hospitalName.toLowerCase().includes(query));
    return HttpResponse.json(res);
  }),

  http.get(api('/api/admin/references/ethnicities'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real ethnicities, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockEthnicitiesDb;
    if (!includeDeprecated) res = res.filter((e) => e.status === 'ACTIVE');
    if (query) res = res.filter((e) => e.name.toLowerCase().includes(query));
    return HttpResponse.json(res);
  }),

  http.get(api('/api/admin/references/degree-levels'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not fetch real degree levels, falling back to mock", e);
      }
    }
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase();
    const includeDeprecated = url.searchParams.get('includeDeprecated') !== 'false';
    let res = mockDegreeLevelsDb;
    if (!includeDeprecated) res = res.filter((d) => d.status === 'ACTIVE');
    if (query) res = res.filter((d) => d.name.toLowerCase().includes(query));
    return HttpResponse.json(res);
  }),

  http.post(api('/api/admin/references/schools'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real school, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string };
    const newItem: SchoolDto = {
      id: Date.now(),
      name: body.name,
      status: 'ACTIVE',
      departmentCount: 0,
      studentCount: 0,
    };
    mockSchoolsDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.post(api('/api/admin/references/colleges'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real college, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string };
    const newItem: CollegeDto = {
      id: Date.now(),
      name: body.name,
      status: 'ACTIVE',
      majorCount: 0,
      teacherCount: 0,
    };
    mockCollegesDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.post(api('/api/admin/references/majors'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real major, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string; collegeId: number };
    const college = mockCollegesDb.find((c) => c.id === body.collegeId);
    const newItem: MajorDto = {
      id: Date.now(),
      name: body.name,
      collegeId: body.collegeId,
      collegeName: college?.name || '所属学院',
      status: 'ACTIVE',
      studentCount: 0,
    };
    mockMajorsDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.post(api('/api/admin/references/school-departments'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real school department, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string };
    const newItem: SchoolDepartmentDto = {
      id: Date.now(),
      name: body.name,
      schoolId: 1,
      schoolName: '中南大学',
      status: 'ACTIVE',
      staffCount: 0,
    };
    mockSchoolDepartmentsDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.post(api('/api/admin/references/hospitals'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real hospital, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string; address?: string; contactPhone?: string };
    const newItem: AdminHospitalDto = {
      id: Date.now(),
      name: body.name,
      address: body.address,
      contactPhone: body.contactPhone,
      status: 'ACTIVE',
      departmentCount: 0,
      activeReferralCount: 0,
    };
    mockAdminHospitalsDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.post(api('/api/admin/references/hospital-departments'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real hospital department, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string; hospitalId: number };
    const hospital = mockAdminHospitalsDb.find((h) => h.id === body.hospitalId);
    const newItem: HospitalDepartmentDto = {
      id: Date.now(),
      name: body.name,
      hospitalId: body.hospitalId,
      hospitalName: hospital?.name || '所属医院',
      status: 'ACTIVE',
      doctorCount: 0,
    };
    mockHospitalDepartmentsDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.post(api('/api/admin/references/ethnicities'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real ethnicity, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string };
    const newItem: EthnicityDto = {
      id: Date.now(),
      name: body.name,
      status: 'ACTIVE',
      studentCount: 0,
    };
    mockEthnicitiesDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.post(api('/api/admin/references/degree-levels'), async ({ request }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json(), { status: 201 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not create real degree level, falling back to mock", e);
      }
    }
    const body = (await request.json()) as { name: string };
    const newItem: DegreeLevelDto = {
      id: Date.now(),
      name: body.name,
      status: 'ACTIVE',
      studentCount: 0,
    };
    mockDegreeLevelsDb.push(newItem);
    return HttpResponse.json(newItem, { status: 201 });
  }),

  http.put(api('/api/admin/references/:categoryPath/:id'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request.clone()));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not update real reference, falling back to mock", e);
      }
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body });
  }),

  http.get(api('/api/admin/references/:category/:id/dependency-check'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.ok) {
          return HttpResponse.json(await res.json());
        }
      } catch (e) {
        console.warn("Could not check real dependencies, falling back to mock", e);
      }
    }
    const id = Number(params.id);
    const category = params.category as ReferenceCategory;
    
    // Simulate realistic dependency check
    if (id === 1) {
      return HttpResponse.json({
        targetId: id,
        category,
        canHardDelete: false,
        totalReferences: 22,
        dependencies: [
          { subjectType: 'STUDENT', count: 18 },
          { subjectType: 'MAJOR', count: 4 },
        ],
      });
    }
    return HttpResponse.json({
      targetId: id,
      category,
      canHardDelete: true,
      totalReferences: 0,
      dependencies: [],
    });
  }),

  http.patch(api('/api/admin/references/:category/:id/deprecate'), async ({ request, params }) => {
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
        console.warn("Could not deprecate real reference, falling back to mock", e);
      }
    }
    const id = Number(params.id);
    const category = params.category as ReferenceCategory;
    if (category === 'SCHOOL') {
      const s = mockSchoolsDb.find((item) => item.id === id);
      if (s) s.status = 'DEPRECATED';
      return HttpResponse.json(s);
    }
    if (category === 'COLLEGE') {
      const c = mockCollegesDb.find((item) => item.id === id);
      if (c) c.status = 'DEPRECATED';
      return HttpResponse.json(c);
    }
    return HttpResponse.json({ id, status: 'DEPRECATED' });
  }),

  http.patch(api('/api/admin/references/:category/:id/reactivate'), async ({ request, params }) => {
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
        console.warn("Could not reactivate real reference, falling back to mock", e);
      }
    }
    const id = Number(params.id);
    const category = params.category as ReferenceCategory;
    if (category === 'SCHOOL') {
      const s = mockSchoolsDb.find((item) => item.id === id);
      if (s) s.status = 'ACTIVE';
      return HttpResponse.json(s);
    }
    if (category === 'COLLEGE') {
      const c = mockCollegesDb.find((item) => item.id === id);
      if (c) c.status = 'ACTIVE';
      return HttpResponse.json(c);
    }
    return HttpResponse.json({ id, status: 'ACTIVE' });
  }),

  http.delete(api('/api/admin/references/:category/:id'), async ({ request, params }) => {
    if (import.meta.env.MODE !== 'test') {
      try {
        const { bypass } = await import('msw');
        const res = await fetch(bypass(request));
        if (res.status === 204 || res.ok) {
          return new HttpResponse(null, { status: 204 });
        }
        if (res.status >= 400 && res.status < 500) {
          const errBody = await res.json().catch(() => ({}));
          return HttpResponse.json(errBody, { status: res.status });
        }
      } catch (e) {
        console.warn("Could not delete real reference, falling back to mock", e);
      }
    }
    const id = Number(params.id);
    const cat = params.category as ReferenceCategory;
    if (cat === 'SCHOOL') {
      const idx = mockSchoolsDb.findIndex((s) => s.id === id);
      if (idx !== -1) mockSchoolsDb.splice(idx, 1);
    }
    if (cat === 'COLLEGE') {
      const idx = mockCollegesDb.findIndex((c) => c.id === id);
      if (idx !== -1) mockCollegesDb.splice(idx, 1);
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

export const mockProfilesDb: Record<string, UserProfileDto> = {
  student: {
    id: 10,
    name: '张伟',
    role: 'STUDENT',
    email: 'zhangwei@univ.edu.cn',
    avatarInitial: '张',
    avatarBg: '#E47035',
    passwordLastChanged: '已设置并受保护',
    studentProfile: {
      studentNumber: '2023001092',
      school: '中南大学',
      major: '计算机科学与技术',
      academicYear: '2023级',
      gender: 'MALE',
      birthday: '2001年2月5日',
      ethnicity: '汉族',
      idCardNumber: '110101200102051234',
      contactNumber: '13800138000',
      homeAddress: '湖南省长沙市岳麓区中南大学本部',
      emergencyContactName: '张建国',
      emergencyContactPhone: '13900139000',
      emergencyContactRelation: '父亲'
    },
    staffProfile: null
  },
  teacher: {
    id: 2,
    name: '艾米丽·沃森',
    role: 'TEACHER',
    email: 'emily@univ.edu.cn',
    avatarInitial: '艾',
    avatarBg: '#E47035',
    passwordLastChanged: '已设置并受保护',
    studentProfile: null,
    staffProfile: {
      employeeNumber: 'EMP-00001',
      organization: '医学院',
      department: '基础医学院',
      title: '专任教师 / 班导师',
      contactNumber: '13800138001'
    }
  },
  head_counsellor: {
    id: 3,
    name: '王主任',
    role: 'HEAD_COUNSELLOR',
    email: 'wang_head@univ.edu.cn',
    avatarInitial: '王',
    avatarBg: '#E47035',
    passwordLastChanged: '已设置并受保护',
    studentProfile: null,
    staffProfile: {
      employeeNumber: 'HC-00001',
      organization: '中南大学心理健康教育中心',
      department: '学生心理危机干预中心',
      title: '心理中心主管',
      contactNumber: '13800138002'
    }
  },
  doctor: {
    id: 5,
    name: '李医生',
    role: 'DOCTOR',
    email: 'li@univ.edu.cn',
    avatarInitial: '李',
    avatarBg: '#E47035',
    passwordLastChanged: '已设置并受保护',
    studentProfile: null,
    staffProfile: {
      employeeNumber: 'DOC-00001',
      organization: '中南大学湘雅医院',
      department: '精神心理科',
      title: '主治医师',
      contactNumber: '13800138003'
    }
  },
  trial_admin: {
    id: 4,
    name: '张老师',
    role: 'TRIAL_ADMIN',
    email: 'zhang@univ.edu.cn',
    avatarInitial: '张',
    avatarBg: '#E47035',
    passwordLastChanged: '已设置并受保护',
    studentProfile: null,
    staffProfile: {
      employeeNumber: 'TA-00001',
      organization: '临床科研与试验中心',
      department: '科研管理办公室',
      title: '试验项目管理员',
      contactNumber: '13800138004'
    }
  },
  admin: {
    id: 1,
    name: '系统管理员',
    role: 'SYSTEM_ADMIN',
    email: 'admin@univ.edu.cn',
    avatarInitial: '管',
    avatarBg: '#E47035',
    passwordLastChanged: '已设置并受保护',
    studentProfile: null,
    staffProfile: {
      employeeNumber: 'SYS-ADMIN',
      organization: '信息化建设与管理处',
      department: '系统治理与安全管理部',
      title: '超级管理员',
      contactNumber: '13800138005'
    }
  }
};

