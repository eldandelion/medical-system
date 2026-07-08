import { Referral, ReferralStep } from '../../types';

const baseReferrals: Referral[] = [
  {
    id: '1',
    studentName: '张伟',
    studentNumber: '2022001',
    type: '初次转诊',
    date: '2026-04-12T00:00:00Z',
    title: '期中考试后急性焦虑',
    description: '期中考试后出现急性恐慌发作和睡眠剥夺',
    riskLevel: 'High',
    status: 'AwaitingFeedbackApproval',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '2',
    studentName: '李娜',
    studentNumber: '2023002',
    type: '随访',
    date: '2026-04-20T00:00:00Z',
    title: '每周治疗随访',
    description: '情绪持续低落',
    riskLevel: 'Medium',
    status: 'AwaitingTriage',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '3',
    studentName: '王强',
    studentNumber: '2021003',
    type: '初次转诊',
    date: '2026-05-05T00:00:00Z',
    title: '自愿转诊',
    description: '因注意力问题和学业压力自愿转诊',
    riskLevel: 'Low',
    status: 'Draft',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '4',
    studentName: '陈思宇',
    studentNumber: '2022004',
    type: '紧急',
    date: '2026-04-18T00:00:00Z',
    title: '宿舍事故报告',
    description: '提到自杀意念',
    riskLevel: 'High',
    status: 'Rejected',
    referredBy: { name: '张明诚' }
  },
  {
    id: '5',
    studentName: '赵明',
    studentNumber: '2023005',
    type: '随访',
    date: '2026-04-15T00:00:00Z',
    title: '药物复核',
    description: '报告注意力集中情况有所改善',
    riskLevel: 'Low',
    status: 'Closed',
    referredBy: { name: '张明诚' }
  },
  {
    id: '6',
    studentName: '孙悦',
    studentNumber: '2021006',
    type: '初次转诊',
    date: '2026-04-22T00:00:00Z',
    title: '退出社交活动',
    description: '持续疲劳并退出社交活动',
    riskLevel: 'Medium',
    status: 'AwaitingTriage',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '7',
    studentName: '周杰',
    studentNumber: '2022007',
    type: '转诊',
    date: '2026-04-10T00:00:00Z',
    title: '工作压力',
    description: '与工作相关的压力和创伤后症状',
    riskLevel: 'High',
    status: 'Closed',
    referredBy: { name: '张明诚' }
  },
  {
    id: '8',
    studentName: '王小明',
    studentNumber: '2023008',
    type: '初次转诊',
    date: '2026-04-28T00:00:00Z',
    title: '严重睡眠障碍',
    description: '由于学业压力导致严重的睡眠障碍和情绪波动',
    riskLevel: 'Medium',
    status: 'AwaitingApproval',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '9',
    studentName: '赵云',
    studentNumber: '2021009',
    type: '初次转诊',
    date: '2026-06-15T00:00:00Z',
    title: '情绪严重低落',
    description: '学生近期表现出明显的情绪低落和厌学倾向',
    riskLevel: 'Medium',
    status: 'AwaitingTriage',
    referredBy: { name: '张明诚' }
  }
];

