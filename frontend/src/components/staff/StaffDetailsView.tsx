import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TeacherSummaryDto } from '../../api/teachers';
import { AccountStatus } from '../../types/admin';
import { useDetails, DetailsTabItem } from '../../contexts/DetailsContext';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { ScrollableDetailsLayout, DetailsSection } from '../common/DetailsPanel';
import { GroupedInfoList } from '../common/GroupedInfoList';
import { SecondaryTabs } from '../common/Tabs';
import { ActionFooter } from '../common/ActionFooter';
import { OutlinedButton } from '../common/Buttons';
import { TeacherCaseloadSection } from './TeacherCaseloadSection';
import { AssignStudentsBottomSheet } from './AssignStudentsBottomSheet';

interface StaffDetailsViewProps {
  staff: TeacherSummaryDto;
  hideHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const StaffDetailsTabs = {
  OVERVIEW: 'overview',
  STUDENTS: 'students',
} as const;

type StaffTabType = (typeof StaffDetailsTabs)[keyof typeof StaffDetailsTabs];

export const STAFF_DETAILS_TABS: DetailsTabItem[] = [
  { id: StaffDetailsTabs.OVERVIEW, label: '基本资料', icon: 'person' },
  { id: StaffDetailsTabs.STUDENTS, label: '负责学生', icon: 'group' },
];

const isValidStaffTab = (tab?: string): tab is StaffTabType =>
  tab === StaffDetailsTabs.OVERVIEW || tab === StaffDetailsTabs.STUDENTS;

const STATUS_BADGE_MAP: Record<AccountStatus, { label: string; className: string; dotClass: string }> = {
  ACTIVE: {
    label: '已启用',
    className: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
    dotClass: 'bg-[var(--md-sys-color-primary)]',
  },
  PENDING_APPROVAL: {
    label: '待审核',
    className: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]',
    dotClass: 'bg-[var(--md-sys-color-tertiary)]',
  },
  DISABLED: {
    label: '已禁用',
    className: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]',
    dotClass: 'bg-[var(--md-sys-color-outline)]',
  },
  DELETED: {
    label: '已注销',
    className: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]',
    dotClass: 'bg-[var(--md-sys-color-error)]',
  },
};

export function StaffDetailsView({
  staff,
  activeTab: propsActiveTab,
  onTabChange,
}: StaffDetailsViewProps) {
  const { isFullScreen, setHeaderOverride, setTabsOverride } = useDetails();
  const { openCreation, closeCreation } = useCreationOverlay();

  const [internalActiveTab, setInternalActiveTab] = React.useState<StaffTabType>(
    isValidStaffTab(propsActiveTab) ? propsActiveTab : StaffDetailsTabs.OVERVIEW
  );
  const activeTab: StaffTabType = isValidStaffTab(propsActiveTab)
    ? propsActiveTab
    : internalActiveTab;

  const handleTabChange = React.useCallback(
    (tabId: string) => {
      if (!isValidStaffTab(tabId)) return;
      setInternalActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  const statusBadge = STATUS_BADGE_MAP[staff.status] || STATUS_BADGE_MAP.ACTIVE;
  const headerSubtitle = [staff.employeeNumber, staff.collegeName].filter(Boolean).join(' • ') || 'N/A';
  const isTeacherActive = staff.status === 'ACTIVE';

  React.useEffect(() => {
    setTabsOverride?.(STAFF_DETAILS_TABS);
    return () => {
      setTabsOverride?.(null);
    };
  }, [setTabsOverride]);

  React.useEffect(() => {
    if (setHeaderOverride && staff) {
      setHeaderOverride({
        avatar: (
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0 uppercase">
            {staff.name ? staff.name.charAt(0) : '?'}
          </div>
        ),
        title: staff.name,
        subtitle: headerSubtitle,
        badge: (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap ${statusBadge.className}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`}></span>
            {statusBadge.label}
          </span>
        ),
      });
    }
    return () => {
      setHeaderOverride?.(null);
    };
  }, [setHeaderOverride, staff, staff.name, headerSubtitle, statusBadge]);

  const handleOpenAssignSheet = () => {
    if (!isTeacherActive) return;
    openCreation(
      '分配学生',
      <AssignStudentsBottomSheet
        teacher={{
          id: staff.id,
          name: staff.name,
          employeeNumber: staff.employeeNumber,
          collegeName: staff.collegeName,
        }}
        onClose={closeCreation}
      />
    );
  };

  return (
    <ScrollableDetailsLayout
      title={staff.name}
      disableTitleOverride={true}
      tabs={
        !isFullScreen ? (
          <SecondaryTabs
            tabs={STAFF_DETAILS_TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        ) : undefined
      }
      footer={
        <ActionFooter>
          <OutlinedButton
            icon="person_add"
            label="分配学生"
            noCollapse
            disabled={!isTeacherActive}
            onClick={handleOpenAssignSheet}
          />
        </ActionFooter>
      }
    >
      <AnimatePresence mode="wait">
        {activeTab === StaffDetailsTabs.OVERVIEW ? (
          <motion.div
            key={StaffDetailsTabs.OVERVIEW}
            initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <DetailsSection title="机构与联系信息">
              <GroupedInfoList
                fallbackText="未登记"
                items={[
                  {
                    label: '教工号',
                    value: staff.employeeNumber || undefined,
                    icon: 'badge',
                    copyable: Boolean(staff.employeeNumber),
                  },
                  {
                    label: '所属学院',
                    value: staff.collegeName || undefined,
                    icon: 'account_balance',
                  },
                  {
                    label: '联系电话',
                    value: staff.phone || undefined,
                    icon: 'call',
                    copyable: Boolean(staff.phone),
                  },
                  {
                    label: '电子邮箱',
                    value: staff.email || undefined,
                    icon: 'mail',
                    copyable: Boolean(staff.email),
                  },
                ]}
              />
            </DetailsSection>
          </motion.div>
        ) : (
          <motion.div
            key={StaffDetailsTabs.STUDENTS}
            initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <TeacherCaseloadSection
              teacherId={staff.id}
              teacherName={staff.name}
              teacherStatus={staff.status}
              placeholderSummary={staff}
              hideAssignButton
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ScrollableDetailsLayout>
  );
}
