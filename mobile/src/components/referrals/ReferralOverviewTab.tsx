/**
 * Referral Overview Tab (Mobile MD3)
 * Displays 3-column triage metrics, 3-column severe risk indicators, full description quote, and attachments
 */

import React from 'react';
import { ReferralDetailsDto } from '../../api/intakeApi';

export interface ReferralOverviewTabProps {
  details: ReferralDetailsDto;
}

export const ReferralOverviewTab: React.FC<ReferralOverviewTabProps> = ({ details }) => {
  const triage = details.triageInfo;
  const risk = details.riskAssessment;
  const attachments = details.attachments || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Triage Metrics (3 Column Grid) */}
      {triage && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
            分诊基本信息
          </h4>
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            <div className="flex flex-col items-center justify-center rounded-xl bg-[var(--md-sys-color-surface-container)] p-3 text-center">
              <span className="material-symbols-rounded text-[20px] text-[var(--md-sys-color-primary)]">
                person_add
              </span>
              <span className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                是否初诊
              </span>
              <span className="mt-0.5 text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                {triage.isFirstVisit ? '是' : '否'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl bg-[var(--md-sys-color-surface-container)] p-3 text-center">
              <span className="material-symbols-rounded text-[20px] text-[var(--md-sys-color-primary)]">
                medication
              </span>
              <span className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                是否服药
              </span>
              <span className="mt-0.5 text-sm font-bold text-[var(--md-sys-color-on-surface)]">
                {triage.isMedicated ? '是' : '否'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl bg-[var(--md-sys-color-surface-container)] p-3 text-center">
              <span className="material-symbols-rounded text-[20px] text-[var(--md-sys-color-primary)]">
                monitoring
              </span>
              <span className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                心理治疗
              </span>
              <span className="mt-0.5 text-sm font-bold text-[var(--md-sys-color-on-surface)] truncate max-w-full">
                {triage.priorTherapy || '无'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Severe Risk Indicators (3 Column Grid) */}
      {risk && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-error)]">
            重点风险筛查
          </h4>
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            <div
              className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-colors ${
                risk.ideation
                  ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className="material-symbols-rounded text-[20px]">psychology</span>
              <span className="mt-1 text-xs">自杀意念</span>
              <span className="mt-0.5 text-sm font-bold">{risk.ideation ? '是' : '否'}</span>
            </div>

            <div
              className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-colors ${
                risk.attempt
                  ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className="material-symbols-rounded text-[20px]">personal_injury</span>
              <span className="mt-1 text-xs">自杀企图</span>
              <span className="mt-0.5 text-sm font-bold">{risk.attempt ? '是' : '否'}</span>
            </div>

            <div
              className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-colors ${
                risk.selfHarm
                  ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <span className="material-symbols-rounded text-[20px]">healing</span>
              <span className="mt-1 text-xs">自残行为</span>
              <span className="mt-0.5 text-sm font-bold">{risk.selfHarm ? '是' : '否'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Description / Referral Quote */}
      {triage?.fullDescription && (
        <div className="rounded-2xl border-l-4 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-low)] p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--md-sys-color-primary)]">
            <span className="material-symbols-rounded text-[16px]">format_quote</span>
            <span>转诊原因及详细主诉</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--md-sys-color-on-surface)] whitespace-pre-wrap">
            {triage.fullDescription}
          </p>
        </div>
      )}

      {/* Attachments Section */}
      {attachments.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-outline)]">
            附件资料 ({attachments.length})
          </h4>
          <div className="mt-2 flex flex-col gap-2">
            {attachments.map((att, idx) => (
              <div
                key={att.fileId ?? `${att.name}-${idx}`}
                className="flex items-center justify-between rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-3 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-rounded text-[20px] text-[var(--md-sys-color-primary)] shrink-0">
                    attachment
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
