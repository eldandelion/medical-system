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
import { useCreationOverlay } from '../../contexts/CreationContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';
import { GenericDialog } from '../common/GenericDialog';

import { Referral } from '../../types';

interface ReferralDetailsViewProps {
  referral: Referral;
  userRole?: 'student' | 'teacher' | 'head-councillor' | 'trial-admin';
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
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = React.useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = React.useState(false);
  const [isRecallDialogOpen, setIsRecallDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [selectedDoctorId, setSelectedDoctorId] = React.useState('张伟医生');
  const activeTab = (propsActiveTab || internalActiveTab) as TabType;

  const { openCreation, closeCreation } = useCreationOverlay();
  const { showSnackbar } = useSnackbar();
  const { session } = useAuth();

  const [studentData, setStudentData] = React.useState<any>(null);

  React.useEffect(() => {
    let active = true;
    fetch(`${import.meta.env.BASE_URL}/api/students`.replace('//api', '/api'))
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

  let displayStatus = referral.status;
  const steps = extendedData.steps;
  if (steps) {
    if (steps.some(s => s.status === 'issue')) {
      displayStatus = 'Error';
    } else {
      const activeStep = steps.find(s => s.status === 'active');
      if (activeStep) {
        if (activeStep.type === 'triage') {
          displayStatus = 'AwaitingTriage';
        } else if (activeStep.type === 'evaluation') {
          displayStatus = 'Pending';
        } else if (activeStep.type === 'feedback') {
          displayStatus = 'AwaitingFeedbackApproval';
        }
      }
    }
  }

  const handleRecall = async () => {
    setIsRecallDialogOpen(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${referral.id}/recall`.replace('//api', '/api'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`
        }
      });
      if (res.ok) {
        showSnackbar({ message: '转诊申请已撤回', duration: 3000 });
        onUpdate?.();
      } else {
        throw new Error('Failed to recall');
      }
    } catch (e) {
      showSnackbar({ message: '撤回失败，请稍后重试', duration: 3000 });
    }
  };

