/**
 * Referral Feedback Tab (Mobile MD3)
 * Displays doctor consultation summary, follow-up plan, and doctor attachments
 */

import React from 'react';
import { FeedbackDto } from '../../api/intakeApi';

export interface ReferralFeedbackTabProps {
  feedback?: FeedbackDto | null;
}

export const ReferralFeedbackTab: React.FC<ReferralFeedbackTabProps> = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--md-sys-color-outline-variant)] p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-[var(--md-sys-color-outline)]">
          pending_actions
        </span>
        <h4 className="mt-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
          暂无反馈数据
        </h4>
        <p className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          接诊医生尚未提交就医诊疗反馈，问诊完成后将在此同步诊断结果与随访方案。
        </p>
      </div>
    );
  }

  const attachments = feedback.attachments || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Hospital Diagnosis Result */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
          医院诊断结果
        </h4>
        <div className="mt-2 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] p-4 border border-[var(--md-sys-color-outline-variant)]/60">
          <p className="text-sm leading-relaxed text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap">
            {feedback.summary || '暂无诊断摘要'}
          </p>
        </div>
      </div>

      {/* Follow-up Plan */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-tertiary)] flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">repeat</span>
          <span>随访计划</span>
        </h4>
        <div className="mt-2 rounded-2xl border-l-4 border-[var(--md-sys-color-tertiary)] bg-[var(--md-sys-color-tertiary-container)]/30 p-4">
          <p className="text-sm font-medium leading-relaxed text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap">
            {feedback.followUp || '暂无随访计划'}
          </p>
        </div>
      </div>

      {/* Doctor Attachments */}
      {attachments.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-outline)]">
            医疗报告附件 ({attachments.length})
          </h4>
          <div className="mt-2 flex flex-col gap-2">
            {attachments.map((att, idx) => (
              <div
                key={att.fileId ?? `${att.name}-${idx}`}
                className="flex items-center justify-between rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)] shrink-0">
                    description
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                      {att.name}
                    </p>
                    {att.size && (
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        {att.size}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
