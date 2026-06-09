import * as React from 'react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollableDetailsLayout } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { PrimaryTabs } from '../common/Tabs';
import { PsychometricsTabContent } from '../assessments/PsychometricsTabContent';
import { ReferralOverviewTab } from './ReferralOverviewTab';
import { ReferralTrackerTab } from './ReferralTrackerTab';
import { ReferralFeedbackTab } from './ReferralFeedbackTab';

import { useDetails } from '../../contexts/DetailsContext';
import { GenericDialog } from '../common/GenericDialog';

import { Referral } from '../../types';

interface ReferralDetailsViewProps {
  referral: Referral;
  userRole?: 'student' | 'teacher' | 'head-councillor' | 'trial-admin';
  hideHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

type TabType = 'overview' | 'tracker' | 'psychometrics' | 'feedback';

export const REFERRAL_DETAILS_TABS = [
  { id: 'overview', label: '转诊概览', icon: 'clinical_notes' },
  { id: 'tracker', label: '转诊进度', icon: 'timeline' },
  { id: 'psychometrics', label: '量表数据', icon: 'analytics' },
  { id: 'feedback', label: '诊疗反馈', icon: 'history_edu' },
];

export function ReferralDetailsView({ referral, userRole, hideHeader, activeTab: propsActiveTab, onTabChange }: ReferralDetailsViewProps) {
  const { isFullScreen } = useDetails();
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>('overview');
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const activeTab = (propsActiveTab || internalActiveTab) as TabType;

  const [studentData, setStudentData] = React.useState<any>(null);

  React.useEffect(() => {
    let active = true;
    fetch('/api/students')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
      })
      .then((students: any[]) => {
        if (active) {
          const match = students.find((s) => s.name === referral.studentName);
          if (match) {
            setStudentData(match);
          }
        }
      })
      .catch((err) => console.error('Failed to load matching student for referral:', err));
    return () => {
      active = false;
    };
  }, [referral.studentName]);

  const setActiveTab = (tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const extendedData = referral.extendedData;
  if (!extendedData) return null;

  const tabs = REFERRAL_DETAILS_TABS;

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
                {/* Critical Status: Risk Level Chip */}
                <div className={`px-3 py-1 rounded-full flex items-center gap-1 font-bold text-[12px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${referral.riskLevel === 'High'
                  ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                  : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                  }`}>
                  <span>
                    {referral.riskLevel === 'High' ? '高风险' : '中低风险'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clickable right arrow button in the vertical middle */}
          <div className="flex items-center text-[var(--md-sys-color-on-surface-variant)] shrink-0">
            {/* @ts-ignore */}
            <md-icon-button>
              {/* @ts-ignore */}
              <md-icon>chevron_right</md-icon>
              {/* @ts-ignore */}
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
        <ActionFooter>
          {referral.status === 'AwaitingApproval' ? (
            userRole === 'head-councillor' ? (
              <>
                <PrimaryButton icon="check" label="批准转诊" />
                <SecondaryButton
                  icon="close"
                  label="拒绝申请"
                  onClick={() => setIsRejectionDialogOpen(true)}
                  style={{
                    color: 'var(--md-sys-color-error)',
                    '--md-outlined-button-label-text-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-with-icon-icon-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-hover-label-text-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-hover-state-layer-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-with-icon-hover-icon-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-pressed-label-text-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-pressed-state-layer-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-with-icon-pressed-icon-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-focus-label-text-color': 'var(--md-sys-color-error)',
                    '--md-outlined-button-with-icon-focus-icon-color': 'var(--md-sys-color-error)',
                  } as React.CSSProperties}
                />
              </>
            ) : userRole === 'teacher' ? (
              <SecondaryButton icon="undo" label="撤回申请" />
            ) : (
              <>
                <PrimaryButton icon="upload_file" label="上传文件" />
                <SecondaryButton icon="check" label="确认反馈" />
              </>
            )
          ) : (
            <>
              <PrimaryButton icon="upload_file" label="上传文件" />
              <SecondaryButton icon="check" label="确认反馈" />
            </>
          )}
        </ActionFooter>
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
        open={isRejectionDialogOpen}
        onClose={() => setIsRejectionDialogOpen(false)}
        title="拒绝申请"

        actions={
          <>
            <TertiaryButton label="取消" onClick={() => setIsRejectionDialogOpen(false)} />
            <TertiaryButton
              label="确认拒绝"
              onClick={() => {
                console.log('Rejected with reason:', rejectionReason);
                setIsRejectionDialogOpen(false);
              }}
              style={{
                '--md-text-button-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-hover-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-focus-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-pressed-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-hover-state-layer-color': 'var(--md-sys-color-error)',
                '--md-text-button-pressed-state-layer-color': 'var(--md-sys-color-error)',
              } as React.CSSProperties}
            />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请提供拒绝该转诊申请的具体原因。此信息将通过通知发送给发起人。
          </p>
          <textarea
            autoFocus
            className="w-full min-h-[120px] p-4 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[15px] focus:outline-none focus:border-[var(--md-sys-color-primary)] transition-colors placeholder:opacity-50 resize-none"
            placeholder="输入拒绝原因..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      </GenericDialog>

    </ScrollableDetailsLayout>
  );
}
