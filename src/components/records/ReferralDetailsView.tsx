import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, DetailItem, useScrollCollapse, CollapsibleHeader } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { PsychometricTable } from '../common/PsychometricTable';
import { PrimaryTabs } from '../common/Tabs';

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

type TabType = 'overview' | 'risk' | 'psychometrics' | 'feedback';

export function ReferralDetailsView({ referral, userRole, hideHeader, activeTab: propsActiveTab, onTabChange }: ReferralDetailsViewProps) {
  const { isFullScreen } = useDetails();
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>('overview');
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const activeTab = (propsActiveTab || internalActiveTab) as TabType;
  const { isScrolled, handleScroll } = useScrollCollapse(20);

  const setActiveTab = (tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const extendedData = referral.extendedData;
  if (!extendedData) return null;

  const tabs = [
    { id: 'overview', label: '转诊概览', icon: 'clinical_notes' },
    { id: 'risk', label: '风险评估', icon: 'warning' },
    { id: 'psychometrics', label: '量表数据', icon: 'analytics' },
    { id: 'feedback', label: '诊疗反馈', icon: 'history_edu' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)]">
      {/* Primary Anchor Header Section (Collapsible) */}
      <CollapsibleHeader visible={!hideHeader && !isFullScreen && !isScrolled}>
        <div className="p-6 pb-4 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 flex-nowrap overflow-hidden">
            <div className="flex items-center gap-4 min-w-0">
              {/* Primary Anchor: First Letter Avatar */}
              <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium shrink-0 animate-in fade-in zoom-in duration-300">
                {referral.studentName.charAt(0)}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="text-[24px] font-medium leading-[32px] text-[var(--md-sys-color-on-surface)] tracking-tight truncate">
                  {referral.studentName}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] opacity-80 whitespace-nowrap">
                    <md-icon style={{ fontSize: '20px', width: '20px', height: '20px' }}>badge</md-icon>
                    <span>{extendedData.studentId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] opacity-80 whitespace-nowrap">
                    <md-icon style={{ fontSize: '20px', width: '20px', height: '20px' }}>school</md-icon>
                    <span>{extendedData.school}</span>
                  </div>
                  {/* Critical Status: Risk Level Chip */}
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1 font-bold text-[12px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${referral.riskLevel === 'High'
                    ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                    : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                    }`}>
                    <md-icon style={{ fontSize: '16px', width: '14px', height: '14px' }}>
                      {referral.riskLevel === 'High' ? 'warning' : 'info'}
                    </md-icon>
                    <span>
                      {referral.riskLevel === 'High' ? '高风险' : '中低风险'}
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
        </div>
      </CollapsibleHeader>

      {/* Primary Tabs */}
      {!isFullScreen && (
        <PrimaryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
        />
      )}

      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32"
        onScroll={handleScroll}
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


              {/* Triage Basics Card - Outlined */}
              <div className="p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-6">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
                  <span className="material-symbols-outlined text-[20px]">medical_information</span>
                  <span className="text-sm font-bold uppercase tracking-widest">分诊基本信息</span>
                </div>
                <div className="grid grid-cols-2 gap-y-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      是否初诊
                    </span>
                    <span className="text-[14px] font-medium">{extendedData.triage.isFirstVisit ? '是' : '否'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      是否服药
                    </span>
                    <span className="text-[14px] font-medium">{extendedData.triage.isMedicated ? '是' : '否'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      接受过心理治疗
                    </span>
                    <span className="text-[14px] font-medium">{extendedData.triage.priorTherapy}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      SCID诊断
                    </span>
                    <span className="text-[14px] font-medium text-[var(--md-sys-color-primary)]">{extendedData.triage.scidDiagnosis}</span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-2 p-4 bg-[var(--md-sys-color-surface-container-lowest)] rounded-xl border border-dashed border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">转诊详细说明</span>
                    <p className="text-[14px] leading-relaxed text-[var(--md-sys-color-on-surface)] italic font-light">
                      "{extendedData.triage.fullDescription}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral Destination Card - Surface Container High with Tonal Icons */}
              <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)] border-opacity-30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
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
                        <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] opacity-40 group-hover:opacity-100 transition-opacity">chevron_right</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="p-2 rounded-2xl border border-[var(--md-sys-color-outline-variant)] flex flex-col">
                {[
                  { label: '自杀意念终身', value: extendedData.risk.ideation },
                  { label: '自杀尝试终身', value: extendedData.risk.attempt },
                  { label: '自伤行为终身', value: extendedData.risk.selfHarm },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors rounded-xl">
                    <span className="text-[15px] font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.value ? (
                        <div className="flex items-center gap-2 text-[var(--md-sys-color-error)]">
                          <span className="material-symbols-outlined font-variation-settings-fill-1">warning</span>
                          <span className="text-xs font-bold uppercase">阳性 Positive</span>
                        </div>
                      ) : (
                        <span className="text-[var(--md-sys-color-on-surface-variant)] opacity-40 text-xs font-bold uppercase">阴性 Negative</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-sm">sticky_note_2</span>
                  <span className="text-xs font-bold uppercase tracking-widest">补充风险笔记</span>
                </div>
                <p className="text-[14px] leading-relaxed text-[var(--md-sys-color-on-surface)]">
                  {extendedData.risk.notes}
                </p>
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
              className="flex flex-col gap-6"
            >
              <PsychometricTable scores={extendedData.scores} />
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

              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest px-1">附件 (3)</h4>
                <div className="grid grid-cols-1 gap-3">
                  {extendedData.feedback.attachments.map((file, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors shrink-0">
                          <span className="material-symbols-outlined">attach_file</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{file.name}</span>
                          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">{file.size}</span>
                        </div>
                      </div>
                      <md-icon-button>
                        <md-icon>download</md-icon>
                      </md-icon-button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      {/* Action Footer */}
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
    </div>
  );
}
