import { PsychiatricRecordType } from '../../components/records/RecordsView';

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
