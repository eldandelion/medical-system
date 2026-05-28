import * as React from 'react';
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
    bgColor?: string;
    textColor?: string;
  };
  type: string;
  completionPercentage: number;
  duration: string;
  status: 'All' | 'In progress' | 'Completed';
}

// Module-level variable to persist filter state across component remounts (tab switches)
let persistentFilter = '全部';

function AssessmentsContent() {
  const [selectedFilter, setSelectedFilter] = React.useState(persistentFilter);
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { openAssessment } = useAssessmentDialog();

  const handleFilterChange = (filter: string) => {
    persistentFilter = filter;
    setSelectedFilter(filter);
  };

  React.useEffect(() => {
    let active = true;
    fetch('/api/assessments')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          setAssessments(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch assessments:', err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredAssessments = assessments.filter(a =>
    selectedFilter === '全部' || (selectedFilter === '进行中' && a.status === 'In progress') || (selectedFilter === '已完成' && a.status === 'Completed')
  );

  const filters = ['全部', '进行中', '已完成'];

  return (
    <div className="flex-1 flex flex-col">
      {/* Connected Button Group Section - Sticky below CanvasHeader */}
      <div className="sticky top-[65px] z-10 px-6 py-4 bg-[var(--md-sys-color-surface)] flex justify-center md:justify-start">
        <SegmentedButton
          items={filters.map(f => ({ label: f, value: f }))}
          selectedValue={selectedFilter}
          onChange={handleFilterChange}
        />
      </div>

      {/* Assessments List */}
      <div className="max-w-3xl w-full flex flex-col mx-auto mt-2 gap-4 px-6 pb-20">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            {/* @ts-ignore */}
            <md-linear-progress indeterminate className="w-48 mb-4"></md-linear-progress>
            <span className="text-[14px] opacity-75">正在获取评估列表...</span>
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
  );
}

export function AssessmentsView() {
  return (
    <AssessmentDialogProvider>
      <AssessmentsContent />
    </AssessmentDialogProvider>
  );
}

