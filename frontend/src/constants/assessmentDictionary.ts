export const ASSESSMENT_DICTIONARY: Record<string, string> = {
  'PHQ_9': '情绪状况评估 (PHQ-9)',
  'GAD_7': '焦虑状况评估 (GAD-7)',
  'SLEEP_DISORDER': '睡眠状况评估',
  'APQ_9_FATHER': '教养行为评估 (父亲篇)',
  'APQ_9_MOTHER': '教养行为评估 (母亲篇)',
  'COMPREHENSIVE_MENTAL': '年度身心健康状况综合评估',
  
  // Legacy / Fallback mappings for old database records
  'MENTAL_HEALTH_ASSESSMENT': '年度身心健康状况综合评估'
};

export const ASSESSMENT_ICON_DICTIONARY: Record<string, string> = {
  'PHQ_9': 'sentiment_dissatisfied',
  'PHQ-9': 'sentiment_dissatisfied',
  'GAD_7': 'psychology_alt',
  'GAD-7': 'psychology_alt',
  'SCL_90': 'clinical_notes',
  'SCL-90': 'clinical_notes',
  'SDS': 'sentiment_very_dissatisfied',
  'SAS': 'psychology_alt',
  'SLEEP_DISORDER': 'bedtime',
  'APQ_9_FATHER': 'family_restroom',
  'APQ_9_MOTHER': 'family_restroom',
  'COMPREHENSIVE_MENTAL': 'psychology',
  'MENTAL_HEALTH_ASSESSMENT': 'psychology',
  'EPQ': 'person_search',
  'UPI': 'assignment_ind'
};

export const getAssessmentName = (batteryCode: string, catalogTitle?: string): string => {
  if (catalogTitle) return catalogTitle;
  return ASSESSMENT_DICTIONARY[batteryCode] || batteryCode;
};

export const getAssessmentIcon = (batteryCode?: string): string => {
  if (!batteryCode) return 'quiz';
  const normalized = batteryCode.toUpperCase().replace('-', '_');
  if (ASSESSMENT_ICON_DICTIONARY[batteryCode]) return ASSESSMENT_ICON_DICTIONARY[batteryCode];
  if (ASSESSMENT_ICON_DICTIONARY[normalized]) return ASSESSMENT_ICON_DICTIONARY[normalized];
  if (normalized.includes('PHQ') || normalized.includes('DEPRESSION')) return 'sentiment_dissatisfied';
  if (normalized.includes('GAD') || normalized.includes('ANXIETY')) return 'psychology_alt';
  if (normalized.includes('SLEEP')) return 'bedtime';
  if (normalized.includes('APQ') || normalized.includes('PARENT')) return 'family_restroom';
  if (normalized.includes('SCL')) return 'clinical_notes';
  if (normalized.includes('COMPREHENSIVE') || normalized.includes('MENTAL')) return 'psychology';
  return 'quiz';
};

