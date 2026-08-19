import React from 'react';
import { 
  Building2, 
  Calendar, 
  Check, 
  GraduationCap, 
  MessageSquare, 
  RotateCcw, 
  Stethoscope, 
  Users, 
  X, 
  LucideIcon 
} from 'lucide-react';
import { ReferralStep, ReferralStepType } from '../../types';
import { getIconForType } from './ReferralTracker';

interface StageInfo {
  title: string;
  icon: LucideIcon;
  variant: 'active' | 'completed' | 'error' | 'neutral';
}

const STAGE_CONFIG: Record<string, StageInfo> = {
  // Domain statuses
  'AWAITING_APPROVAL': { title: '辅导员审批中', icon: Users, variant: 'active' },
  'AWAITING_REVIEW': { title: '辅导员审批中', icon: Users, variant: 'active' },
  'AWAITING_TRIAGE': { title: '中心分诊中', icon: Building2, variant: 'active' },
  'WAITING_FOR_SCHEDULING': { title: '预约排期中', icon: Calendar, variant: 'active' },
  'WAITING_FOR_APPOINTMENT': { title: '等待就诊', icon: Stethoscope, variant: 'active' },
  'AWAITING_FEEDBACK_APPROVAL': { title: '诊疗反馈审批中', icon: MessageSquare, variant: 'active' },
  'CLOSED': { title: '转诊已结案', icon: Check, variant: 'completed' },
  'REJECTED': { title: '转诊已拒绝', icon: X, variant: 'error' },
  'RECALLED': { title: '转诊已撤回', icon: RotateCcw, variant: 'neutral' },
  'DRAFT': { title: '草稿待提交', icon: GraduationCap, variant: 'neutral' },
  'NEEDS_REASSIGNMENT': { title: '待重新分配', icon: Building2, variant: 'error' },
  'ERROR': { title: '转诊异常', icon: X, variant: 'error' },
  'PENDING': { title: '转诊处理中', icon: Stethoscope, variant: 'active' },

  // Step types
  'INITIATION': { title: '转诊发起中', icon: GraduationCap, variant: 'neutral' },
  'REVIEW': { title: '辅导员审批中', icon: Users, variant: 'active' },
  'TRIAGE': { title: '中心分诊中', icon: Building2, variant: 'active' },
  'SCHEDULING': { title: '预约排期中', icon: Calendar, variant: 'active' },
  'EVALUATION': { title: '等待就诊', icon: Stethoscope, variant: 'active' },
  'FEEDBACK': { title: '诊疗反馈审批中', icon: MessageSquare, variant: 'active' },
};

interface ReferralStatusCardProps {
  status?: string;
  activeStep?: ReferralStep;
  onClick?: () => void;
}

export function ReferralStatusCard({ status, activeStep, onClick }: ReferralStatusCardProps) {
  const isStepIssue = activeStep?.status === 'ISSUE';

  // Resolve stage configuration by prioritizing explicit status, then activeStep type
  const key = status || activeStep?.type || '';
  const stageInfo = STAGE_CONFIG[key];

  const title = stageInfo?.title || (activeStep ? STAGE_CONFIG[activeStep.type]?.title : '转诊处理中') || '转诊处理中';
  const IconComponent: LucideIcon = stageInfo?.icon || (activeStep ? getIconForType(activeStep.type) : null) || Stethoscope;
  const variant = isStepIssue ? 'error' : (stageInfo?.variant || 'active');

  const getStyleTokens = () => {
    switch (variant) {
      case 'error':
        return {
          containerBg: 'bg-[var(--md-sys-color-error-container)]/20',
          textColor: 'text-[var(--md-sys-color-on-error-container)]',
          iconBg: 'bg-[var(--md-sys-color-error-container)]',
          iconColor: 'text-[var(--md-sys-color-error)]',
          titleText: 'text-[var(--md-sys-color-on-error-container)]'
        };
      case 'completed':
        return {
          containerBg: 'bg-[var(--md-sys-color-surface-container-high)]',
          textColor: 'text-[var(--md-sys-color-on-surface)]',
          iconBg: 'bg-[var(--md-sys-color-secondary-container)]',
          iconColor: 'text-[var(--md-sys-color-on-secondary-container)]',
          titleText: 'text-[var(--md-sys-color-on-surface)]'
        };
      case 'neutral':
        return {
          containerBg: 'bg-[var(--md-sys-color-surface-container-high)]',
          textColor: 'text-[var(--md-sys-color-on-surface-variant)]',
          iconBg: 'bg-[var(--md-sys-color-surface-container-highest)]',
          iconColor: 'text-[var(--md-sys-color-on-surface-variant)]',
          titleText: 'text-[var(--md-sys-color-on-surface-variant)]'
        };
      case 'active':
      default:
        return {
          containerBg: 'bg-[var(--md-sys-color-primary-container)]',
          textColor: 'text-[var(--md-sys-color-on-primary-container)]',
          iconBg: 'bg-[var(--md-sys-color-primary)]',
          iconColor: 'text-[var(--md-sys-color-on-primary)]',
          titleText: 'text-[var(--md-sys-color-on-primary-container)]'
        };
    }
  };

  const { containerBg, textColor, iconBg, iconColor, titleText } = getStyleTokens();

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl ${containerBg} ${textColor} cursor-pointer hover:opacity-95 transition-all duration-300 -mb-3 group`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          <IconComponent size={20} className={iconColor} />
        </div>
        <span className={`text-[17px] font-medium tracking-tight ${titleText}`}>
          {title}
        </span>
      </div>
      <span className="material-symbols-outlined opacity-90 transition-transform group-hover:translate-x-0.5">
        chevron_right
      </span>
    </div>
  );
}
