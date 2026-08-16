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
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { enrichReferralStatus } from '../../utils/referralUtils';
import { useReferralActions } from '../../hooks/useReferralActions';
import { ReferralActionFooter } from './ReferralActionFooter';
import { GenericDialog } from '../common/GenericDialog';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS, REFERRAL_TYPE_LABELS } from '../../config/styleConstants';
import { DoctorScheduleCalendar } from '../common/DoctorScheduleCalendar';

import { Referral, ReferralDetails } from '../../types';

interface ReferralDetailsViewProps {
  referral: Referral;
  userRole?: 'student' | 'teacher' | 'head-councillor' | 'trial-admin' | 'doctor';
  hideHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onUpdate?: () => void;
}

type TabType = 'overview' | 'tracker' | 'psychometrics' | 'FEEDBACK';

export const REFERRAL_DETAILS_TABS = [
  { id: 'overview', label: '转诊概览', icon: 'clinical_notes' },
  { id: 'tracker', label: '转诊进度', icon: 'timeline' },
  { id: 'psychometrics', label: '量表数据', icon: 'analytics' },
  { id: 'FEEDBACK', label: '诊疗反馈', icon: 'history_edu' },
];

export function ReferralDetailsView(props: ReferralDetailsViewProps) {
  const { session } = useAuth();
  
  const { data: referralDetails, isLoading } = useQuery<ReferralDetails>({
    queryKey: ['/api/referrals', props.referral.id, 'details'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${props.referral.id}`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session?.token || ''}` }
      });
      if (!res.ok) throw new Error('Failed to fetch referral details');
      return await res.json();
    }
  });

  if (isLoading || !referralDetails) {
    const { isFullScreen } = useDetails();
    return (
      <ScrollableDetailsLayout
        title="加载中..."
        header={!props.hideHeader && !isFullScreen ? (
          <div className="flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-variant)] opacity-30 shrink-0"></div>
              <div className="flex flex-col gap-2 min-w-0">
                <div className="w-32 h-6 bg-[var(--md-sys-color-surface-variant)] opacity-30 rounded-md"></div>
                <div className="w-64 h-4 bg-[var(--md-sys-color-surface-variant)] opacity-30 rounded-md"></div>
              </div>
            </div>
          </div>
        ) : undefined}
      >
        <div className="flex flex-col gap-6 animate-pulse p-2 pt-6">
          <div className="h-40 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
          <div className="h-64 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
          <div className="h-32 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
        </div>
      </ScrollableDetailsLayout>
    );
  }

  // Handle case where baseInfo might be missing in some mocks during transition
  const baseReferralRaw = referralDetails.baseInfo || (referralDetails as any);
  const baseReferral = enrichReferralStatus(baseReferralRaw);

  return (
    <ReferralDetailsPresenter 
      {...props}
      referral={baseReferral}
      referralDetails={referralDetails}
    />
  );
}

interface ReferralDetailsPresenterProps extends Omit<ReferralDetailsViewProps, 'referral'> {
  referral: Referral;
  referralDetails: ReferralDetails;
}

