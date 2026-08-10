import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAssessmentPosition } from '../useAssessmentPosition';
import { AssessmentSection } from '../../components/assessments/AssessmentData';

const mockSections: AssessmentSection[] = [
  {
    id: 's1',
    title: 'Section 1',
    subtitle: 'Subtitle 1',
    description: 'Description 1',
    questions: [
      { id: 'q1', text: 'Q1' },
      { id: 'q2', text: 'Q2' }
    ]
  },
  {
    id: 's2',
    title: 'Section 2',
    subtitle: 'Subtitle 2',
    description: 'Description 2',
    questions: [
      { id: 'q3', text: 'Q3' }
    ]
  }
];

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('useAssessmentPosition', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return default position (0, 0) when nothing is stored', () => {
    const { result } = renderHook(() =>
      useAssessmentPosition('user123', 'asm1')
    );
    expect(result.current.getPosition(mockSections)).toEqual({ sectionIdx: 0, questionIdx: 0 });
    expect(result.current.hasSavedPosition()).toBe(false);
  });

  it('should store and retrieve position correctly with user scoping', () => {
    const { result: user1Result } = renderHook(() =>
      useAssessmentPosition('user123', 'asm1')
    );

    act(() => {
      user1Result.current.savePosition(1, 0);
    });

    expect(localStorage.getItem('assessment_progress_user123_asm1')).toBe(
      JSON.stringify({ sectionIdx: 1, questionIdx: 0 })
    );

    expect(user1Result.current.getPosition(mockSections)).toEqual({ sectionIdx: 1, questionIdx: 0 });
    expect(user1Result.current.hasSavedPosition()).toBe(true);

    // Different user should not see user123's position
    const { result: user2Result } = renderHook(() =>
      useAssessmentPosition('user456', 'asm1')
    );
    expect(user2Result.current.getPosition(mockSections)).toEqual({ sectionIdx: 0, questionIdx: 0 });
  });

  it('should clamp out of bounds section and question indices safely', () => {
    localStorage.setItem(
      'assessment_progress_user123_asm1',
      JSON.stringify({ sectionIdx: 99, questionIdx: 99 })
    );

    const { result } = renderHook(() =>
      useAssessmentPosition('user123', 'asm1')
    );

    // Section index 99 should clamp to sectionIdx: 1 (max section index)
    // Question index 99 should clamp to questionIdx: 0 (max question index for section 1)
    expect(result.current.getPosition(mockSections)).toEqual({ sectionIdx: 1, questionIdx: 0 });
  });

  it('should gracefully handle corrupt JSON data in localStorage', () => {
    localStorage.setItem('assessment_progress_user123_asm1', 'invalid_json_data');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useAssessmentPosition('user123', 'asm1')
    );

    expect(result.current.getPosition(mockSections)).toEqual({ sectionIdx: 0, questionIdx: 0 });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should clear stored position correctly', () => {
    const { result } = renderHook(() =>
      useAssessmentPosition('user123', 'asm1')
    );

    act(() => {
      result.current.savePosition(0, 1);
    });

    expect(localStorage.getItem('assessment_progress_user123_asm1')).not.toBeNull();

    act(() => {
      result.current.clearPosition();
    });

    expect(localStorage.getItem('assessment_progress_user123_asm1')).toBeNull();
    expect(result.current.getPosition(mockSections)).toEqual({ sectionIdx: 0, questionIdx: 0 });
  });
});
