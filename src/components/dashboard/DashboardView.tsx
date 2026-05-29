import * as React from 'react';
import { ProfileSummaryCard, ActionMetricWidget, InteractiveStatusList } from './DashboardComponents';

export interface ProfileSummary {
  avatarText: string;
  title: string;
  subtitle: string;
  metadata: { icon: string; value: string }[];
  onClick?: () => void;
}

export interface ActionMetric {
  icon: string;
  numericValue: number;
  label: string;
  containerColorClass: string;
  onClick: () => void;
}

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  statusText: string;
  statusChipColor: string;
}

interface DashboardViewProps {
  profileSummary: ProfileSummary;
  actionMetrics: ActionMetric[];
  activityTitle: string;
  activities: ActivityItem[];
  onActivityClick?: (item: ActivityItem) => void;
}

export function DashboardView({
  profileSummary,
  actionMetrics,
  activityTitle,
  activities,
  onActivityClick
}: DashboardViewProps) {
  return (
    <div className="w-full h-full p-6 bg-[var(--md-sys-color-surface)] overflow-y-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
        {/* Profile Card Widget */}
        <div className="md:col-span-4 flex flex-col h-full">
          <ProfileSummaryCard
            avatarText={profileSummary.avatarText}
            title={profileSummary.title}
            subtitle={profileSummary.subtitle}
            metadata={profileSummary.metadata}
            onClick={profileSummary.onClick}
          />
        </div>

        {/* Action Widgets */}
        {actionMetrics.map((metric, idx) => (
          <div key={idx} className="md:col-span-4 flex flex-col h-full">
            <ActionMetricWidget
              icon={metric.icon}
              numericValue={metric.numericValue}
              label={metric.label}
              containerColorClass={metric.containerColorClass}
              onClick={metric.onClick}
            />
          </div>
        ))}

        {/* Recent Activity List */}
        <div className="md:col-span-12 flex flex-col gap-4 mt-4">
          <h3 className="text-[16px] leading-[24px] font-medium text-[var(--md-sys-color-on-surface)] tracking-[0.15px]">
            {activityTitle}
          </h3>
          <InteractiveStatusList
            items={activities}
            onRowClick={onActivityClick || (() => {})}
          />
        </div>
      </div>
    </div>
  );
}