function ReferralDetailsPresenter({ referral, referralDetails, userRole, hideHeader, activeTab: propsActiveTab, onTabChange, onUpdate }: ReferralDetailsPresenterProps) {
  const { isFullScreen, setTabsOverride } = useDetails();
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>('overview');
  const activeTab = (propsActiveTab || internalActiveTab) as TabType;

  const { state, actions } = useReferralActions({ referralId: referral.id, onUpdate });

  const { session } = useAuth();
  
  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/doctors`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session?.token || ''}` }
      });
      if (!res.ok) throw new Error('Failed to fetch doctors');
      return await res.json();
    },
    enabled: state.isAssignDialogOpen,
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ['/api/hospitals'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/hospitals`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session?.token || ''}` }
      });
      if (!res.ok) throw new Error('Failed to fetch hospitals');
      return await res.json();
    },
    enabled: state.isApprovalDialogOpen,
  });

  const setActiveTab = React.useCallback((tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  }, [onTabChange]);

  const isFeedbackAvailable = React.useMemo(() => {
    return !!referralDetails.feedback || referral.status === 'CLOSED' || referral.status === 'AWAITING_FEEDBACK_APPROVAL';
  }, [referralDetails, referral.status]);

  React.useEffect(() => {
    if (internalActiveTab === 'FEEDBACK' && !isFeedbackAvailable) {
      setActiveTab('overview');
    }
  }, [internalActiveTab, isFeedbackAvailable, setActiveTab]);

  const tabs = React.useMemo(() => REFERRAL_DETAILS_TABS.filter(
    tab => tab.id !== 'FEEDBACK' || isFeedbackAvailable
  ), [isFeedbackAvailable]);

  React.useEffect(() => {
    if (setTabsOverride) {
      setTabsOverride(tabs);
    }
    return () => {
      if (setTabsOverride) {
        setTabsOverride(null);
      }
    };
  }, [tabs, setTabsOverride]);

  const displayStatus = referral.displayStatus || referral.status;
  const isDoctorRejected = displayStatus === 'REJECTED'; // Removed steps check since we don't have it easily here. If needed we can fetch tracking data.

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
                  {referralDetails.studentDemographics?.studentId || 'N/A'}
                </span>
                <span className="opacity-40 shrink-0">•</span>
                <span className="font-normal truncate">{referralDetails.studentDemographics?.school || '未知'}</span>
                <span className="opacity-40 shrink-0">•</span>
                <div className={`px-3 py-1 rounded-full flex items-center gap-1 font-bold text-[12px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[referral.riskLevel]}`}>
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
          actions={actions}
          state={state}
        />
      }
    >
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <ReferralOverviewTab 
            referral={referral} 
            referralDetails={referralDetails} 
            onNavigateToTracker={() => setActiveTab('tracker')}
          />
        )}

        {activeTab === 'tracker' && (
          <ReferralTrackerTab referralId={referral.id} referral={referral} />
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
                id: referral.studentId || referralDetails.baseInfo?.studentId,
                name: referral.studentName,
                studentNumber: referral.studentNumber,
                scidDiagnosis: referralDetails.triageInfo?.scidDiagnosis
              }}
            />
          </motion.div>
        )}

        {activeTab === 'FEEDBACK' && (
          <ReferralFeedbackTab referralDetails={referralDetails} />
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
            <TertiaryButton label="确认拒绝" onClick={actions.handleReject} disabled={!state.rejectionReason.trim() || !!state.actionError} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请提供拒绝该转诊申请的具体原因。此信息将通过通知发送给发起人。
          </p>
          {state.actionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-xl flex items-center gap-3 mt-2 shadow-sm"
            >
              <md-icon className="text-[var(--md-sys-color-on-error-container)] shrink-0">error_outline</md-icon>
              <span className="text-[14px] font-medium leading-relaxed tracking-wide">
                {state.actionError}
              </span>
            </motion.div>
          )}
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
            <TertiaryButton label="取消" onClick={() => state.setIsRecallDialogOpen(false)} />
            <TertiaryButton label="确认撤回" onClick={actions.handleRecall} disabled={!!state.actionError} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[var(--md-sys-color-on-surface-variant)]">撤回后，该转诊将变为“已撤回”状态。您可以在之后基于此记录重新提交。是否确认撤回？</p>
          {state.actionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-xl flex items-center gap-3 mt-2 shadow-sm"
            >
              <md-icon className="text-[var(--md-sys-color-on-error-container)] shrink-0">error_outline</md-icon>
              <span className="text-[14px] font-medium leading-relaxed tracking-wide">
                {state.actionError}
              </span>
            </motion.div>
          )}
        </div>
      </GenericDialog>

      {/* Approval Confirmation Dialog */}
      <GenericDialog
        open={state.isApprovalDialogOpen}
        onClose={() => state.setIsApprovalDialogOpen(false)}
        title="确认批准转诊？"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsApprovalDialogOpen(false)} />
            <PrimaryButton label="批准" onClick={actions.handleApprove} disabled={!state.selectedHospitalId || !!state.actionError} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请选择接诊医院。批准后，该转诊将自动分配给该医院的分诊管理员（Trial Admin）。
          </p>
          {state.actionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-xl flex items-center gap-3 mt-2 shadow-sm"
            >
              <md-icon className="text-[var(--md-sys-color-on-error-container)] shrink-0">error_outline</md-icon>
              <span className="text-[14px] font-medium leading-relaxed tracking-wide">
                {state.actionError}
              </span>
            </motion.div>
          )}
          <div className="relative mt-2">
            <md-outlined-select
              label="选择接诊医院"
              className="w-full relative"
              value={state.selectedHospitalId}
              onChange={(e: any) => state.setSelectedHospitalId(e.target.value)}
            >
              {hospitals.map((hospital: any) => (
                <md-select-option 
                  key={hospital.id} 
                  value={String(hospital.id)}
                  disabled={!hospital.hasTrialAdmin}
                >
                  <div slot="headline" className={!hospital.hasTrialAdmin ? "opacity-50" : ""}>{hospital.name}</div>
                  {!hospital.hasTrialAdmin && (
                    <div slot="supporting-text" className="text-[12px] text-[var(--md-sys-color-error)] opacity-80">
                      该医院暂无分诊管理员，无法分配
                    </div>
                  )}
                </md-select-option>
              ))}
            </md-outlined-select>
          </div>
        </div>
      </GenericDialog>

      {/* Delete Draft Dialog */}
      <GenericDialog
        open={state.isDeleteDialogOpen}
        onClose={() => state.setIsDeleteDialogOpen(false)}
        title="确认删除草案？"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsDeleteDialogOpen(false)} />
            <TertiaryButton 
              label="确认删除" 
              onClick={actions.handleDelete}
              disabled={!!state.actionError}
            />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[var(--md-sys-color-on-surface-variant)]">删除后，该草案将永久失效且无法恢复。是否确认删除？</p>
          {state.actionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-xl flex items-center gap-3 mt-2 shadow-sm"
            >
              <md-icon className="text-[var(--md-sys-color-on-error-container)] shrink-0">error_outline</md-icon>
              <span className="text-[14px] font-medium leading-relaxed tracking-wide">
                {state.actionError}
              </span>
            </motion.div>
          )}
        </div>
      </GenericDialog>

      {/* Assign Doctor Dialog */}
      <GenericDialog
        open={state.isAssignDialogOpen}
        onClose={() => state.setIsAssignDialogOpen(false)}
        title="分配医生"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsAssignDialogOpen(false)} />
            <PrimaryButton label="确认分配" onClick={actions.handleAssign} disabled={!state.selectedDoctorId || !!state.actionError} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请选择接诊的心理医生。分配后，该转诊将进入医生评估阶段。
          </p>
          {state.actionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-xl flex items-center gap-3 mt-2 shadow-sm"
            >
              <md-icon className="text-[var(--md-sys-color-on-error-container)] shrink-0">error_outline</md-icon>
              <span className="text-[14px] font-medium leading-relaxed tracking-wide">
                {state.actionError}
              </span>
            </motion.div>
          )}
          <div className="relative mt-2">
            <md-outlined-select
              label="选择接诊医生"
              className="w-full relative"
              value={state.selectedDoctorId}
              onChange={(e: any) => state.setSelectedDoctorId(e.target.value)}
            >
              {doctors.map((doc: any) => (
                <md-select-option key={doc.id} value={String(doc.id)}>
                  <div slot="headline">{doc.name}</div>
                  <div slot="supporting-text" className="text-[12px] opacity-70">{doc.departmentName}</div>
                </md-select-option>
              ))}
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
            <PrimaryButton label="确认预约" onClick={actions.handleSchedule} disabled={!state.scheduleDateTime || !!state.actionError} />
          </>
        }
      >
        <div className="flex flex-col gap-4 w-full">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请选择为该学生安排的就诊日期和时间。排期后，学生将收到通知。
          </p>
          {state.actionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: 'auto' }} 
              className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-4 rounded-xl flex items-start gap-3 mt-2 shadow-sm"
            >
              <md-icon className="text-[var(--md-sys-color-error)] shrink-0 mt-0.5">error_outline</md-icon>
              <div className="flex flex-col">
                <span className="text-[14px] font-medium leading-relaxed tracking-wide">
                  {state.actionError}
                </span>
              </div>
            </motion.div>
          )}
          <div className="mt-2">
            <DoctorScheduleCalendar 
              doctorId={state.selectedDoctorId || String((referralDetails as any).extendedData?.destination?.doctor || (referral as any).extendedData?.destination?.doctor || '1')}
              selectedDateTime={state.scheduleDateTime}
              onSelectDateTime={(val) => state.setScheduleDateTime(val)}
            />
          </div>
        </div>
      </GenericDialog>

      {/* Report Problem Dialog */}
      <GenericDialog
        open={state.isReportProblemDialogOpen}
        onClose={() => state.setIsReportProblemDialogOpen(false)}
        title="报告问题"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsReportProblemDialogOpen(false)} />
            <TertiaryButton label="提交反馈" onClick={actions.handleReportProblem} disabled={!state.reportProblemReason.trim() || !!state.actionError} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请详细描述您遇到的问题（如：学生未按时就诊、联系方式有误等）。
          </p>
          {state.actionError && (
            <div className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-3 rounded-md text-sm">
              {state.actionError}
            </div>
          )}
          <md-outlined-text-field
            type="textarea"
            rows={4}
            label="问题描述"
            className="w-full"
            value={state.reportProblemReason}
            onInput={(e: any) => state.setReportProblemReason(e.target.value)}
          />
        </div>
      </GenericDialog>

      {/* Acknowledge Feedback Dialog */}
      <GenericDialog
        open={state.isAcknowledgeDialogOpen || false}
        onClose={() => state.setIsAcknowledgeDialogOpen?.(false)}
        title="确认反馈"
        actions={
          <>
            <TertiaryButton label="取消" onClick={() => state.setIsAcknowledgeDialogOpen?.(false)} />
            <PrimaryButton label="确认反馈并结案" onClick={actions.handleAcknowledgeFeedback} disabled={!!state.actionError} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            您确定要确认这份诊疗反馈吗？确认后，该转诊流程将正式结案。
          </p>
          {state.actionError && (
            <div className="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] p-3 rounded-md text-sm">
              {state.actionError}
            </div>
          )}
        </div>
      </GenericDialog>

    </ScrollableDetailsLayout>
  );
}
