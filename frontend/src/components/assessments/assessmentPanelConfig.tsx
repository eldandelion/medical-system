import * as React from 'react';
import { DetailsTabItem } from '../../contexts/DetailsContext';
import { getAssessmentIcon } from '../../constants/assessmentDictionary';
import { AssessmentCatalogItemDto, Student } from '../../types';
import {
  AssessmentScaleDetailsView,
  SCALE_DETAILS_TABS,
  ScaleDetailsTabs,
  formatScaleSubtitle,
} from './AssessmentScaleDetailsView';
import {
  StudentDetailsView,
  STUDENT_DETAILS_TABS,
  StudentDetailsTabs,
} from '../students/StudentDetailsView';

export { formatScaleSubtitle };

export type AssessmentsTabSelection = AssessmentCatalogItemDto | Student | null;

export function isAssessmentScale(item: unknown): item is AssessmentCatalogItemDto {
  return Boolean(
    item &&
      typeof item === 'object' &&
      'batteryCode' in item &&
      !('studentNumber' in item) &&
      typeof (item as AssessmentCatalogItemDto).questionCount === 'number'
  );
}

export interface AssessmentDetailsPanelHeaderProps {
  title: string;
  subtitle: string;
  icon: string;
  headerAvatar: React.ReactNode;
  tabs: DetailsTabItem[];
}

export function getAssessmentDetailsPanelProps(
  selectedItem: unknown
): AssessmentDetailsPanelHeaderProps {
  if (isAssessmentScale(selectedItem)) {
    return {
      title: selectedItem.title || '量表详情',
      subtitle: formatScaleSubtitle(selectedItem),
      icon: getAssessmentIcon(selectedItem.batteryCode),
      headerAvatar: (
        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">
            {getAssessmentIcon(selectedItem.batteryCode)}
          </span>
        </div>
      ),
      tabs: SCALE_DETAILS_TABS,
    };
  }

  const student = selectedItem as (Student & { studentId?: string }) | null;
  return {
    title: student?.name || '学生详情',
    subtitle: student?.studentNumber || student?.studentId || student?.major || '',
    icon: 'person',
    headerAvatar: student?.name ? (
      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium">
        {student.name.charAt(0)}
      </div>
    ) : null,
    tabs: STUDENT_DETAILS_TABS,
  };
}

export function getAssessmentCatalogProps<T>(
  selectedItem: T,
  setSelectedItem: (item: AssessmentsTabSelection) => void,
  setActiveTab: (tab: string) => void
) {
  const selectedStudent = !isAssessmentScale(selectedItem)
    ? (selectedItem as { id?: string } | null)
    : null;

  return {
    onScaleSelect: (scale: AssessmentCatalogItemDto | null) => {
      setSelectedItem(scale);
      if (scale) setActiveTab(ScaleDetailsTabs.OVERVIEW);
    },
    selectedScaleCode: isAssessmentScale(selectedItem) ? selectedItem.batteryCode : undefined,
    onStudentSelect: (student: Student | null) => {
      setSelectedItem(student);
      if (student) setActiveTab(StudentDetailsTabs.HISTORY);
    },
    selectedStudentId: selectedStudent?.id,
  };
}

export function renderAssessmentDetailsPanelContent(
  selectedItem: unknown,
  activeTab: string,
  onTabChange: (tabId: string) => void,
  onScaleUpdated?: (updatedScale: AssessmentCatalogItemDto) => void
): React.ReactNode {
  if (!selectedItem) return null;

  if (isAssessmentScale(selectedItem)) {
    return (
      <AssessmentScaleDetailsView
        key={selectedItem.batteryCode}
        scale={selectedItem}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onScaleUpdated={onScaleUpdated}
      />
    );
  }

  const student = selectedItem as Student;
  return (
    <StudentDetailsView
      key={student.id}
      student={student}
      defaultTab={StudentDetailsTabs.HISTORY}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
}
