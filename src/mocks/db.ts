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
