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

export interface Assessment {
  id: string;
  title: string;
  subtitle?: string;
  sections?: any[];
  assignedBy: {
    name: string;
    initial: string;
    bgColor?: string;
    textColor?: string;
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
      initial: 'S',
      bgColor: 'var(--md-sys-color-primary-container)',
      textColor: 'var(--md-sys-color-on-primary-container)'
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
      initial: 'S',
      bgColor: 'var(--md-sys-color-primary-container)',
      textColor: 'var(--md-sys-color-on-primary-container)'
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
      initial: 'M',
      bgColor: 'var(--md-sys-color-tertiary-container)',
      textColor: 'var(--md-sys-color-on-tertiary-container)'
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
      initial: 'E',
      bgColor: 'var(--md-sys-color-secondary-container)',
      textColor: 'var(--md-sys-color-on-secondary-container)'
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
      initial: 'M',
      bgColor: 'var(--md-sys-color-tertiary-container)',
      textColor: 'var(--md-sys-color-on-tertiary-container)'
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
      initial: 'E',
      bgColor: 'var(--md-sys-color-secondary-container)',
      textColor: 'var(--md-sys-color-on-secondary-container)'
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
      initial: 'M',
      bgColor: 'var(--md-sys-color-tertiary-container)',
      textColor: 'var(--md-sys-color-on-tertiary-container)'
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
      initial: 'E',
      bgColor: 'var(--md-sys-color-secondary-container)',
      textColor: 'var(--md-sys-color-on-secondary-container)'
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
      initial: 'M',
      bgColor: 'var(--md-sys-color-tertiary-container)',
      textColor: 'var(--md-sys-color-on-tertiary-container)'
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
      initial: 'E',
      bgColor: 'var(--md-sys-color-secondary-container)',
      textColor: 'var(--md-sys-color-on-secondary-container)'
    },
    type: '调查',
    completionPercentage: 100,
    duration: '10 分钟',
    status: 'Completed'
  }
];

export interface PsychiatricRecord {
  id: string;
  type: string;
  icon: string;
  iconColor: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Closed';
}

export const mockPsychiatricRecordsDb: PsychiatricRecord[] = [
  {
    id: '1',
    type: '初诊转诊',
    icon: 'clinical_notes',
    iconColor: 'var(--md-sys-color-on-surface-variant)',
    reason: '焦虑与惊恐发作评估',
    date: '2026年4月12日',
    status: 'Closed'
  },
  {
    id: '2',
    type: '随访',
    icon: 'forum',
    iconColor: 'var(--md-sys-color-on-surface-variant)',
    reason: '药物管理（SSRI 调整）',
    date: '2026年4月20日',
    status: 'Pending'
  },
  {
    id: '3',
    type: '初诊转诊',
    icon: 'clinical_notes',
    iconColor: 'var(--md-sys-color-on-surface-variant)',
    reason: 'ADHD 评估与诊断访谈',
    date: '2026年5月05日',
    status: 'Pending'
  },
  {
    id: '4',
    type: '随访',
    icon: 'forum',
    iconColor: 'var(--md-sys-color-on-surface-variant)',
    reason: '认知行为疗法（CBT）第 4 次会谈',
    date: '2026年3月15日',
    status: 'Closed'
  },
  {
    id: '5',
    type: '随访',
    icon: 'forum',
    iconColor: 'var(--md-sys-color-on-surface-variant)',
    reason: '睡眠障碍与失眠复查',
    date: '2026年3月01日',
    status: 'Closed'
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
    statusChipColor: string;
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
        statusChipColor: 'error-container'
      },
      {
        id: '2',
        title: '查看反馈摘要：算法',
        timestamp: '昨天发布',
        statusText: '未读',
        statusChipColor: 'secondary-container'
      },
      {
        id: '3',
        title: '更新年度知情同意书',
        timestamp: '下学期必需',
        statusText: '待处理',
        statusChipColor: 'surface-variant'
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
        statusChipColor: 'error-container'
      },
      {
        id: '2',
        title: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusChipColor: 'secondary-container'
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
        statusChipColor: 'error-container'
      },
      {
        id: '2',
        title: '转诊更新：爱丽丝·史密斯',
        timestamp: '昨天',
        statusText: '审核中',
        statusChipColor: 'secondary-container'
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
        statusChipColor: 'secondary-container'
      },
      {
        id: '2',
        title: '系统维护通知',
        timestamp: '昨天',
        statusText: '已发布',
        statusChipColor: 'tertiary-container'
      }
    ]
  }
};
