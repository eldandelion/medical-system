/**
 * Referral Card Component (Mobile MD3)
 * Displays referral overview with status pill, risk badge, title, initiator, and date
 */

import React from 'react';
import { ReferralDto, ReferralStatus } from '../../api/intakeApi';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_STYLES,
  REFERRAL_TYPE_LABELS,
} from '../../utils/referralConstants';

export interface ReferralCardProps {
  referral: ReferralDto;
  onClick?: () => void;
  onStatusClick?: (status: ReferralStatus | string) => void;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({
  referral,
  onClick,
  onStatusClick,
}) => {
  const statusLabel = STATUS_LABELS[referral.status] || referral.status;
  const statusClass =
    STATUS_STYLES[referral.status] || STATUS_STYLES.default;

  const riskLabel = RISK_LEVEL_LABELS[referral.riskLevel] || referral.riskLevel;
  const riskClass =
    RISK_LEVEL_STYLES[referral.riskLevel] || RISK_LEVEL_STYLES.default;

  const typeLabel =
    REFERRAL_TYPE_LABELS[referral.type] || referral.type;

  const formattedDate = referral.date
    ? referral.date.replace('T', ' ').substring(0, 16)
    : '';

  const handleStatusBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusClick?.(referral.status);
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-4 shadow-sm transition-all duration-200 active:scale-[0.99] active:bg-[var(--md-sys-color-surface-container)]"
    >
      {/* Top Header: Type & Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="rounded-md bg-[var(--md-sys-color-surface-container-high)] px-2 py-0.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
            {typeLabel}
          </span>
          {referral.riskLevel && (
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${riskClass}`}
            >
              {riskLabel}
            </span>
          )}
        </div>

        {/* Clickable Status Badge with direct navigation affordance */}
        <button
          type="button"
          onClick={handleStatusBadgeClick}
          title="点击查看进度与详情"
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity active:opacity-75 ${statusClass}`}
        >
          <span>{statusLabel}</span>
          <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Main Content: Title & Description */}
      <div className="mt-3">
        <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)] line-clamp-1">
          {referral.title}
        </h3>
        {referral.description && (
          <p className="mt-1 text-sm text-[var(--md-sys-color-on-surface-variant)] line-clamp-2 leading-relaxed">
            {referral.description}
          </p>
        )}
      </div>

      {/* Bottom Footer: Initiator, Date, Drilldown affordance */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--md-sys-color-outline-variant)]/60 pt-3 text-xs text-[var(--md-sys-color-outline)]">
        <div className="flex items-center gap-3">
          {referral.referredBy?.name && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-rounded text-[14px]">person</span>
              <span>发起: {referral.referredBy.name}</span>
            </span>
          )}
          {formattedDate && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-rounded text-[14px]">schedule</span>
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        <span className="material-symbols-rounded text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
          chevron_right
        </span>
      </div>
    </div>
  );
};
