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

export const getAssessmentName = (batteryCode: string, catalogTitle?: string): string => {
  if (catalogTitle) return catalogTitle;
  return ASSESSMENT_DICTIONARY[batteryCode] || batteryCode;
};
