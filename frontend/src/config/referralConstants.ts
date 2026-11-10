import { ClinicalStatusType, SevereRiskFactorType } from '../types';

export const CLINICAL_STATUS_OPTIONS: { label: string; value: ClinicalStatusType }[] = [
  { label: '初诊', value: 'FIRST_VISIT' },
  { label: '正在服药', value: 'MEDICATED' },
  { label: '既往心理治疗', value: 'PRIOR_THERAPY' },
];

export const RISK_FACTOR_OPTIONS: { label: string; value: SevereRiskFactorType }[] = [
  { label: '自杀意念', value: 'SUICIDAL_IDEATION' },
  { label: '自杀企图', value: 'SUICIDE_ATTEMPT' },
  { label: '自残行为', value: 'SELF_HARM' },
];

export const CLINICAL_STATUS_LABELS = Object.fromEntries(
  CLINICAL_STATUS_OPTIONS.map(opt => [opt.value, opt.label])
) as Record<string, string>;

export const RISK_FACTOR_LABELS: Record<string, string> = {
  ...Object.fromEntries(RISK_FACTOR_OPTIONS.map(opt => [opt.value, opt.label])),
  SUICIDAL_IDEATION: '自杀意念',
  SUICIDE_ATTEMPT: '自杀企图',
  SELF_HARM: '自残行为',
  SUBSTANCE_ABUSE: '物质滥用',
  HIGH_RISK_FLAG: '高危预警标识',
  PSYCHOTIC_SYMPTOMS: '精神病性症状',
  ACUTE_CRISIS: '急性危机',
  VIOLENCE_RISK: '暴力倾向',
  SEVERE_DEPRESSION: '重度抑郁',
  EXTREME_ANXIETY: '重度焦虑',
};

export const TEST_NAME_LABELS: Record<string, string> = {
  comprehensive_student_intake_survey: '大学生心理健康综合测评问卷',
  PHQ_9: 'PHQ-9 抑郁症筛查量表',
  GAD_7: 'GAD-7 广泛性焦虑障碍量表',
  SCL_90: 'SCL-90 症状自评量表',
  SLEEP_DISORDER: '匹兹堡睡眠质量指数 (PSQI)',
  APQ_9_FATHER: '父亲教养方式问卷 (APQ-9)',
  APQ_9_MOTHER: '母亲教养方式问卷 (APQ-9)',
  COMPREHENSIVE_MENTAL: '心理健康综合评估量表',
  EPQ: '艾森克人格问卷',
  UPI: '大学生人格健康调查表',
  GHQ_12: 'GHQ-12 一般健康问卷',
};

export const DEGREE_LEVEL_OPTIONS = [
  { label: '本科', value: 'BACHELOR' },
  { label: '硕士', value: 'MASTER' },
  { label: '博士', value: 'PHD' },
  { label: '其他', value: 'OTHER' }
];

export const DEGREE_LEVEL_LABELS: Record<string, string> = {
  BACHELOR: '本科',
  MASTER: '硕士',
  PHD: '博士',
  OTHER: '其他',
  本科: '本科',
  硕士: '硕士',
  博士: '博士',
  其他: '其他'
};

export const ACADEMIC_YEAR_LABELS: Record<string, string> = {
  FRESHMAN: '大一',
  SOPHOMORE: '大二',
  JUNIOR: '大三',
  SENIOR: '大四',
  FIFTH_YEAR: '大五',
  MASTER: '硕士',
  PHD: '博士'
};
