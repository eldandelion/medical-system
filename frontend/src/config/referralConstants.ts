import { ClinicalStatusType, SevereRiskFactorType } from '../types';

export const CLINICAL_STATUS_OPTIONS: { label: string; value: ClinicalStatusType }[] = [
  { label: '初诊', value: 'FirstVisit' },
  { label: '正在服药', value: 'Medicated' },
  { label: '既往心理治疗', value: 'PriorTherapy' },
];

export const RISK_FACTOR_OPTIONS: { label: string; value: SevereRiskFactorType }[] = [
  { label: '自杀意念', value: 'Ideation' },
  { label: '自杀企图', value: 'Attempt' },
  { label: '自残行为', value: 'SelfHarm' },
];
