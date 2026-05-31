export interface Referral {
  id: string;
  studentName: string;
  type: string;
  date: string;
  reason: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Closed' | 'Pending' | 'Approved' | 'AwaitingApproval';
  referredBy: {
    name: string;
    avatar?: string;
  };
}

export const mockReferralsDb: Referral[] = [
  {
    id: '1',
    studentName: 'Daniil Petrov',
    type: '初次转诊',
    date: '2026年4月12日',
    reason: '期中考试后出现急性恐慌发作和睡眠剥夺',
    riskLevel: 'High',
    status: 'Approved',
    referredBy: { name: '张教授' }
  },
  {
    id: '2',
    studentName: 'Alice Smith',
    type: '随访',
    date: '2026年4月20日',
    reason: '每周治疗随访；情绪持续低落',
    riskLevel: 'Medium',
    status: 'Pending',
    referredBy: { name: '李医生' }
  },
  {
    id: '3',
    studentName: 'Bob Johnson',
    type: '初次转诊',
    date: '2026年5月5日',
    reason: '因注意力问题和学业压力自愿转诊',
    riskLevel: 'Low',
    status: 'Draft',
    referredBy: { name: '王老师' }
  },
  {
    id: '4',
    studentName: 'Elena Gilbert',
    type: '紧急',
    date: '2026年4月18日',
    reason: '宿舍事故报告；提到自杀意念',
    riskLevel: 'High',
    status: 'Approved',
    referredBy: { name: '宿舍管理员' }
  },
  {
    id: '5',
    studentName: 'Chris Evans',
    type: '随访',
    date: '2026年4月15日',
    reason: '药物复核；报告注意力集中情况有所改善',
    riskLevel: 'Low',
    status: 'Closed',
    referredBy: { name: '李医生' }
  },
  {
    id: '6',
    studentName: 'Sarah Connor',
    type: '初次转诊',
    date: '2026年4月22日',
    reason: '持续疲劳并退出社交活动',
    riskLevel: 'Medium',
    status: 'Pending',
    referredBy: { name: '张教授' }
  },
  {
    id: '7',
    studentName: 'James Bond',
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
