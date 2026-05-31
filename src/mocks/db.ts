import {
  MENTAL_HEALTH_ASSESSMENT,
  SLEEP_ASSESSMENT,
  DIGITAL_HABITS_DAILY_BEHAVIORS_ASSESSMENT,
  SOCIAL_ENVIRONMENT_SUPPORT_ASSESSMENT,
  SELF_REGULATION_PERSONALITY_ASSESSMENT,
  FAMILY_BACKGROUND_EARLY_EXPERIENCES_ASSESSMENT,
  CLINICAL_SCREENING_NEURODIVERGENCE_ASSESSMENT,
  PERSONALITY_COPING_OUTLOOK_ASSESSMENT
} from '../components/assessments/AssessmentData';
import { PsychiatricRecordType } from '../components/records/RecordsView';
import { ActivityStatusType } from '../config/dashboardConfig';

export interface Assessment {
  id: string;
  title: string;
  subtitle?: string;
  sections?: any[];
  assignedBy: {
    name: string;
    initial: string;
  };
  type: string;
  completionPercentage: number;
  duration: string;
  status: 'All' | 'In progress' | 'Completed';
}

export const mockAssessmentsDb: Assessment[] = [
  {
    id: '1',
    title: '年度身心健康状况评估',
    subtitle: '2025-2026 学年学生心理健康普查',
    sections: MENTAL_HEALTH_ASSESSMENT,
    assignedBy: {
      name: '莎拉·詹金斯',
      initial: 'S'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '15 分钟',
    status: 'In progress'
  },
  {
    id: 'sleep',
    title: '睡眠状况评估',
    subtitle: '最近1个月的睡眠与失眠状况调查',
    sections: SLEEP_ASSESSMENT,
    assignedBy: {
      name: '莎拉·詹金斯',
      initial: 'S'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '10 分钟',
    status: 'In progress'
  },
  {
    id: 'digital_habits',
    title: '数字化习惯与日常行为评估',
    subtitle: '数字化习惯与日常行为状况综合评估',
    sections: DIGITAL_HABITS_DAILY_BEHAVIORS_ASSESSMENT,
    assignedBy: {
      name: '迈克尔·陈',
      initial: 'M'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '20 分钟',
    status: 'In progress'
  },
  {
    id: 'social_support',
    title: '社交环境与支持系统评估',
    subtitle: '人际关系与社会支持状况综合评估',
    sections: SOCIAL_ENVIRONMENT_SUPPORT_ASSESSMENT,
    assignedBy: {
      name: '艾米丽·沃森博士',
      initial: 'E'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '15 分钟',
    status: 'In progress'
  },
  {
    id: 'self_regulation',
    title: '自我调节与人格特质评估',
    subtitle: '自控力、坚毅性及情绪调节能力评估',
    sections: SELF_REGULATION_PERSONALITY_ASSESSMENT,
    assignedBy: {
      name: '迈克尔·陈',
      initial: 'M'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '15 分钟',
    status: 'In progress'
  },
  {
    id: 'family_experiences',
    title: '家庭背景与早期经历评估',
    subtitle: '童年环境、家庭地位及早期成长经历综合评估',
    sections: FAMILY_BACKGROUND_EARLY_EXPERIENCES_ASSESSMENT,
    assignedBy: {
      name: '艾米丽·沃森博士',
      initial: 'E'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '20 分钟',
    status: 'In progress'
  },
  {
    id: 'clinical_screening',
    title: '临床筛查与神经多样性评估',
    subtitle: '自伤风险、思维模式、注意力ADHD及执行功能障碍筛查',
    sections: CLINICAL_SCREENING_NEURODIVERGENCE_ASSESSMENT,
    assignedBy: {
      name: '迈克尔·陈',
      initial: 'M'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '25 分钟',
    status: 'In progress'
  },
  {
    id: 'personality_coping',
    title: '人格特质、应对方式与生活展望评估',
    subtitle: '大五人格特质、情绪宣泄、压力应对及幸福感展望',
    sections: PERSONALITY_COPING_OUTLOOK_ASSESSMENT,
    assignedBy: {
      name: '艾米丽·沃森博士',
      initial: 'E'
    },
    type: '测试',
    completionPercentage: 0,
    duration: '20 分钟',
    status: 'In progress'
  },
  {
    id: '2',
    title: '心血管风险自我评估',
    assignedBy: {
      name: '迈克尔·陈',
      initial: 'M'
    },
    type: '测试',
    completionPercentage: 45,
    duration: '15 分钟',
    status: 'In progress'
  },
  {
    id: '3',
    title: '心理健康基线调查',
    assignedBy: {
      name: '艾米丽·沃森博士',
      initial: 'E'
    },
    type: '调查',
    completionPercentage: 100,
    duration: '10 分钟',
    status: 'Completed'
  }
];

export interface PsychiatricRecord {
  id: string;
  type: PsychiatricRecordType;
  reason: string;
  date: string;
  status: 'Pending' | 'Closed';
  detailedReason?: string;
  hospitalSummary?: string;
  followUpArrangement?: string;
  attachments?: { name: string; size: string; type: string }[];
  privacyVisitInitial?: string;
}

export const mockPsychiatricRecordsDb: PsychiatricRecord[] = [
  {
    id: '1',
    type: '初诊转诊',
    reason: '焦虑与惊恐发作评估',
    date: '2026年4月12日',
    status: 'Closed',
    detailedReason: '患者报告在临床环境中持续存在注意力集中和情绪调节困难。建议进一步进行广泛症状筛查。',
    hospitalSummary: '该学生已完成初步评估。心理测评结果显示中度困扰水平。目前阶段未启动药物治疗。',
    followUpArrangement: '已安排每两周一次的咨询环节。下次复核定于 2026年6月。',
    attachments: [
      { name: 'Sanitized_Report_001.pdf', size: '1.4 MB', type: 'PDF' },
      { name: 'Anxiety_Scale_Result.pdf', size: '920 KB', type: 'PDF' }
    ],
    privacyVisitInitial: 'D'
  },
  {
    id: '2',
    type: '随访',
    reason: '药物管理（SSRI 调整）',
    date: '2026年4月20日',
    status: 'Pending',
    detailedReason: 'SSRI药物治疗后的第三周随访。患者自诉睡眠质量有所改善，但清晨醒来时伴有轻度恶心。',
    hospitalSummary: '调整了每日服用剂量，从 20mg 减至 15mg，并建议改在睡前服用以减轻胃肠道副作用。',
    followUpArrangement: '下一次随访定于 2 周后，需监测情绪波动和生理副反应。',
    attachments: [
      { name: 'SSRI_Adjustment_Log.pdf', size: '640 KB', type: 'PDF' }
    ],
    privacyVisitInitial: 'D'
  },
  {
    id: '3',
    type: '初诊转诊',
    reason: 'ADHD 评估与诊断访谈',
    date: '2026年5月05日',
    status: 'Pending',
    detailedReason: '首次注意力评估。表现为明显的学业拖延、注意力分散和日常计划执行功能障碍。',
    hospitalSummary: '进行了正式的诊断性结构访谈。提示有明显的成人ADHD特征，建议与精神科医生进行深入会谈。',
    followUpArrangement: '已转诊至精神卫生中心ADHD专病门诊，待专科确诊后再制定治疗方案。',
    attachments: [
      { name: 'ADHD_Symptom_Checklist.pdf', size: '1.1 MB', type: 'PDF' },
      { name: 'Cognitive_Test_Result.pdf', size: '2.1 MB', type: 'PDF' }
    ],
    privacyVisitInitial: 'D'
  },
  {
    id: '4',
    type: '随访',
    reason: '认知行为疗法（CBT）第 4 次会谈',
    date: '2026年3月15日',
    status: 'Closed',
    detailedReason: '第四次CBT会谈，主要关注灾难化思维挑战与负面核心信念的重构练习。',
    hospitalSummary: '患者在课业压力下的自动思维识别有显著进步，能运用苏格拉底提问法进行自我辩驳。',
    followUpArrangement: '继续进行情绪日记的记录，并尝试暴露疗法作业。下周同一时间继续。',
    attachments: [
      { name: 'CBT_Session4_Workbook.pdf', size: '850 KB', type: 'PDF' }
    ],
    privacyVisitInitial: 'D'
  },
  {
    id: '5',
    type: '随访',
    reason: '睡眠障碍与失眠复查',
    date: '2026年3月01日',
    status: 'Closed',
    detailedReason: '睡眠监测复查。入睡困难（潜伏期超过60分钟）伴夜间易醒。',
    hospitalSummary: '建议实施睡眠限制疗法（SRT）和刺激控制疗法，限制非睡眠时间的在床时间。',
    followUpArrangement: '要求记录 7 天睡眠日记，于下次随访时进行数据对比与床铺习惯评估。',
    attachments: [
      { name: 'Sleep_Diary_Template.pdf', size: '320 KB', type: 'PDF' },
      { name: 'Insomnia_Severity_Index.pdf', size: '780 KB', type: 'PDF' }
    ],
    privacyVisitInitial: 'D'
  }
];

export interface DashboardData {
  profileSummary: {
    avatarText: string;
    title: string;
    subtitle: string;
    studentId?: string;
    school?: string;
    employeeId?: string;
    department?: string;
    accessLevel?: string;
  };
  metrics: Record<string, number>;
  activityTitle: string;
  activities: {
    id: string;
    title: string;
    timestamp: string;
    statusText: string;
    statusType: ActivityStatusType;
  }[];
}

export const mockDashboardDb: Record<string, DashboardData> = {
  student: {
    profileSummary: {
      avatarText: "D",
      title: "达尼尔·彼得罗夫",
      subtitle: "中南大学学生",
      studentId: "987654321",
      school: "计算机科学与工程学院"
    },
    metrics: {
      assessmentsCount: 2,
      notificationsCount: 3
    },
    activityTitle: "最近记录",
    activities: [
      {
        id: '1',
        title: '完成期中自我测评',
        timestamp: '2天后到期',
        statusText: '需处理',
        statusType: 'error'
      },
      {
        id: '2',
        title: '查看反馈摘要：算法',
        timestamp: '昨天发布',
        statusText: '未读',
        statusType: 'info'
      },
      {
        id: '3',
        title: '更新年度知情同意书',
        timestamp: '下学期必需',
        statusText: '待处理',
        statusType: 'neutral'
      }
    ]
  },
  teacher: {
    profileSummary: {
      avatarText: "E",
      title: "艾米丽·沃森博士",
      subtitle: "教研人员",
      employeeId: "T-88291",
      department: "心理学系"
    },
    metrics: {
      studentsCount: 42,
      referralsCount: 5
    },
    activityTitle: "最近活动",
    activities: [
      {
        id: '1',
        title: '新分配学生：达尼尔·彼得罗夫',
        timestamp: '2小时前',
        statusText: '高风险标识',
        statusType: 'error'
      },
      {
        id: '2',
        title: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusType: 'info'
      }
    ]
  },
  'head-councillor': {
    profileSummary: {
      avatarText: "张",
      title: "张明诚",
      subtitle: "主任辅导员",
      employeeId: "HC-1001",
      department: "咨询中心"
    },
    metrics: {
      studentsCount: 124,
      referralsCount: 12
    },
    activityTitle: "全局活动",
    activities: [
      {
        id: '1',
        title: '新分配学生：达尼尔·彼得罗夫',
        timestamp: '2小时前',
        statusText: '高风险标识',
        statusType: 'error'
      },
      {
        id: '2',
        title: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusType: 'info'
      }
    ]
  },
  'trial-admin': {
    profileSummary: {
      avatarText: "赵",
      title: "赵敏",
      subtitle: "初试管理员",
      employeeId: "TA-9009",
      accessLevel: "限制访问"
    },
    metrics: {
      staffCount: 42,
      referralsCount: 8
    },
    activityTitle: "全局活动",
    activities: [
      {
        id: '1',
        title: '新转诊申请：转诊中心',
        timestamp: '1小时前',
        statusText: '待审核',
        statusType: 'info'
      },
      {
        id: '2',
        title: '系统维护通知',
        timestamp: '昨天',
        statusText: '已发布',
        statusType: 'warning'
      }
    ]
  }
};
