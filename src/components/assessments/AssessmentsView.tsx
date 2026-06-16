import * as React from 'react';
import { useDataFetch } from '../../hooks/useDataFetch';
import { AssessmentCard } from './AssessmentCard';
import { SegmentedButton } from '../common/Buttons';
import { AssessmentDialogProvider, useAssessmentDialog } from '../../contexts/AssessmentDialogContext';
import { AssessmentSection } from './AssessmentData';

interface Assessment {
  id: string;
  title: string;
  subtitle?: string;
  sections?: AssessmentSection[];
  assignedBy: {
    name: string;
    initial: string;
  };
  type: string;
  completionPercentage: number;
  duration: string;
  status: 'All' | 'In progress' | 'Completed';
}

// Module-level variable to persist filter state across component remounts (tab switches)
let persistentFilter = '全部';

export interface AssessmentsViewProps {
  header?: (loading: boolean) => React.ReactNode;
}

function AssessmentsContent({ header }: AssessmentsViewProps) {
  const [selectedFilter, setSelectedFilter] = React.useState(persistentFilter);
  const { data: assessmentsData, loading } = useDataFetch<Assessment[]>('/api/assessments');
  const assessments = assessmentsData || [];
  const { openAssessment } = useAssessmentDialog();

  const handleFilterChange = (filter: string) => {
    persistentFilter = filter;
    setSelectedFilter(filter);
  };

  const filteredAssessments = assessments.filter(a =>
    selectedFilter === '全部' || (selectedFilter === '进行中' && a.status === 'In progress') || (selectedFilter === '已完成' && a.status === 'Completed')
  );

  const filters = ['全部', '进行中', '已完成'];

  return (
    <>
      {header && header(loading)}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Connected Button Group Section - Sticky below CanvasHeader */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-[var(--md-sys-color-surface)] flex justify-center md:justify-start">
          <SegmentedButton
            items={filters.map(f => ({ label: f, value: f }))}
            selectedValue={selectedFilter}
            onChange={handleFilterChange}
          />
        </div>

        {/* Assessments List */}
        <div className="max-w-3xl w-full flex flex-col mx-auto mt-2 gap-4 px-6 pb-20">
          {loading && assessments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
              {/* @ts-ignore */}
              <md-circular-progress indeterminate></md-circular-progress>
              <span className="text-[14px] mt-4 opacity-75">正在加载测评数据...</span>
            </div>
          ) : filteredAssessments.length > 0 ? (
            filteredAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                title={assessment.title}
                assignedBy={assessment.assignedBy}
                type={assessment.type}
                completionPercentage={assessment.completionPercentage}
                duration={assessment.duration}
                actionLabel={
                  assessment.completionPercentage === 100
                    ? '查看结果'
                    : assessment.completionPercentage === 0
                      ? '开始'
                      : '继续'
                }
                onAction={() => openAssessment(assessment)}
                onMoreClick={() => console.log(`More options for ${assessment.title}`)}
              />
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-20">assignment</span>
              <p className="text-lg font-medium opacity-50">未发现相关评估："{selectedFilter}"</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function AssessmentsView({ header }: AssessmentsViewProps) {
  return (
    <AssessmentDialogProvider>
      <AssessmentsContent header={header} />
    </AssessmentDialogProvider>
  );
}

