import { Referral, ReferralStep } from '../../types';

const baseReferrals: Referral[] = [
  {
    id: '1',
    studentId: '1',
    studentName: '张伟',
    studentNumber: '2022001',
    type: 'INITIAL',
    date: '2026-04-12T00:00:00Z',
    title: '期中考试后急性焦虑',
    description: '期中考试后出现急性恐慌发作和睡眠剥夺',
    riskLevel: 'HIGH',
    status: 'AWAITING_FEEDBACK_APPROVAL',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '2',
    studentId: '2',
    studentName: '李娜',
    studentNumber: '2023002',
    type: 'FOLLOW_UP',
    date: '2026-04-20T00:00:00Z',
    title: '每周治疗随访',
    description: '情绪持续低落',
    riskLevel: 'MEDIUM',
    status: 'AWAITING_TRIAGE',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '3',
    studentId: '3',
    studentName: '王强',
    studentNumber: '2021003',
    type: 'INITIAL',
    date: '2026-05-05T00:00:00Z',
    title: '自愿转诊',
    description: '因注意力问题和学业压力自愿转诊',
    riskLevel: 'LOW',
    status: 'DRAFT',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '4',
    studentId: '4',
    studentName: '陈思宇',
    studentNumber: '2022004',
    type: 'CRISIS_INTERVENTION',
    date: '2026-04-18T00:00:00Z',
    title: '宿舍事故报告',
    description: '提到自杀意念',
    riskLevel: 'HIGH',
    status: 'REJECTED',
    referredBy: { name: '张明诚' }
  },
  {
    id: '5',
    studentId: '5',
    studentName: '赵明',
    studentNumber: '2023005',
    type: 'FOLLOW_UP',
    date: '2026-04-15T00:00:00Z',
    title: '药物复核',
    description: '报告注意力集中情况有所改善',
    riskLevel: 'LOW',
    status: 'CLOSED',
    referredBy: { name: '张明诚' }
  },
  {
    id: '6',
    studentId: '6',
    studentName: '孙悦',
    studentNumber: '2021006',
    type: 'INITIAL',
    date: '2026-04-22T00:00:00Z',
    title: '退出社交活动',
    description: '持续疲劳并退出社交活动',
    riskLevel: 'MEDIUM',
    status: 'AWAITING_TRIAGE',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '7',
    studentId: '7',
    studentName: '周杰',
    studentNumber: '2022007',
    type: 'OTHER',
    date: '2026-04-10T00:00:00Z',
    title: '工作压力',
    description: '与工作相关的压力和创伤后症状',
    riskLevel: 'HIGH',
    status: 'CLOSED',
    referredBy: { name: '张明诚' }
  },
  {
    id: '8',
    studentId: '8',
    studentName: '王小明',
    studentNumber: '2023008',
    type: 'INITIAL',
    date: '2026-04-28T00:00:00Z',
    title: '严重睡眠障碍',
    description: '由于学业压力导致严重的睡眠障碍和情绪波动',
    riskLevel: 'MEDIUM',
    status: 'AWAITING_REVIEW',
    referredBy: { name: '艾米丽·沃森' }
  },
  {
    id: '9',
    studentId: '9',
    studentName: '赵云',
    studentNumber: '2021009',
    type: 'INITIAL',
    date: '2026-06-15T00:00:00Z',
    title: '情绪严重低落',
    description: '学生近期表现出明显的情绪低落和厌学倾向',
    riskLevel: 'MEDIUM',
    status: 'AWAITING_TRIAGE',
    referredBy: { name: '张明诚' }
  }
];

export const generateTrackerSteps = (referral: Referral): ReferralStep[] => {
  const isDraft = referral.status === 'DRAFT';
  const isAwaiting = referral.status === 'AWAITING_REVIEW';
  const isAwaitingTriage = referral.status === 'AWAITING_TRIAGE';
  const hasDoctorRejection = (referral as any).extendedData?.rejectedBy && (referral as any).extendedData.rejectedBy.length > 0;
  const isWaitingForScheduling = referral.status === 'WAITING_FOR_SCHEDULING';
  const isWaitingForAppointment = referral.status === 'WAITING_FOR_APPOINTMENT';
  const isAwaitingFeedbackApproval = referral.status === 'AWAITING_FEEDBACK_APPROVAL';
  const isClosed = referral.status === 'CLOSED';

  const steps: ReferralStep[] = [
    {
      id: `${referral.id}-1`,
      type: 'INITIATION',
      time: isDraft ? '' : referral.date,
      status: isDraft ? 'PENDING' : 'COMPLETED'
    },
    {
      id: `${referral.id}-2`,
      type: 'REVIEW',
      time: isDraft ? '' : (isAwaiting ? '等待中' : '2026年4月29日'),
      status: isDraft ? 'PENDING' : (isAwaiting ? 'ACTIVE' : 'COMPLETED')
    },
    {
      id: `${referral.id}-3`,
      type: 'TRIAGE',
      time: (isDraft || isAwaiting) ? '' : (isAwaitingTriage ? '进行中' : '2026年4月30日'),
      status: (isDraft || isAwaiting) ? 'PENDING' : (isAwaitingTriage ? 'ACTIVE' : 'COMPLETED')
    },
    {
      id: `${referral.id}-3.5`,
      type: 'SCHEDULING',
      time: (isDraft || isAwaiting || isAwaitingTriage || isWaitingForScheduling) ? '' : '2026年4月30日',
      status: (isDraft || isAwaiting || isAwaitingTriage) ? (hasDoctorRejection && isAwaitingTriage ? 'ISSUE' : 'PENDING') : (isWaitingForScheduling ? 'ACTIVE' : 'COMPLETED')
    },
    {
      id: `${referral.id}-4`,
      type: 'EVALUATION',
      time: (isDraft || isAwaiting || isAwaitingTriage || isWaitingForScheduling || isWaitingForAppointment) ? '' : '2026年5月1日',
      status: (isDraft || isAwaiting || isAwaitingTriage || isWaitingForScheduling) ? 'PENDING' : (isWaitingForAppointment ? 'ACTIVE' : 'COMPLETED')
    },
    {
      id: `${referral.id}-5`,
      type: 'FEEDBACK',
      time: isClosed ? '2026年5月2日' : '',
      status: isClosed ? 'COMPLETED' : (isAwaitingFeedbackApproval ? 'ACTIVE' : 'PENDING')
    }
  ];

  // Add a specific mock issue for Chen Siyu to showcase the "ISSUE" status
  if (referral.id === '4') {
    steps[2].status = 'ISSUE';
    steps[2].time = '2026年4月19日';
    
    // Ensure subsequent steps remain pending/empty
    steps[3].status = 'PENDING';
    steps[3].time = '';
    steps[4].status = 'PENDING';
    steps[4].time = '';
  }

  return steps;
};

export const mockReferralsDb: Referral[] = baseReferrals.map(referral => ({
  ...referral
}));

