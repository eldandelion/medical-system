import * as React from 'react';
import { ProfileSummaryCard, ActionMetricWidget, InteractiveStatusList } from './DashboardComponents';
import { ActivityStatusType } from '../../config/dashboardConfig';

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
  statusType?: ActivityStatusType;
}

interface DashboardViewProps {
  profileSummary: ProfileSummary;
  actionMetrics: ActionMetric[];
  activityTitle: string;
  activities: ActivityItem[];
  onActivityClick?: (item: ActivityItem) => void;
  rightWidget?: React.ReactNode;
}

export function DashboardView({
  profileSummary,
  actionMetrics,
  activityTitle,
  activities,
  onActivityClick,
  rightWidget
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

        {/* Bottom Section: Recent Activity List & Optional Right Widget */}
        <div className={`md:col-span-12 grid grid-cols-1 ${rightWidget ? 'md:grid-cols-2' : ''} gap-6 mt-4`}>
          {/* Left Side: Activity List */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[16px] leading-[24px] font-medium text-[var(--md-sys-color-on-surface)] tracking-[0.15px]">
              {activityTitle}
            </h3>
            <InteractiveStatusList
              items={activities}
              onRowClick={onActivityClick || (() => {})}
            />
          </div>

          {/* Right Side: Optional Widget */}
          {rightWidget && (
            <div className="flex flex-col gap-4">
              <h3 className="text-[16px] leading-[24px] font-medium text-[var(--md-sys-color-on-surface)] tracking-[0.15px]">
                日程安排
              </h3>
              <div className="flex-1 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl overflow-hidden">
                {rightWidget}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
