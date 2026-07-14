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

export const RISK_FACTOR_LABELS = Object.fromEntries(
  RISK_FACTOR_OPTIONS.map(opt => [opt.value, opt.label])
) as Record<string, string>;

export const TEST_NAME_LABELS: Record<string, string> = {
  SCL_90: 'SCL-90 症状自评量表',
  PHQ_9: 'PHQ-9 抑郁症筛查量表',
  GAD_7: 'GAD-7 焦虑症筛查量表',
  EPQ: '艾森克人格问卷',
  UPI: '大学生人格问卷'
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
