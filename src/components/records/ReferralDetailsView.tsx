import * as React from 'react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollableDetailsLayout } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { DestructiveButton } from '../common/DestructiveButton';
import { PrimaryTabs } from '../common/Tabs';
import { PsychometricsTabContent } from '../assessments/PsychometricsTabContent';
import { ReferralOverviewTab } from './ReferralOverviewTab';
import { ReferralTrackerTab } from './ReferralTrackerTab';
import { ReferralFeedbackTab } from './ReferralFeedbackTab';

import { useDetails } from '../../contexts/DetailsContext';
import { useReferralActions } from '../../hooks/useReferralActions';
import { ReferralActionFooter } from './ReferralActionFooter';
import { GenericDialog } from '../common/GenericDialog';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS } from '../../config/styleConstants';
import { DoctorScheduleCalendar } from '../common/DoctorScheduleCalendar';

import { Referral } from '../../types';

interface ReferralDetailsViewProps {
  referral: Referral;
  userRole?: 'student' | 'teacher' | 'head-councillor' | 'trial-admin' | 'doctor';
  hideHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onUpdate?: () => void;
}

type TabType = 'overview' | 'tracker' | 'psychometrics' | 'feedback';

export const REFERRAL_DETAILS_TABS = [
  { id: 'overview', label: '转诊概览', icon: 'clinical_notes' },
  { id: 'tracker', label: '转诊进度', icon: 'timeline' },
  { id: 'psychometrics', label: '量表数据', icon: 'analytics' },
  { id: 'feedback', label: '诊疗反馈', icon: 'history_edu' },
];

