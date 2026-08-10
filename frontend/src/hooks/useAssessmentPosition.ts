import * as React from 'react';
import { AssessmentSection } from '../components/assessments/AssessmentData';

export interface AssessmentPosition {
  sectionIdx: number;
  questionIdx: number;
}

export function useAssessmentPosition(
  userId: string | undefined | null,
  assessmentId: string | undefined
) {
  const getKey = React.useCallback(() => {
    if (!assessmentId) return null;
    const safeUserId = userId || 'guest';
    return `assessment_progress_${safeUserId}_${assessmentId}`;
  }, [userId, assessmentId]);

  const getPosition = React.useCallback((sections: AssessmentSection[] = []): AssessmentPosition => {
    const key = getKey();
    if (!key) return { sectionIdx: 0, questionIdx: 0 };

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return { sectionIdx: 0, questionIdx: 0 };

      const parsed = JSON.parse(stored);
      if (typeof parsed !== 'object' || parsed === null) {
        return { sectionIdx: 0, questionIdx: 0 };
      }

      const totalSections = sections.length > 0 ? sections.length : 1;
      const rawSectionIdx = typeof parsed.sectionIdx === 'number' ? parsed.sectionIdx : 0;
      const safeSectionIdx = Math.min(Math.max(0, rawSectionIdx), totalSections - 1);

      const targetSection = sections[safeSectionIdx];
      const totalQuestions = targetSection && targetSection.questions ? targetSection.questions.length : 1;
      const rawQuestionIdx = typeof parsed.questionIdx === 'number' ? parsed.questionIdx : 0;
      const safeQuestionIdx = Math.min(Math.max(0, rawQuestionIdx), (totalQuestions > 0 ? totalQuestions : 1) - 1);

      return {
        sectionIdx: safeSectionIdx,
        questionIdx: safeQuestionIdx
      };
    } catch (e) {
      console.error('Failed to parse assessment position from localStorage:', e);
      return { sectionIdx: 0, questionIdx: 0 };
    }
  }, [getKey]);

  const hasSavedPosition = React.useCallback((): boolean => {
    const key = getKey();
    if (!key) return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch (e) {
      return false;
    }
  }, [getKey]);

  const savePosition = React.useCallback((sectionIdx: number, questionIdx: number) => {
    const key = getKey();
    if (!key) return;

    try {
      localStorage.setItem(key, JSON.stringify({ sectionIdx, questionIdx }));
    } catch (e) {
      console.error('Failed to save assessment position to localStorage:', e);
    }
  }, [getKey]);

  const clearPosition = React.useCallback(() => {
    const key = getKey();
    if (!key) return;

    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear assessment position from localStorage:', e);
    }
  }, [getKey]);

  return {
    getPosition,
    hasSavedPosition,
    savePosition,
    clearPosition
  };
}
