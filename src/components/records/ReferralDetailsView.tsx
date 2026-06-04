import * as React from 'react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, DetailItem, MetricCard, ScrollableDetailsLayout } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { PrimaryTabs } from '../common/Tabs';
import { PsychometricsTabContent } from '../assessments/PsychometricsTabContent';
import { ReferralTracker } from './ReferralTracker';
import { AttachmentList } from '../common/AttachmentList';
import { Quote } from 'lucide-react';

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
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >


            {/* Triage Basics Redesigned Container */}
            <DetailsSection title="分诊基本信息" className="border-t-0 pt-0 mt-0">
              <div className="flex flex-col gap-6">
                {/* 3-Column Metrics Grid */}
                <div className={`grid grid-cols-3 gap-4 ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: "40" }}>
                  <MetricCard
                    label="是否初诊"
                    icon="person_add"
                    value={extendedData.triage.isFirstVisit ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>是
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">close</span>否
                      </span>
                    )}
                  />

                  <MetricCard
                    label="是否服药"
                    icon="medication"
                    value={extendedData.triage.isMedicated ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>是
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">close</span>否
                      </span>
                    )}
                  />

                  <MetricCard
                    label="心理治疗"
                    icon="monitoring"
                    value={extendedData.triage.priorTherapy === '无' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">remove</span>无
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>{extendedData.triage.priorTherapy}
                      </span>
                    )}
                  />
                </div>

                {/* 3-Column Risk Grid */}
                <div className={`grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: "40" }}>
                  <MetricCard
                    label="自杀意念"
                    icon="psychology"
                    className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                    value={
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">error</span>是
                      </span>
                    }
                  />

                  <MetricCard
                    label="自杀企图"
                    icon="personal_injury"
                    className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                    value={
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">error</span>是
                      </span>
                    }
                  />

                  <MetricCard
                    label="自残行为"
                    icon="healing"
                    className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                    value={
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                        <span className="material-symbols-outlined text-[16px] font-bold">error</span>是
                      </span>
                    }
                  />
                </div>

                {/* Referral Full Description Card (Watermarked elegant quote) */}
                <div className="relative p-6 rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border-opacity-10 overflow-hidden flex flex-col gap-3">
                  <span className="text-[14px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-85">转诊详细说明</span>
                  <p className="text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] font-normal z-10 pr-6">
                    "{extendedData.triage.fullDescription}"
                  </p>
                  {/* Large elegant watermark quote mark */}
                  <Quote className="absolute top-6 right-6 text-[#6750A4] opacity-10" size={30} />
                </div>

                {/* Attachment List */}
                <AttachmentList
                  attachments={extendedData.feedback.attachments}
                  title="转诊附件"
                />
              </div>
            </DetailsSection>
          </motion.div>
        )}

        {activeTab === 'tracker' && (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <DetailsSection title="流程记录" className="border-t-0 pt-0 mt-0">
              <ReferralTracker />
            </DetailsSection>

            {/* Referral Destination Card - Surface Container High with Tonal Icons */}
            <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)] border-opacity-30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
                  <span className="material-symbols-outlined text-xl">output_circle</span>
                  <span className="text-sm font-bold uppercase tracking-widest">转诊去向</span>
                </div>
                <div className="px-3 py-1 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] rounded-full text-[10px] font-bold uppercase tracking-tighter">
                  活跃路由
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {[
                  { icon: 'local_hospital', label: '接收医院', value: extendedData.destination.hospital, clickable: true },
                  { icon: 'account_tree', label: '接收科室', value: extendedData.destination.department, clickable: true },
                  { icon: 'badge', label: '接诊医生', value: extendedData.destination.doctor, clickable: true },
                  { icon: 'verified_user', label: '分诊管理员', value: extendedData.destination.admin, clickable: true },
                  { icon: 'calendar_today', label: '转诊日期', value: extendedData.destination.transferDate, clickable: false },
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 group ${item.clickable ? 'cursor-pointer hover:bg-[var(--md-sys-color-surface-variant)] px-3 -mx-3 rounded-xl transition-colors' : 'px-3 -mx-3'}`}>
                    <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-70 uppercase tracking-tight">{item.label}</span>
                      <span className="text-[15px] font-medium leading-tight mt-0.5">{item.value}</span>
                    </div>
                    {item.clickable && (
                      <md-icon-button class="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {/* @ts-ignore */}
                        <md-icon style={{ fontSize: '18px' }}>chevron_right</md-icon>
                      </md-icon-button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
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
          <motion.div
            key="feedback"
            initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-[var(--md-sys-color-primary)] uppercase tracking-widest">医院诊断结果</h4>
                <p className="text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] font-normal">
                  {extendedData.feedback.summary}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border-l-4 border-[var(--md-sys-color-tertiary)] flex flex-col gap-2">
                <h4 className="text-[11px] font-bold text-[var(--md-sys-color-tertiary)] uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">repeat</span>
                  随访计划
                </h4>
                <p className="text-[14px] text-[var(--md-sys-color-on-surface)] font-medium">
                  {extendedData.feedback.followUp}
                </p>
              </div>
            </div>

            <AttachmentList
              attachments={extendedData.feedback.attachments}
              title="附件"
            />
          </motion.div>
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