export function ReferralDetailsView({ referral, userRole, hideHeader, activeTab: propsActiveTab, onTabChange, onUpdate }: ReferralDetailsViewProps) {
  const { isFullScreen } = useDetails();
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>('overview');
  const activeTab = (propsActiveTab || internalActiveTab) as TabType;

  const { state, actions } = useReferralActions({ referralId: referral.id, onUpdate });

  const [studentData, setStudentData] = React.useState<any>(null);

  React.useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}/api/students?name=${encodeURIComponent(referral.studentName)}`.replace('//api', '/api'))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
      })
      .then((students: any[]) => {
        if (active && students.length > 0) {
          setStudentData(students[0]);
        }
      })
      .catch((err) => console.error('Failed to load matching student for referral:', err));
    return () => {
      active = false;
    };
  }, [referral.studentName]);

  const setActiveTab = React.useCallback((tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  }, [onTabChange]);

  const extendedData = referral.extendedData;

  const isFeedbackAvailable = React.useMemo(() => {
    return extendedData?.steps?.some(
      step => step.type === 'feedback' && step.status === 'completed'
    ) || referral.status === 'Closed';
  }, [extendedData, referral.status]);

  React.useEffect(() => {
    if (internalActiveTab === 'feedback' && !isFeedbackAvailable) {
      setActiveTab('overview');
    }
  }, [internalActiveTab, isFeedbackAvailable, setActiveTab]);

  if (!extendedData) return null;

  const tabs = REFERRAL_DETAILS_TABS.filter(
    tab => tab.id !== 'feedback' || isFeedbackAvailable
  );

  const displayStatus = referral.displayStatus || referral.status;
  const isDoctorRejected = displayStatus === 'Rejected' && extendedData?.steps?.some((s: any) => s.type === 'scheduling' && s.status === 'issue');

  return (
    <ScrollableDetailsLayout
      title={referral.studentName}
      header={!hideHeader && !isFullScreen ? (
        <div className={`flex items-center justify-between gap-4 flex-nowrap overflow-hidden ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: "48" }}>
          <div className="flex items-center gap-4 min-w-0">
            {/* Primary Anchor: First Letter Avatar */}
            <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium shrink-0 animate-in fade-in zoom-in duration-300">
              {referral.studentName.charAt(0)}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h1 className="text-[24px] font-medium leading-[32px] text-[var(--md-sys-color-on-surface)] tracking-tight truncate">
                {referral.studentName}
              </h1>
              <div className="flex items-center gap-3 flex-nowrap whitespace-nowrap">
                <span className="font-mono text-[13px] tracking-tight text-[var(--md-sys-color-primary)] font-bold">
                  {extendedData.studentId || 'N/A'}
                </span>
                <span className="opacity-40 shrink-0">•</span>
                <span className="font-medium truncate">{extendedData.school}</span>
                <span className="opacity-40 shrink-0">•</span>
                <div className={`px-3 py-1 rounded-full flex items-center gap-1 font-bold text-[12px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[referral.riskLevel]}`}>
                  <md-icon style={{ fontSize: '16px', width: '14px', height: '14px' }}>
                    {referral.riskLevel === 'High' ? 'warning' : 'info'}
                  </md-icon>
                  <span>
                    {RISK_LEVEL_LABELS[referral.riskLevel] || referral.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clickable right arrow button in the vertical middle */}
          <div className="flex items-center text-[var(--md-sys-color-on-surface-variant)] shrink-0">
            <md-icon-button>
              <md-icon>chevron_right</md-icon>
            </md-icon-button>
          </div>
        </div>
      ) : undefined}
      tabs={!isFullScreen ? (
        <PrimaryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
        />
      ) : undefined}
      footer={
        <ReferralActionFooter
          referral={referral}
          displayStatus={displayStatus}
          userRole={userRole || ''}
          isDoctorRejected={isDoctorRejected || false}
          actions={actions}
          state={state}
        />
      }
    >
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <ReferralOverviewTab referral={referral} extendedData={extendedData} />
        )}

        {activeTab === 'tracker' && (
          <ReferralTrackerTab extendedData={extendedData} />
        )}




        {activeTab === 'psychometrics' && (
          <motion.div
            key="psychometrics"
            initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            <PsychometricsTabContent
              student={{
                ...studentData,
                name: referral.studentName,
                scidDiagnosis: extendedData.triage.scidDiagnosis || studentData?.scidDiagnosis
              }}
            />
          </motion.div>
        )}

        {activeTab === 'feedback' && (
          <ReferralFeedbackTab extendedData={extendedData} />
        )}
      </AnimatePresence>

      {/* Rejection Reason Dialog */}
      <GenericDialog
        open={state.isRejectionDialogOpen}
        onClose={() => state.setIsRejectionDialogOpen(false)}
        title="拒绝申请"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsRejectionDialogOpen(false)} />
            <TertiaryButton label="确认拒绝" onClick={actions.handleReject} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请提供拒绝该转诊申请的具体原因。此信息将通过通知发送给发起人。
          </p>
          <md-outlined-text-field
            type="textarea"
            rows={4}
            label="拒绝原因"
            className="w-full"
            value={state.rejectionReason}
            onInput={(e: any) => state.setRejectionReason(e.target.value)}
          />
        </div>
      </GenericDialog>

      {/* Recall Confirmation Dialog */}
      <GenericDialog
        open={state.isRecallDialogOpen}
        onClose={() => state.setIsRecallDialogOpen(false)}
        title="确认撤回申请？"
        actions={
          <>
            <SecondaryButton label="取消" onClick={() => state.setIsRecallDialogOpen(false)} />
            <PrimaryButton label="确认撤回" onClick={actions.handleRecall} />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)]">撤回后，该转诊将变为“已撤回”状态。您可以在之后基于此记录重新提交。是否确认撤回？</p>
      </GenericDialog>

      {/* Approval Confirmation Dialog */}
      <GenericDialog
        open={state.isApprovalDialogOpen}
        onClose={() => state.setIsApprovalDialogOpen(false)}
        title="确认批准转诊？"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsApprovalDialogOpen(false)} />
            <TertiaryButton label="确认批准" onClick={actions.handleApprove} />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)]">批准后，该转诊将自动进入心理中心分诊环节。是否确认批准？</p>
      </GenericDialog>

      {/* Delete Draft Dialog */}
      <GenericDialog
        open={state.isDeleteDialogOpen}
        onClose={() => state.setIsDeleteDialogOpen(false)}
        title="确认删除草案？"
        actions={
          <>
            <SecondaryButton label="取消" onClick={() => state.setIsDeleteDialogOpen(false)} />
            <DestructiveButton label="确认删除" icon="delete" onClick={actions.handleDelete} />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)]">删除后，该草案将永久失效且无法恢复。是否确认删除？</p>
      </GenericDialog>

      {/* Assign Doctor Dialog */}
      <GenericDialog
        open={state.isAssignDialogOpen}
        onClose={() => state.setIsAssignDialogOpen(false)}
        title="分配医生"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsAssignDialogOpen(false)} />
            <TertiaryButton label="确认分配" onClick={actions.handleAssign} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请选择接诊的心理医生。分配后，该转诊将进入医生评估阶段。
          </p>
          <div className="relative mt-2">
            <md-outlined-select
              label="选择接诊医生"
              className="w-full relative"
              value={state.selectedDoctorId}
              onChange={(e: any) => state.setSelectedDoctorId(e.target.value)}
            >
              <md-select-option value="李医生">
                <div slot="headline">李医生</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">医学院</div>
              </md-select-option>
              <md-select-option value="李娜">
                <div slot="headline">李娜</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">工学院</div>
              </md-select-option>
              <md-select-option value="王明">
                <div slot="headline">王明</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">经济学院</div>
              </md-select-option>
              <md-select-option value="陈佳">
                <div slot="headline">陈佳</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">艺术学院</div>
              </md-select-option>
            </md-outlined-select>
          </div>
        </div>
      </GenericDialog>

      {/* Scheduling Dialog */}
      <GenericDialog
        open={state.isSchedulingDialogOpen}
        onClose={() => state.setIsSchedulingDialogOpen(false)}
        title="安排就诊时间"
        maxWidth="900px"
        actions={
          <>
            <SecondaryButton label="取消" onClick={() => state.setIsSchedulingDialogOpen(false)} />
            <PrimaryButton label="确认安排" onClick={actions.handleSchedule} />
          </>
        }
      >
        <div className="flex flex-col gap-4 w-full">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请选择为该学生安排的就诊日期和时间。排期后，学生将收到通知。
          </p>
          <div className="mt-2">
            <DoctorScheduleCalendar 
              doctorId={state.selectedDoctorId}
              selectedDateTime={state.scheduleDateTime}
              onSelectDateTime={(val) => state.setScheduleDateTime(val)}
            />
          </div>
        </div>
      </GenericDialog>

    </ScrollableDetailsLayout>
  );
}
