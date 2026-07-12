import React from 'react';
import {
  Check,
  X,
  Info,
  GraduationCap,
  Users,
  Building2,
  Stethoscope,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { ReferralStep, ReferralStepStatus, ReferralStepType } from '../../types';
import { formatDateToChinese } from '../../utils/dateUtils';

const getCardStyles = (status: ReferralStepStatus) => {
  switch (status) {
    case 'completed':
      return {
        bg: "bg-[var(--md-sys-color-surface-container-low)]",
        titleText: "text-[var(--md-sys-color-on-surface-variant)] line-through decoration-[var(--md-sys-color-on-surface-variant)]/40",
        subText: "text-[var(--md-sys-color-on-surface-variant)] opacity-70",
        timeText: "text-[var(--md-sys-color-on-surface-variant)] opacity-70"
      };
    case 'issue':
      return {
        bg: "bg-[var(--md-sys-color-error-container)]/20",
        titleText: "text-[var(--md-sys-color-on-error-container)] line-through decoration-[var(--md-sys-color-on-error-container)]/40",
        subText: "text-[var(--md-sys-color-on-error-container)] opacity-80",
        timeText: "text-[var(--md-sys-color-on-error-container)] opacity-80"
      };
    case 'active':
      return {
        bg: "bg-[var(--md-sys-color-primary-container)]",
        titleText: "text-[var(--md-sys-color-on-primary-container)] font-bold",
        subText: "text-[var(--md-sys-color-on-primary-container)] opacity-90",
        timeText: "text-[var(--md-sys-color-on-primary-container)] font-semibold"
      };
    case 'pending':
    default:
      return {
        bg: "bg-[var(--md-sys-color-surface)] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-[var(--md-sys-color-outline-variant)]",
        titleText: "text-[var(--md-sys-color-on-surface)]",
        subText: "text-[var(--md-sys-color-on-surface-variant)]",
        timeText: "text-[var(--md-sys-color-on-surface)] font-medium"
      };
  }
};

export const getIconForType = (type: ReferralStepType) => {
  switch (type) {
    case 'initiation': return GraduationCap;
    case 'review': return Users;
    case 'triage': return Building2;
    case 'scheduling': return Calendar;
    case 'evaluation': return Stethoscope;
    case 'feedback': return MessageSquare;
    default: return null;
  }
};

export const getStepTitle = (type: ReferralStepType) => {
  switch (type) {
    case 'initiation': return '发起转诊';
    case 'review': return '转诊审核';
    case 'triage': return '分诊评估';
    case 'scheduling': return '预约安排';
    case 'evaluation': return '医生评估';
    case 'feedback': return '反馈跟进';
    default: return '未知步骤';
  }
};

export const getStepSubtitle = (type: ReferralStepType, status: ReferralStepStatus) => {
  if (status === 'pending') {
    return '等待进行';
  }
  
  if (status === 'issue') {
    return '出现问题';
  }

  switch (type) {
    case 'initiation': 
      return status === 'completed' ? '转诊已发起' : '草稿';
    case 'review': 
      return status === 'active' ? '等待院级审批' : '审批已完成';
    case 'triage': 
      return status === 'active' ? '等待分诊安排' : '分诊已完成';
    case 'scheduling': 
      return status === 'active' ? '等待预约确认' : '预约已安排';
    case 'evaluation': 
      return status === 'active' ? '等待医生评估' : '评估已完成';
    case 'feedback': 
      return status === 'active' ? '等待反馈填写' : '反馈已完成';
    default: 
      return '';
  }
};

const getIconStyles = (status: ReferralStepStatus) => {
  if (status === 'issue') {
    return {
      color: "text-[var(--md-sys-color-error)]",
      bg: "bg-[var(--md-sys-color-error-container)]"
    };
  }
  if (status === 'active') {
    return {
      color: "text-[var(--md-sys-color-on-primary)]",
      bg: "bg-[var(--md-sys-color-primary)]"
    };
  }
  return {
    color: "text-[var(--md-sys-color-secondary)]",
    bg: "bg-[var(--md-sys-color-secondary-container)]"
  };
};

interface ReferralTrackerProps {
  steps: ReferralStep[];
}

export function ReferralTracker({ steps }: ReferralTrackerProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="flex justify-center p-8 text-[var(--md-sys-color-on-surface-variant)]">
        暂无进度数据
      </div>
    );
  }

  return (
    <div className="flex justify-center font-sans">
      <div className="w-full relative">
        <div className="flex flex-col gap-4 relative">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const styles = getCardStyles(step.status);
            const IconComponent = getIconForType(step.type);
            const iconStyles = getIconStyles(step.status);

            const nextStep = steps[index + 1];
            const prevStep = steps[index - 1];

            const getLineColor = (s1: ReferralStep, s2: ReferralStep) => {
              if (!s1 || !s2) return "bg-[var(--md-sys-color-outline-variant)]";
              if (s1.status === 'completed' && (s2.status === 'completed' || s2.status === 'active')) {
                return "bg-[var(--md-sys-color-primary)]";
              }
              if ((s1.status === 'completed' || s1.status === 'active') && s2.status === 'issue') {
                return "bg-[var(--md-sys-color-error)]";
              }
              return "bg-[var(--md-sys-color-outline-variant)]";
            };

            const bottomLineColor = getLineColor(step, nextStep);
            const topLineColor = prevStep ? getLineColor(prevStep, step) : '';

            return (
              <div key={step.id} className="flex items-stretch gap-6 relative group z-10">

                {/* Left Side: The Card */}
                <div className={`flex-1 ${(step.status === 'active' || step.status === 'issue') ? 'rounded-[30px]' : 'rounded-[22px]'} p-5 pl-6 pr-5 flex items-start gap-4 transition-all duration-300 ${styles.bg}`}>

                  {/* Card Icon */}
                  {IconComponent && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconStyles.bg}`}>
                      <IconComponent size={20} className={iconStyles.color} />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-[17px] font-medium tracking-tight ${styles.titleText}`}>
                        {getStepTitle(step.type)}
                      </h3>
                      <span className={`text-[15px] whitespace-nowrap ${styles.timeText}`}>
                        {formatDateToChinese(step.time)}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Info size={14} className={`mt-0.5 shrink-0 ${styles.subText}`} />
                      <p className={`text-[13px] leading-relaxed ${styles.subText}`}>
                        {getStepSubtitle(step.type, step.status)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Timeline Track & Indicator */}
                <div className="w-8 flex flex-col items-center justify-center relative shrink-0">

                  {/* Top Line Segment */}
                  {index !== 0 && (
                    <div className={`absolute top-[-16px] bottom-1/2 left-1/2 -translate-x-1/2 w-[1.5px] z-0 ${topLineColor}`} />
                  )}

                  {/* Status Circle */}
                  <div className="relative z-10 flex items-center justify-center bg-[var(--md-sys-color-surface)]">
                    {step.status === 'completed' && (
                      <div className="w-[26px] h-[26px] rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    {step.status === 'issue' && (
                      <div className="w-[26px] h-[26px] rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] flex items-center justify-center shadow-sm">
                        <X size={14} strokeWidth={3} />
                      </div>
                    )}
                    {step.status === 'active' && (
                      <div className="w-[26px] h-[26px] rounded-full border-2 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface)] flex items-center justify-center">
                         <div className="w-2.5 h-2.5 rounded-full bg-[var(--md-sys-color-primary)] animate-pulse" />
                      </div>
                    )}
                    {step.status === 'pending' && (
                      <div className="w-[26px] h-[26px] rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-center">
                        {/* Empty inner circle matching the UI */}
                      </div>
                    )}
                  </div>

                  {/* Bottom Line Segment */}
                  {!isLast && (
                    <div className={`absolute top-1/2 bottom-[-16px] left-1/2 -translate-x-1/2 w-[1.5px] z-0 ${bottomLineColor}`} />
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
