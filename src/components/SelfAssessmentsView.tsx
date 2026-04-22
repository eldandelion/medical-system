import * as React from 'react';
import { MaterialChipSet, MaterialFilterChip } from './MaterialChips';
import { AssessmentCard } from './AssessmentCard';

interface Assessment {
  id: string;
  title: string;
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

export function SelfAssessmentsView() {
  const [selectedFilter, setSelectedFilter] = React.useState('All');

  const assessments: Assessment[] = [
    {
      id: '1',
      title: 'Annual Health and Wellness Assessment',
      assignedBy: {
        name: 'Sarah Jenkins',
        initial: 'S',
        bgColor: 'var(--md-sys-color-primary-container)',
        textColor: 'var(--md-sys-color-on-primary-container)'
      },
      type: 'Test',
      completionPercentage: 0,
      duration: '15 minutes',
      status: 'In progress'
    },
    {
      id: '2',
      title: 'Cardiovascular Risk Self-Assessment',
      assignedBy: {
        name: 'Michael Chen',
        initial: 'M',
        bgColor: 'var(--md-sys-color-tertiary-container)',
        textColor: 'var(--md-sys-color-on-tertiary-container)'
      },
      type: 'Test',
      completionPercentage: 45,
      duration: '15 minutes',
      status: 'In progress'
    },
    {
      id: '3',
      title: 'Mental Health Baseline Survey',
      assignedBy: {
        name: 'Dr. Emily Watson',
        initial: 'E',
        bgColor: 'var(--md-sys-color-secondary-container)',
        textColor: 'var(--md-sys-color-on-secondary-container)'
      },
      type: 'Survey',
      completionPercentage: 100,
      duration: '10 minutes',
      status: 'Completed'
    }
  ];

  const filteredAssessments = assessments.filter(a => 
    selectedFilter === 'All' || a.status === selectedFilter
  );

  const filters = ['All', 'In progress', 'Completed'];

  return (
    <div className="flex-1 flex flex-col">
      {/* Material Web Chip Section - Sticky below CanvasHeader */}
      <div className="sticky top-[65px] z-10 px-6 py-4 bg-[var(--md-sys-color-surface)]">
        <MaterialChipSet>
          {filters.map((filter) => (
            <MaterialFilterChip
              key={filter}
              label={filter}
              selected={selectedFilter === filter}
              onClick={() => setSelectedFilter(filter)}
            />
          ))}
        </MaterialChipSet>
      </div>

      {/* Assessments List */}
      <div className="max-w-3xl w-full flex flex-col mx-auto mt-2 gap-4 px-6 pb-20">
        {filteredAssessments.length > 0 ? (
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
                  ? 'Review' 
                  : assessment.completionPercentage === 0 
                    ? 'Get started' 
                    : 'Resume'
              }
              onAction={() => console.log(`Action for ${assessment.title}`)}
              onMoreClick={() => console.log(`More options for ${assessment.title}`)}
            />
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">assignment</span>
            <p className="text-lg font-medium opacity-50">No assessments found for "{selectedFilter}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