const generateTrackerSteps = (referral: Referral): ReferralStep[] => {
  const isDraft = referral.status === 'Draft';
  const isAwaiting = referral.status === 'AwaitingApproval';
  const isAwaitingTriage = referral.status === 'AwaitingTriage';
  const hasDoctorRejection = referral.extendedData?.rejectedBy && referral.extendedData.rejectedBy.length > 0;
  const isWaitingForScheduling = referral.status === 'WaitingForScheduling';
  const isWaitingForAppointment = referral.status === 'WaitingForAppointment';
  const isAwaitingFeedbackApproval = referral.status === 'AwaitingFeedbackApproval';
  const isClosed = referral.status === 'Closed';

  const steps: ReferralStep[] = [
    {
      id: `${referral.id}-1`,
      type: 'initiation',
      time: isDraft ? '' : referral.date,
      status: isDraft ? 'pending' : 'completed'
    },
    {
      id: `${referral.id}-2`,
      type: 'review',
      time: isDraft ? '' : (isAwaiting ? '等待中' : '2026年4月29日'),
      status: isDraft ? 'pending' : (isAwaiting ? 'active' : 'completed')
    },
    {
      id: `${referral.id}-3`,
      type: 'triage',
      time: (isDraft || isAwaiting) ? '' : (isAwaitingTriage ? '进行中' : '2026年4月30日'),
      status: (isDraft || isAwaiting) ? 'pending' : (isAwaitingTriage ? 'active' : 'completed')
    },
    {
      id: `${referral.id}-3.5`,
      type: 'scheduling',
      time: (isDraft || isAwaiting || isAwaitingTriage || isWaitingForScheduling) ? '' : '2026年4月30日',
      status: (isDraft || isAwaiting || isAwaitingTriage) ? (hasDoctorRejection && isAwaitingTriage ? 'issue' : 'pending') : (isWaitingForScheduling ? 'active' : 'completed')
    },
    {
      id: `${referral.id}-4`,
      type: 'evaluation',
      time: (isDraft || isAwaiting || isAwaitingTriage || isWaitingForScheduling || isWaitingForAppointment) ? '' : '2026年5月1日',
      status: (isDraft || isAwaiting || isAwaitingTriage || isWaitingForScheduling) ? 'pending' : (isWaitingForAppointment ? 'active' : 'completed')
    },
    {
      id: `${referral.id}-5`,
      type: 'feedback',
      time: isClosed ? '2026年5月2日' : '',
      status: isClosed ? 'completed' : (isAwaitingFeedbackApproval ? 'active' : 'pending')
    }
  ];

  // Add a specific mock issue for Chen Siyu to showcase the "issue" status
  if (referral.id === '4') {
    steps[2].status = 'issue';
    steps[2].time = '2026年4月19日';
    
    // Ensure subsequent steps remain pending/empty
    steps[3].status = 'pending';
    steps[3].time = '';
    steps[4].status = 'pending';
    steps[4].time = '';
  }

  return steps;
};

export const mockReferralsDb: Referral[] = baseReferrals.map(referral => ({
  ...referral,
  extendedData: {
    age: 21,
    gender: '男',
    studentId: 'CSU-987654',
    school: '数理学院',
    grade: '大三',
    phone: '+86 138-xxxx-xxxx',
    triage: {
      isFirstVisit: true,
      isMedicated: false,
      priorTherapy: '无',
      scidDiagnosis: 'F41.1 广泛性焦虑障碍',
      fullDescription: referral.description + '。补充背景：该学生在维持全额课程负荷的同时，每周在实验室工作20小时以上。入睡潜伏期超过90分钟。初步临床访谈显示存在继发性焦虑症状，且面临中度学业倦怠风险。'
    },
    destination: ['Approved', 'AwaitingFeedbackApproval', 'Closed'].includes(referral.status) ? {
      hospital: '中央大学医学中心',
      department: '精神医学与行为科学科',
      doctor: ['2', '5', '9'].includes(referral.id) ? '李医生' : '张医生 (总住院医师)',
      admin: '系统处理程序 (自动分配)',
      transferDate: referral.date
    } : undefined,
    risk: {
      ideation: true,
      attempt: false,
      selfHarm: true,
      notes: '无主动自杀计划，但在高压期间反复出现被动自杀意念。有轻微的前臂自我抓挠史，作为一种适应不良的应对机制。'
    },
    scores: [
      { name: 'PHQ-9 (抑郁)', value: 14, max: 27, level: '中度' },
      { name: 'GAD-7 (焦虑)', value: 16, max: 21, level: '重度' },
      { name: 'ISI (失眠)', value: 19, max: 28, level: '中重度' },
      { name: 'SAS (焦虑自评)', value: 58, max: 80, level: '中度' },
    ],
    feedback: referral.status === 'Closed' ? {
      summary: '患者呈现广泛性焦虑障碍（GAD）的临床症状。建议药物干预（来士普 10mg）并进行6次针对失眠的认知行为治疗（CBT-I）。',
      followUp: '每两周与咨询师进行一次面谈；1个月后重新进行精神科评估。',
      attachments: [
        { name: '临床接诊报告.pdf', size: '1.2 MB' },
        { name: '医院出院摘要.pdf', size: '840 KB' },
        { name: '处方复印件.jpg', size: '2.1 MB' }
      ]
    } : undefined,
    steps: generateTrackerSteps(referral)
  }
}));

