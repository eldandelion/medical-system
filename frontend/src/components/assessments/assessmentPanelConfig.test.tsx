import * as React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  isAssessmentScale,
  formatScaleSubtitle,
  getAssessmentDetailsPanelProps,
  getAssessmentCatalogProps,
  renderAssessmentDetailsPanelContent,
} from './assessmentPanelConfig';
import { SCALE_DETAILS_TABS, ScaleDetailsTabs } from './AssessmentScaleDetailsView';
import { STUDENT_DETAILS_TABS, StudentDetailsTabs } from '../students/StudentDetailsView';
import { DetailsContext } from '../../contexts/DetailsContext';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { AssessmentCatalogItemDto, Student } from '../../types';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { token: 'mock-token', user: { role: 'SYSTEM_ADMIN' } },
  }),
}));

vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: vi.fn(),
    closeCreation: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAssessmentCatalogManagement', () => ({
  useAssessmentCatalogManagement: () => ({
    catalog: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    toggleAvailability: vi.fn(),
    isToggling: false,
  }),
}));

describe('assessmentPanelConfig', () => {
  const sampleScale: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ_9',
    title: '情绪状况评估 (PHQ-9)',
    subtitle: '抑郁症筛查量表',
    description: '用于评估过去两周抑郁症状。',
    duration: '5 分钟',
    questionCount: 9,
    sections: [],
    isEnabled: true,
  };

  const sampleStudent: Student = {
    id: '101',
    studentNumber: '2024001',
    name: '李明',
    major: '心理学',
    status: 'Active',
    riskLevel: 'LOW',
  };

  afterEach(() => {
    cleanup();
  });

  it('correctly distinguishes AssessmentCatalogItemDto from Student and AssessmentDetailsDto via isAssessmentScale', () => {
    const assignmentDetails = {
      id: 42,
      title: 'PHQ-9',
      batteryCode: 'PHQ_9',
      duration: '5 分钟',
      status: 'PENDING',
      sections: [],
      requiredQuestionIds: [],
    };
    expect(isAssessmentScale(sampleScale)).toBe(true);
    expect(isAssessmentScale(sampleStudent)).toBe(false);
    expect(isAssessmentScale(assignmentDetails)).toBe(false);
    expect(isAssessmentScale(null)).toBe(false);
    expect(isAssessmentScale(undefined)).toBe(false);
  });

  it('formats scale subtitle safely even when duration is missing', () => {
    expect(formatScaleSubtitle(sampleScale)).toBe('5 分钟 · 9 题');
    expect(formatScaleSubtitle({ ...sampleScale, duration: '' })).toBe('9 题');
  });

  it('wires scale and student selection callbacks cleanly via getAssessmentCatalogProps', () => {
    const setSelectedItem = vi.fn();
    const setActiveTab = vi.fn();
    const props = getAssessmentCatalogProps(sampleScale, setSelectedItem, setActiveTab);

    expect(props.selectedScaleCode).toBe('PHQ_9');
    expect(props.selectedStudentId).toBeUndefined();

    props.onStudentSelect(sampleStudent);
    expect(setSelectedItem).toHaveBeenCalledWith(sampleStudent);
    expect(setActiveTab).toHaveBeenCalledWith(StudentDetailsTabs.HISTORY);

    props.onScaleSelect(sampleScale);
    expect(setSelectedItem).toHaveBeenCalledWith(sampleScale);
    expect(setActiveTab).toHaveBeenCalledWith(ScaleDetailsTabs.OVERVIEW);
  });

  it('returns scale metadata and SCALE_DETAILS_TABS when scale is selected', () => {
    const props = getAssessmentDetailsPanelProps(sampleScale);

    expect(props.title).toBe('情绪状况评估 (PHQ-9)');
    expect(props.subtitle).toBe('5 分钟 · 9 题');
    expect(props.tabs).toEqual(SCALE_DETAILS_TABS);
    expect(props.headerAvatar).not.toBeNull();
  });

  it('returns student metadata and STUDENT_DETAILS_TABS when student is selected', () => {
    const props = getAssessmentDetailsPanelProps(sampleStudent);

    expect(props.title).toBe('李明');
    expect(props.subtitle).toBe('2024001');
    expect(props.icon).toBe('person');
    expect(props.tabs).toEqual(STUDENT_DETAILS_TABS);
  });

  it('renders AssessmentScaleDetailsView for a scale and StudentDetailsView for a student', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <DetailsContext.Provider value={{ isFullScreen: false }}>
            {renderAssessmentDetailsPanelContent(
              sampleScale,
              ScaleDetailsTabs.OVERVIEW,
              vi.fn()
            )}
          </DetailsContext.Provider>
        </SnackbarProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('量表信息')).toBeDefined();
    expect(screen.getByText('指派测评')).toBeDefined();

    rerender(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <DetailsContext.Provider value={{ isFullScreen: false }}>
            {renderAssessmentDetailsPanelContent(
              sampleStudent,
              StudentDetailsTabs.OVERVIEW,
              vi.fn()
            )}
          </DetailsContext.Provider>
        </SnackbarProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText('基本特征')).toBeDefined();
    expect(screen.getByText('2024001')).toBeDefined();
  });
});