  const handleDelete = async () => {
    setIsDeleteDialogOpen(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${referral.id}`.replace('//api', '/api'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`
        }
      });
      if (res.ok) {
        showSnackbar({ message: '草案已删除', duration: 3000 });
        onUpdate?.();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (e) {
      showSnackbar({ message: '删除失败，请稍后重试', duration: 3000 });
    }
  };

  const handleApprove = async () => {
    setIsApprovalDialogOpen(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${referral.id}/approve`.replace('//api', '/api'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`
        }
      });
      if (res.ok) {
        showSnackbar({ message: '转诊已批准', duration: 3000 });
        onUpdate?.();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (e) {
      showSnackbar({ message: '批准失败，请稍后重试', duration: 3000 });
    }
  };

  const handleReject = async () => {
    setIsRejectionDialogOpen(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${referral.id}/reject`.replace('//api', '/api'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (res.ok) {
        showSnackbar({ message: '转诊已拒绝', duration: 3000 });
        setRejectionReason('');
        onUpdate?.();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (e) {
      showSnackbar({ message: '操作失败，请稍后重试', duration: 3000 });
    }
  };

  const handleAssign = async () => {
    setIsAssignDialogOpen(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${referral.id}/assign`.replace('//api', '/api'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`
        },
        body: JSON.stringify({ doctorId: selectedDoctorId })
      });
      if (res.ok) {
        showSnackbar({ message: '转诊已分配', duration: 3000 });
        onUpdate?.();
      } else {
        throw new Error('Failed to assign');
      }
    } catch (e) {
      showSnackbar({ message: '分配失败，请稍后重试', duration: 3000 });
    }
  };

  const handleResubmit = () => {
    // Map existing data to CreationForm format
    const initialData = {
      title: referral.title,
      reason: referral.description,
      riskLevel: referral.riskLevel,
      clinicalStatus: [
        ...(extendedData.triage.isFirstVisit ? ['FirstVisit' as any] : []),
        ...(extendedData.triage.isMedicated ? ['Medicated' as any] : []),
        ...(extendedData.triage.priorTherapy === '有' ? ['PriorTherapy' as any] : [])
      ],
      severeRiskFactors: [
        ...(extendedData.risk.ideation ? ['Ideation' as any] : []),
        ...(extendedData.risk.attempt ? ['Attempt' as any] : []),
        ...(extendedData.risk.selfHarm ? ['SelfHarm' as any] : [])
      ],
      attachments: extendedData.feedback.attachments || []
    };

    // Need to dynamically import ReferralCreationForm to avoid circular dependencies if any, but since it's already used in pages, we can just import it.
    // Wait, ReferralDetailsView doesn't import ReferralCreationForm yet. Let's add it to imports.
  };

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
        (displayStatus === 'Recalled' && userRole === 'head-councillor') || displayStatus === 'Pending' || displayStatus === 'Closed' || displayStatus === 'Error' ? undefined : (
          <ActionFooter>
            {displayStatus === 'Recalled' ? (
              userRole === 'teacher' ? (
                <>
                  <PrimaryButton icon="restart_alt" label="基于此重新创建" onClick={() => {
                    import('./ReferralCreationForm').then(({ ReferralCreationForm }) => {
                      const initialData = {
                        title: referral.title,
                        reason: referral.description,
                        riskLevel: referral.riskLevel,
                        clinicalStatus: [
                          ...(extendedData.triage.isFirstVisit ? ['FirstVisit' as any] : []),
                          ...(extendedData.triage.isMedicated ? ['Medicated' as any] : []),
                          ...(extendedData.triage.priorTherapy === '有' ? ['PriorTherapy' as any] : [])
                        ],
                        severeRiskFactors: [
                          ...(extendedData.risk.ideation ? ['Ideation' as any] : []),
                          ...(extendedData.risk.attempt ? ['Attempt' as any] : []),
                          ...(extendedData.risk.selfHarm ? ['SelfHarm' as any] : [])
                        ],
                        attachments: extendedData.feedback.attachments || []
                      };
                      openCreation('重新发起转诊', <ReferralCreationForm onClose={closeCreation} initialData={initialData} />);
                    });
                  }} />
                </>
              ) : null
            ) : displayStatus === 'AwaitingApproval' ? (
              userRole === 'head-councillor' ? (
                <>
                  <PrimaryButton icon="check" label="批准转诊" onClick={() => setIsApprovalDialogOpen(true)} />
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
                <SecondaryButton icon="undo" label="撤回申请" onClick={() => setIsRecallDialogOpen(true)} />
              ) : null
            ) : displayStatus === 'AwaitingTriage' ? (
              userRole === 'trial-admin' ? (
                <>
                  <PrimaryButton icon="assignment_ind" label="分配医生" onClick={() => setIsAssignDialogOpen(true)} />
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
              ) : null
            ) : displayStatus === 'Draft' && (userRole === 'teacher' || userRole === 'head-councillor') ? (
              <>
                <PrimaryButton icon="edit_document" label="编辑草案" onClick={() => {
                  import('./ReferralCreationForm').then(({ ReferralCreationForm }) => {
                    const initialData = {
                      title: referral.title,
                      reason: referral.description,
                      riskLevel: referral.riskLevel,
                      clinicalStatus: [
                        ...(extendedData.triage.isFirstVisit ? ['FirstVisit' as any] : []),
                        ...(extendedData.triage.isMedicated ? ['Medicated' as any] : []),
                        ...(extendedData.triage.priorTherapy === '有' ? ['PriorTherapy' as any] : [])
                      ],
                      severeRiskFactors: [
                        ...(extendedData.risk.ideation ? ['Ideation' as any] : []),
                        ...(extendedData.risk.attempt ? ['Attempt' as any] : []),
                        ...(extendedData.risk.selfHarm ? ['SelfHarm' as any] : [])
                      ],
                      attachments: extendedData.feedback.attachments || []
                    };
                    openCreation('重新发起转诊', <ReferralCreationForm onClose={closeCreation} initialData={initialData} />);
                  });
                }} />
                <SecondaryButton
                  icon="delete"
                  label="删除草案"
                  onClick={() => setIsDeleteDialogOpen(true)}
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
            ) : displayStatus === 'AwaitingFeedbackApproval' ? (
              <>
                <PrimaryButton icon="check" label="确认反馈" />
              </>
            ) : null}
          </ActionFooter>
        )
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
              onClick={handleReject}
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
          {/* @ts-ignore */}
          <md-outlined-text-field
            type="textarea"
            rows={4}
            label="拒绝原因"
            className="w-full"
            value={rejectionReason}
            onInput={(e: any) => setRejectionReason(e.target.value)}
          >
          {/* @ts-ignore */}
          </md-outlined-text-field>
        </div>
      </GenericDialog>

      {/* Recall Confirmation Dialog */}
      <GenericDialog
        open={isRecallDialogOpen}
        onClose={() => setIsRecallDialogOpen(false)}
        title="确认撤回申请？"
        actions={
          <>
            <SecondaryButton label="取消" onClick={() => setIsRecallDialogOpen(false)} />
            <PrimaryButton label="确认撤回" onClick={handleRecall} />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)]">撤回后，该转诊将变为“已撤回”状态。您可以在之后基于此记录重新提交。是否确认撤回？</p>
      </GenericDialog>

      {/* Approval Confirmation Dialog */}
      <GenericDialog
        open={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        title="确认批准转诊？"
        actions={
          <>
            <SecondaryButton label="取消" onClick={() => setIsApprovalDialogOpen(false)} />
            <PrimaryButton label="确认批准" onClick={handleApprove} />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)]">批准后，该转诊将自动进入心理中心分诊环节。是否确认批准？</p>
      </GenericDialog>

      {/* Delete Draft Dialog */}
      <GenericDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="确认删除草案？"
        actions={
          <>
            <SecondaryButton label="取消" onClick={() => setIsDeleteDialogOpen(false)} />
            <PrimaryButton 
              label="确认删除" 
              onClick={handleDelete}
              style={{
                '--md-filled-button-container-color': 'var(--md-sys-color-error)',
                '--md-filled-button-label-text-color': 'var(--md-sys-color-on-error)',
                '--md-filled-button-hover-container-color': 'var(--md-sys-color-error)',
                '--md-filled-button-pressed-container-color': 'var(--md-sys-color-error)',
              } as React.CSSProperties}
            />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)]">删除后，该草案将永久失效且无法恢复。是否确认删除？</p>
      </GenericDialog>

      {/* Assign Doctor Dialog */}
      <GenericDialog
        open={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        title="分配医生"
        actions={
          <>
            <SecondaryButton label="取消" onClick={() => setIsAssignDialogOpen(false)} />
            <PrimaryButton label="确认分配" onClick={handleAssign} />
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            请选择接诊的心理医生。分配后，该转诊将进入医生评估阶段。
          </p>
          <div className="relative mt-2">
            {/* @ts-ignore */}
            <md-outlined-select
              label="选择接诊医生"
              className="w-full relative"
              value={selectedDoctorId}
              onChange={(e: any) => setSelectedDoctorId(e.target.value)}
            >
              {/* @ts-ignore */}
              <md-select-option value="张伟医生">
                <div slot="headline">张伟医生</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">医学院</div>
              {/* @ts-ignore */}
              </md-select-option>
              {/* @ts-ignore */}
              <md-select-option value="李娜">
                <div slot="headline">李娜</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">工学院</div>
              {/* @ts-ignore */}
              </md-select-option>
              {/* @ts-ignore */}
              <md-select-option value="王明">
                <div slot="headline">王明</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">经济学院</div>
              {/* @ts-ignore */}
              </md-select-option>
              {/* @ts-ignore */}
              <md-select-option value="陈佳">
                <div slot="headline">陈佳</div>
                <div slot="supporting-text" className="text-[12px] opacity-70">艺术学院</div>
              {/* @ts-ignore */}
              </md-select-option>
            {/* @ts-ignore */}
            </md-outlined-select>
          </div>
        </div>
      </GenericDialog>

    </ScrollableDetailsLayout>
  );
}
