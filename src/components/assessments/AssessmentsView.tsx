import * as React from 'react';
import { AssessmentCard } from './AssessmentCard';
import { SegmentedButton } from '../common/Buttons';
import { AssessmentDialogProvider, useAssessmentDialog } from '../../contexts/AssessmentDialogContext';
import { MENTAL_HEALTH_ASSESSMENT, SLEEP_ASSESSMENT, DIGITAL_HABITS_DAILY_BEHAVIORS_ASSESSMENT, AssessmentSection } from './AssessmentData';

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
  const { openAssessment } = useAssessmentDialog();

  const handleFilterChange = (filter: string) => {
    persistentFilter = filter;
    setSelectedFilter(filter);
  };

  const assessments: Assessment[] = [
    {
      id: '1',
      title: '年度身心健康状况评估',
      subtitle: '2025-2026 学年学生心理健康普查',
      sections: MENTAL_HEALTH_ASSESSMENT,
      assignedBy: {
        name: '莎拉·詹金斯',
        initial: 'S',
        bgColor: 'var(--md-sys-color-primary-container)',
        textColor: 'var(--md-sys-color-on-primary-container)'
      },
      type: '测试',
      completionPercentage: 0,
      duration: '15 分钟',
      status: 'In progress'
    },
    {
      id: 'sleep',
      title: '睡眠状况评估',
      subtitle: '最近1个月的睡眠与失眠状况调查',
      sections: SLEEP_ASSESSMENT,
      assignedBy: {
        name: '莎拉·詹金斯',
        initial: 'S',
        bgColor: 'var(--md-sys-color-primary-container)',
        textColor: 'var(--md-sys-color-on-primary-container)'
      },
      type: '测试',
      completionPercentage: 0,
      duration: '10 分钟',
      status: 'In progress'
    },
    {
      id: 'digital_habits',
      title: '数字化习惯与日常行为评估',
      subtitle: '数字化习惯与日常行为状况综合评估',
      sections: DIGITAL_HABITS_DAILY_BEHAVIORS_ASSESSMENT,
      assignedBy: {
        name: '迈克尔·陈',
        initial: 'M',
        bgColor: 'var(--md-sys-color-tertiary-container)',
        textColor: 'var(--md-sys-color-on-tertiary-container)'
      },
      type: '测试',
      completionPercentage: 0,
      duration: '20 分钟',
      status: 'In progress'
    },
    {
      id: '2',
      title: '心血管风险自我评估',
      assignedBy: {
        name: '迈克尔·陈',
        initial: 'M',
        bgColor: 'var(--md-sys-color-tertiary-container)',
        textColor: 'var(--md-sys-color-on-tertiary-container)'
      },
      type: '测试',
      completionPercentage: 45,
      duration: '15 分钟',
      status: 'In progress'
    },
    {
      id: '3',
      title: '心理健康基线调查',
      assignedBy: {
        name: '艾米丽·沃森博士',
        initial: 'E',
        bgColor: 'var(--md-sys-color-secondary-container)',
        textColor: 'var(--md-sys-color-on-secondary-container)'
      },
      type: '调查',
      completionPercentage: 100,
      duration: '10 分钟',
      status: 'Completed'
    }
  ];

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

