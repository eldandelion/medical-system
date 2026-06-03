import { Referral } from '../../types';

const baseReferrals: Referral[] = [
  {
    id: '1',
    studentName: '张伟',
    type: '初次转诊',
    date: '2026年4月12日',
    reason: '期中考试后出现急性恐慌发作和睡眠剥夺',
    riskLevel: 'High',
    status: 'Approved',
    referredBy: { name: '张教授' }
  },
  {
    id: '2',
    studentName: '李娜',
    type: '随访',
    date: '2026年4月20日',
    reason: '每周治疗随访；情绪持续低落',
    riskLevel: 'Medium',
    status: 'Pending',
    referredBy: { name: '李医生' }
  },
  {
    id: '3',
    studentName: '王强',
    type: '初次转诊',
    date: '2026年5月5日',
    reason: '因注意力问题和学业压力自愿转诊',
    riskLevel: 'Low',
    status: 'Draft',
    referredBy: { name: '王老师' }
  },
  {
    id: '4',
    studentName: '陈思宇',
    type: '紧急',
    date: '2026年4月18日',
    reason: '宿舍事故报告；提到自杀意念',
    riskLevel: 'High',
    status: 'Approved',
    referredBy: { name: '宿舍管理员' }
  },
  {
    id: '5',
    studentName: '赵明',
    type: '随访',
    date: '2026年4月15日',
    reason: '药物复核；报告注意力集中情况有所改善',
    riskLevel: 'Low',
    status: 'Closed',
    referredBy: { name: '李医生' }
  },
  {
    id: '6',
    studentName: '孙悦',
    type: '初次转诊',
    date: '2026年4月22日',
    reason: '持续疲劳并退出社交活动',
    riskLevel: 'Medium',
    status: 'Pending',
    referredBy: { name: '张教授' }
  },
  {
    id: '7',
    studentName: '周杰',
    type: '转诊',
    date: '2026年4月10日',
    reason: '与工作相关的压力和创伤后症状',
    riskLevel: 'High',
    status: 'Closed',
    referredBy: { name: '心理咨询中心' }
  },
  {
    id: '8',
    studentName: '王小明',
    type: '初次转诊',
    date: '2026年4月28日',
    reason: '由于学业压力导致严重的睡眠障碍 and 情绪波动',
    riskLevel: 'Medium',
    status: 'AwaitingApproval',
    referredBy: { name: '陈老师' }
  }
];

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
      fullDescription: referral.reason + '。补充背景：该学生在维持全额课程负荷的同时，每周在实验室工作20小时以上。入睡潜伏期超过90分钟。初步临床访谈显示存在继发性焦虑症状，且面临中度学业倦怠风险。'
    },
    destination: {
      hospital: '中央大学医学中心',
      department: '精神医学与行为科学科',
      doctor: '张医生 (总住院医师)',
      admin: '系统处理程序 (自动分配)',
      transferDate: referral.date
    },
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
    feedback: {
      summary: '患者呈现广泛性焦虑障碍（GAD）的临床症状。建议药物干预（来士普 10mg）并进行6次针对失眠的认知行为治疗（CBT-I）。',
      followUp: '每两周与咨询师进行一次面谈；1个月后重新进行精神科评估。',
      attachments: [
        { name: '临床接诊报告.pdf', size: '1.2 MB' },
        { name: '医院出院摘要.pdf', size: '840 KB' },
        { name: '处方复印件.jpg', size: '2.1 MB' }
      ]
    }
  }
}));
