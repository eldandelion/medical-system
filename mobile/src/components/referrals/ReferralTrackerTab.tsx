/**
 * Referral Tracker Tab (Mobile MD3)
 * Displays 6-step timeline tracker, destination route card, and appointment card
 */

import React from 'react';
import { ReferralTrackingDto, ReferralStepDto } from '../../api/intakeApi';
import { TRACKER_STEPS_CONFIG } from '../../utils/referralConstants';

export interface ReferralTrackerTabProps {
  tracking: ReferralTrackingDto | null;
  loading?: boolean;
}

const STEP_SUBTITLES: Record<string, { active: string; completed: string }> = {
  INITIATION: { active: '转诊发起中', completed: '转诊已发起' },
  REVIEW: { active: '等待院级初审', completed: '初审已通过' },
  TRIAGE: { active: '等待中心分诊', completed: '分诊已完成' },
  SCHEDULING: { active: '等待医院排诊', completed: '排诊已完成' },
  EVALUATION: { active: '等待就医问诊', completed: '问诊已完成' },
  FEEDBACK: { active: '等待诊疗反馈', completed: '反馈已录入' },
};

export const ReferralTrackerTab: React.FC<ReferralTrackerTabProps> = ({
  tracking,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-64 rounded-2xl bg-[var(--md-sys-color-surface-container)]" />
        <div className="h-44 rounded-2xl bg-[var(--md-sys-color-surface-container)]" />
      </div>
    );
  }

  const rawSteps = tracking?.steps || [];
  const destination = tracking?.destination;

  // Build full 6-step timeline matching desktop
  const steps: ReferralStepDto[] = TRACKER_STEPS_CONFIG.map((cfg) => {
    const existing = rawSteps.find((s) => s.type === cfg.type);
    if (existing) {
      return existing;
    }
    return {
      id: cfg.type,
      type: cfg.type,
      time: '',
      status: 'PENDING',
    };
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 6-Step Timeline Process Section */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
          转诊全流程进展
        </h4>

        <div className="mt-3 relative pl-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--md-sys-color-outline-variant)]">
          {steps.map((step) => {
            const config = TRACKER_STEPS_CONFIG.find((c) => c.type === step.type) || {
              type: step.type,
              title: step.type,
              icon: 'circle',
            };

            const isCompleted = step.status === 'COMPLETED';
            const isActive = step.status === 'ACTIVE';
            const isIssue = step.status === 'ISSUE';

            let dotClasses =
              'border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-outline)]';
            let cardClasses =
              'border border-[var(--md-sys-color-outline-variant)]/40 bg-[var(--md-sys-color-surface-container-low)]';
            let subtitle = '等待进行';

            if (isCompleted) {
              dotClasses =
                'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]';
              cardClasses =
                'border-transparent bg-[var(--md-sys-color-surface-container)] opacity-90';
              subtitle = STEP_SUBTITLES[step.type]?.completed || '已完成';
            } else if (isActive) {
              dotClasses =
                'bg-[var(--md-sys-color-tertiary)] text-[var(--md-sys-color-on-tertiary)] ring-4 ring-[var(--md-sys-color-tertiary-container)]';
              cardClasses =
                'border-2 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-high)] shadow-sm';
              subtitle = STEP_SUBTITLES[step.type]?.active || '处理中';
            } else if (isIssue) {
              dotClasses =
                'bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)]';
              cardClasses =
                'border border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)]/30';
              subtitle = step.reason || '流程遇阻';
            }

            return (
              <div key={step.type} className="relative pb-5 last:pb-0">
                {/* Step Node Dot */}
                <div
                  className={`absolute -left-6 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${dotClasses}`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-rounded text-[14px]">check</span>
                  ) : isIssue ? (
                    <span className="material-symbols-rounded text-[14px]">close</span>
                  ) : (
                    <span className="material-symbols-rounded text-[14px]">{config.icon}</span>
                  )}
                </div>

                {/* Step Card */}
                <div className={`rounded-xl p-3 ${cardClasses}`}>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isActive
                          ? 'text-[var(--md-sys-color-primary)]'
                          : 'text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {config.title}
                    </span>
                    {step.time && (
                      <span className="text-xs text-[var(--md-sys-color-outline)]">
                        {step.time}
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-0.5 text-xs ${
                      isActive
                        ? 'font-medium text-[var(--md-sys-color-on-surface)]'
                        : isIssue
                        ? 'font-medium text-[var(--md-sys-color-error)]'
                        : 'text-[var(--md-sys-color-on-surface-variant)]'
                    }`}
                  >
                    {subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Destination Card (转诊去向) */}
      {destination && (
        <div className="rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              <span className="material-symbols-rounded text-[18px]">output_circle</span>
              <span>转诊去向</span>
            </div>
            <span className="rounded-full bg-[var(--md-sys-color-secondary-container)] px-2 py-0.5 text-[11px] font-semibold text-[var(--md-sys-color-on-secondary-container)]">
              活跃路由
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/40 pb-2">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">接收医院</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                {destination.hospital || '暂无数据'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/40 pb-2">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">接收科室</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                {destination.department || '暂无数据'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/40 pb-2">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">接诊医生</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                {destination.doctor || '暂无数据'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--md-sys-color-outline-variant)]/40 pb-2">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">分诊管理员</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                {destination.admin || '暂无数据'}
              </span>
            </div>
            {destination.transferDate && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">转诊日期</span>
                <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                  {destination.transferDate}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Card (就诊预约) */}
      {destination?.appointmentTime && (
        <div className="rounded-2xl bg-[var(--md-sys-color-primary-container)] p-4 text-[var(--md-sys-color-on-primary-container)] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-rounded text-[18px]">event_available</span>
              <span>就诊预约</span>
            </div>
            <span className="rounded-full bg-[var(--md-sys-color-primary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--md-sys-color-on-primary)]">
              已预约
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]">
              <span className="material-symbols-rounded text-[20px]">calendar_clock</span>
            </div>
            <div>
              <p className="text-xs opacity-80">预约时间</p>
              <p className="text-base font-bold">{destination.appointmentTime}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
