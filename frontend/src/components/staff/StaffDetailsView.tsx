import * as React from 'react';
import { TeacherSummaryDto } from '../../api/teachers';
import { AccountStatus } from '../../types/admin';
import { useDetails } from '../../contexts/DetailsContext';
import { ScrollableDetailsLayout, DetailsSection } from '../common/DetailsPanel';
import { GroupedInfoList } from '../common/GroupedInfoList';
import { TeacherCaseloadSection } from './TeacherCaseloadSection';

interface StaffDetailsViewProps {
  staff: TeacherSummaryDto;
  hideHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const STAFF_DETAILS_TABS: { id: string; label: string; icon: string }[] = [];

const STATUS_BADGE_MAP: Record<AccountStatus, { label: string; className: string; dotClass: string }> = {
  ACTIVE: {
    label: '已启用 (ACTIVE)',
    className: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
    dotClass: 'bg-[var(--md-sys-color-primary)]',
  },
  PENDING_APPROVAL: {
    label: '待审核 (PENDING)',
    className: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
    dotClass: 'bg-[var(--md-sys-color-tertiary)]',
  },
  DISABLED: {
    label: '已禁用 (DISABLED)',
    className: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]',
    dotClass: 'bg-[var(--md-sys-color-outline)]',
  },
  DELETED: {
    label: '已注销 (DELETED)',
    className: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
    dotClass: 'bg-[var(--md-sys-color-error)]',
  },
};

export function StaffDetailsView({ staff, hideHeader }: StaffDetailsViewProps) {
  const { isFullScreen } = useDetails();
  const statusBadge = STATUS_BADGE_MAP[staff.status] || STATUS_BADGE_MAP.ACTIVE;

  return (
    <ScrollableDetailsLayout
      title={staff.name}
      header={
        !hideHeader && !isFullScreen ? (
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-2xl font-bold flex items-center justify-center shadow-xs shrink-0 uppercase">
              {staff.name ? staff.name.charAt(0) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] truncate">
                  {staff.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] shrink-0">
                  专任教师 / 导师
                </span>
              </div>
              <div className="flex items-center gap-x-2 gap-y-1 text-xs text-[var(--md-sys-color-on-surface-variant)] flex-wrap">
                <span className="font-mono text-xs font-bold text-[var(--md-sys-color-primary)]">
                  {staff.employeeNumber}
                </span>
                <span className="opacity-40">•</span>
                <span className="truncate">{staff.collegeName}</span>
              </div>
              <div className="mt-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`}></span>
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>
        ) : undefined
      }
    >
      <DetailsSection title="机构与联系信息">
        <GroupedInfoList
          items={[
            { label: '教工号', value: staff.employeeNumber || '未登记', icon: 'badge' },
            { label: '所属学院', value: staff.collegeName || '未登记', icon: 'account_balance' },
            { label: '联系电话', value: staff.phone || '未登记', icon: 'call' },
            { label: '电子邮箱', value: staff.email || '未登记', icon: 'mail' },
          ]}
        />
      </DetailsSection>

      <TeacherCaseloadSection
        teacherId={staff.id}
        teacherName={staff.name}
        teacherStatus={staff.status}
        placeholderSummary={staff}
      />
    </ScrollableDetailsLayout>
  );
}
