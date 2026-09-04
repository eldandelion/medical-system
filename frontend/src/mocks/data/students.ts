import { Student } from '../../types';

export const mockStudentsDb: Student[] = [
  {
    id: '1',
    studentNumber: '2021001',
    name: '张伟',
    major: '计算机科学',
    year: '大三',
    status: 'Active',
    riskLevel: 'MEDIUM',
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
      gender: 'MALE',
      ethnicity: '汉族',
      idCardNumber: '110101200301011234',
      contactNumber: '13800138001',
      email: 'zhangwei@univ.edu.cn',
      homeAddress: '北京市海淀区中关村南大街1号',
      emergencyContactName: '张建军',
      emergencyContactPhone: '13900139001',
      school: '中南大学'
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
    studentNumber: '2021002',
    name: '李娜',
    major: '心理学',
    year: '大四',
    status: 'Active',
    riskLevel: 'HIGH',
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
      gender: 'FEMALE',
      ethnicity: '汉族',
      idCardNumber: '110101200202022345',
      contactNumber: '13800138002',
      email: 'lina@univ.edu.cn',
      homeAddress: '湖南省长沙市岳麓区麓山南路2号',
      emergencyContactName: '李强',
      emergencyContactPhone: '13900139002',
      school: '中南大学'
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
    studentNumber: '2022001',
    name: '王强',
    major: '生物学',
    year: '大一',
    status: 'Inactive',
    riskLevel: 'LOW',
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
      gender: 'MALE',
      ethnicity: '回族',
      idCardNumber: '110101200503033456',
      contactNumber: '13800138003',
      email: 'wangqiang@univ.edu.cn',
      homeAddress: '湖北省武汉市武昌区珞珈山路3号',
      emergencyContactName: '王大伟',
      emergencyContactPhone: '13900139003',
      school: '中南大学'
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
    studentNumber: '2022002',
    name: '刘洋',
    major: '艺术史',
    year: '大二',
    status: 'Active',
    riskLevel: 'LOW',
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
      gender: 'MALE',
      ethnicity: '满族',
      idCardNumber: '110101200404044567',
      contactNumber: '13800138004',
      email: 'liuyang@univ.edu.cn',
      homeAddress: '广东省广州市天河区五山路4号',
      emergencyContactName: '刘保国',
      emergencyContactPhone: '13900139004',
      school: '中南大学'
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
  },
  {
    id: '5',
    studentNumber: '2023001',
    name: '陈思宇',
    major: '文学',
    year: '大二',
    status: 'Active',
    riskLevel: 'HIGH',
    riskReason: '宿舍事故报告提及自杀意念',
    referralReason: '紧急事件',
    scidDiagnosis: '待评估',
    riskFlags: [
      { label: '自杀意念终身', value: true, severity: 'high' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: false, severity: 'none' }
    ],
    demographics: {
      age: 20,
      gender: 'FEMALE',
      ethnicity: '汉族',
      idCardNumber: '110101200405055678',
      contactNumber: '13800138005',
      email: 'chen_siyu@univ.edu.cn',
      homeAddress: '四川省成都市武侯区一环路5号',
      emergencyContactName: '陈建华',
      emergencyContactPhone: '13900139005',
      school: '中南大学'
    },
    psychometrics: { scores: [], radarData: [] },
    history: []
  },
  {
    id: '6',
    studentNumber: '2023002',
    name: '赵明',
    major: '物理',
    year: '大四',
    status: 'Active',
    riskLevel: 'LOW',
    riskReason: '正在药物治疗中，情况改善',
    referralReason: '复诊复核',
    scidDiagnosis: 'ADHD',
    riskFlags: [
      { label: '自杀意念终身', value: false, severity: 'none' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: false, severity: 'none' }
    ],
    demographics: {
      age: 22,
      gender: 'MALE',
      ethnicity: '汉族',
      idCardNumber: '110101200206066789',
      contactNumber: '13800138006',
      email: 'zhaoming@univ.edu.cn',
      homeAddress: '浙江省杭州市西湖区浙大路6号',
      emergencyContactName: '赵志刚',
      emergencyContactPhone: '13900139006',
      school: '中南大学'
    },
    psychometrics: { scores: [], radarData: [] },
    history: []
  },
  {
    id: '7',
    studentNumber: 'S2023001',
    name: '李明',
    major: '计算机科学与技术学院 / 计算机科学',
    year: '大二',
    status: 'Active',
    riskLevel: 'LOW',
    riskReason: '基线状态良好，无显著心理危机。',
    referralReason: '',
    scidDiagnosis: '无临床诊断',
    riskFlags: [
      { label: '自杀意念终身', value: false, severity: 'none' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: false, severity: 'none' }
    ],
    demographics: {
      age: 21,
      gender: 'MALE',
      ethnicity: '汉族',
      idCardNumber: '110101200305201234',
      contactNumber: '13800138000',
      email: 'liming@univ.edu.cn',
      homeAddress: '北京市海淀区中关村南大街5号',
      emergencyContactName: '李建国',
      emergencyContactPhone: '13900139000',
      school: '中南大学'
    },
    psychometrics: {
      scores: [
        { date: '1月', value: 20 },
        { date: '2月', value: 22 },
        { date: '3月', value: 25 },
        { date: '4月', value: 24 }
      ],
      radarData: [
        { subject: '焦虑', A: 40, fullMark: 150 },
        { subject: '抑郁', A: 35, fullMark: 150 },
        { subject: '压力', A: 50, fullMark: 150 },
        { subject: '睡眠', A: 110, fullMark: 150 },
        { subject: '专注度', A: 120, fullMark: 150 }
      ]
    },
    history: []
  },
  {
    id: '8',
    studentNumber: 'S2023002',
    name: '王芳',
    major: '机械工程学院 / 机械工程',
    year: '大三',
    status: 'Active',
    riskLevel: 'LOW',
    riskReason: '常态自评平稳。',
    referralReason: '',
    scidDiagnosis: '无临床诊断',
    riskFlags: [
      { label: '自杀意念终身', value: false, severity: 'none' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: false, severity: 'none' }
    ],
    demographics: {
      age: 22,
      gender: 'FEMALE',
      ethnicity: '汉族',
      idCardNumber: '110101200208155678',
      contactNumber: '13700137000',
      email: 'wangfang@univ.edu.cn',
      homeAddress: '湖南省长沙市岳麓区麓山南路8号',
      emergencyContactName: '王建华',
      emergencyContactPhone: '13600136000',
      school: '中南大学'
    },
    psychometrics: {
      scores: [
        { date: '1月', value: 18 },
        { date: '2月', value: 19 },
        { date: '3月', value: 20 },
        { date: '4月', value: 18 }
      ],
      radarData: [
        { subject: '焦虑', A: 30, fullMark: 150 },
        { subject: '抑郁', A: 25, fullMark: 150 },
        { subject: '压力', A: 45, fullMark: 150 },
        { subject: '睡眠', A: 130, fullMark: 150 },
        { subject: '专注度', A: 135, fullMark: 150 }
      ]
    },
    history: []
  }
];
