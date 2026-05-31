import { Student } from '../../types';

export const mockStudentsDb: Student[] = [
  {
    id: '1',
    name: 'Daniil Petrov',
    major: '计算机科学',
    year: '大三',
    status: 'Active',
    riskLevel: 'Moderate',
    riskReason: '根据最近的自评，焦虑水平有所上升。',
    referralReason: '因学业压力和持续性失眠自愿寻求帮助，失眠已影响其注意力集中。',
    scidDiagnosis: 'F41.1 广泛性焦虑障碍',
    riskFlags: [
      { label: '自杀意念终身', value: true, severity: 'high' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: true, severity: 'medium' }
    ],
    demographics: {
      age: 21,
      gender: '男',
      studentId: 'CSU-987654',
      emergencyContact: '+44 7700 900012'
    },
    psychometrics: {
      scores: [
        { date: '1月', value: 45 },
        { date: '2月', value: 52 },
        { date: '3月', value: 48 },
        { date: '4月', value: 65 }
      ],
      radarData: [
        { subject: '焦虑', A: 120, fullMark: 150 },
        { subject: '抑郁', A: 110, fullMark: 150 },
        { subject: '压力', A: 135, fullMark: 150 },
        { subject: '睡眠', A: 80, fullMark: 150 },
        { subject: '专注度', A: 90, fullMark: 150 }
      ]
    },
    history: [
      { date: '2025-11-20', type: '医院摘要', description: '在市中心医院进行短期观察；出院时建议校内随访。' },
      { date: '2026-02-15', type: '线下沟通', description: '因出勤不定期与课程顾问面谈。' },
      { date: '2026-03-10', type: '前次转诊', description: '由院系负责人进行筛选；建议进行二次审查。' }
    ]
  },
  {
    id: '2',
    name: 'Alice Smith',
    major: '心理学',
    year: '大四',
    status: 'Active',
    riskLevel: 'High',
    riskReason: '表现出严重的课业倦怠以及重度抑郁因子。',
    referralReason: '出现重度抑郁心境与社交退缩行为，已缺勤三周以上，学业困难明显。',
    scidDiagnosis: 'F32.2 重度抑郁发作，不伴有精神病性症状',
    riskFlags: [
      { label: '自杀意念终身', value: true, severity: 'high' },
      { label: '自杀尝试终身', value: true, severity: 'high' },
      { label: '自伤行为终身', value: true, severity: 'high' }
    ],
    demographics: {
      age: 22,
      gender: '女',
      studentId: 'CSU-110293',
      emergencyContact: '+86 138-0013-8000'
    },
    psychometrics: {
      scores: [
        { date: '1月', value: 62 },
        { date: '2月', value: 70 },
        { date: '3月', value: 75 },
        { date: '4月', value: 88 }
      ],
      radarData: [
        { subject: '焦虑', A: 110, fullMark: 150 },
        { subject: '抑郁', A: 145, fullMark: 150 },
        { subject: '压力', A: 140, fullMark: 150 },
        { subject: '睡眠', A: 45, fullMark: 150 },
        { subject: '专注度', A: 50, fullMark: 150 }
      ]
    },
    history: [
      { date: '2025-12-05', type: '初筛登记', description: '辅导员约谈，自诉情绪低落、缺乏动力，有悲观倾向。' },
      { date: '2026-03-20', type: '心理咨询', description: '进行了危机干预及安全协议签署，通知紧急联系人。' }
    ]
  },
  {
    id: '3',
    name: 'Bob Johnson',
    major: '生物学',
    year: '大一',
    status: 'Inactive',
    riskLevel: 'Low',
    riskReason: '心理测评各项基线指标良好。',
    referralReason: '休学前常规心理健康审查，情绪平稳，不包含临床异常指标。',
    scidDiagnosis: '无临床诊断 (心理健康良好)',
    riskFlags: [
      { label: '自杀意念终身', value: false, severity: 'none' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: false, severity: 'none' }
    ],
    demographics: {
      age: 19,
      gender: '男',
      studentId: 'CSU-209485',
      emergencyContact: '+86 139-1111-2222'
    },
    psychometrics: {
      scores: [
        { date: '1月', value: 15 },
        { date: '2月', value: 20 },
        { date: '3月', value: 18 },
        { date: '4月', value: 16 }
      ],
      radarData: [
        { subject: '焦虑', A: 30, fullMark: 150 },
        { subject: '抑郁', A: 25, fullMark: 150 },
        { subject: '压力', A: 40, fullMark: 150 },
        { subject: '睡眠', A: 120, fullMark: 150 },
        { subject: '专注度', A: 130, fullMark: 150 }
      ]
    },
    history: [
      { date: '2026-02-10', type: '常态回访', description: '休学手续审批，心理常规回访记录，状态稳定。' }
    ]
  },
  {
    id: '4',
    name: 'Charlie Brown',
    major: '艺术史',
    year: '大二',
    status: 'Active',
    riskLevel: 'Low',
    riskReason: '轻微学业焦虑，已适应。',
    referralReason: '考试焦虑与时间管理干预，无临床风险表现。',
    scidDiagnosis: 'Z73.0 耗竭状态 (工作/生活压力)',
    riskFlags: [
      { label: '自杀意念终身', value: false, severity: 'none' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: false, severity: 'none' }
    ],
    demographics: {
      age: 20,
      gender: '男',
      studentId: 'CSU-440392',
      emergencyContact: '+86 186-2222-3333'
    },
    psychometrics: {
      scores: [
        { date: '1月', value: 35 },
        { date: '2月', value: 42 },
        { date: '3月', value: 38 },
        { date: '4月', value: 32 }
      ],
      radarData: [
        { subject: '焦虑', A: 65, fullMark: 150 },
        { subject: '抑郁', A: 50, fullMark: 150 },
        { subject: '压力', A: 95, fullMark: 150 },
        { subject: '睡眠', A: 90, fullMark: 150 },
        { subject: '专注度', A: 85, fullMark: 150 }
      ]
    },
    history: [
      { date: '2026-03-05', type: '压力辅导', description: '进行了学业时间线整理与认知重构指导。' }
    ]
  }
];
