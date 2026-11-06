/**
 * Referral Card Component (Mobile MD3)
 * Displays referral overview with initiator/date header, title/description, and status/risk pills footer
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

  const initiatorName = referral.referredBy?.name?.trim();
  const initiatorInitial = initiatorName ? Array.from(initiatorName)[0] : '';
  const hasTopHeader = Boolean((initiatorName && initiatorInitial) || formattedDate);

  const handleStatusBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusClick?.(referral.status);
  };

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[var(--md-sys-color-surface-container-low)] p-4 transition-all duration-200 active:scale-[0.99] active:bg-[var(--md-sys-color-surface-container)]"
    >
      {/* Top Header: Initiator and Date separated by dot */}
      {hasTopHeader && (
        <div className="flex items-center gap-2 text-xs text-[var(--md-sys-color-outline)]">
          {initiatorName && initiatorInitial && (
            <span className="flex items-center gap-1.5">
              <span
                className="flex size-[18px] items-center justify-center rounded-full bg-[var(--md-sys-color-primary-container)] text-[10px] font-semibold text-[var(--md-sys-color-on-primary-container)] shrink-0 select-none"
                aria-hidden="true"
              >
                {initiatorInitial}
              </span>
              <span>{initiatorName}</span>
            </span>
          )}
          {initiatorName && initiatorInitial && formattedDate && (
            <span className="opacity-60" aria-hidden="true">
              ·
            </span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      )}

      {/* Main Content: Title & Description */}
      <div className={hasTopHeader ? 'mt-4' : ''}>
        <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)] line-clamp-1">
          {referral.title}
        </h3>
        {referral.description && (
          <p className="mt-1.5 text-sm text-[var(--md-sys-color-on-surface-variant)] line-clamp-2 leading-relaxed">
            {referral.description}
          </p>
        )}
      </div>

      {/* Bottom Footer: Type, Risk, and Status Badges */}
      <div className="mt-4 flex items-center gap-1.5 flex-wrap">
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
        <button
          type="button"
          onClick={handleStatusBadgeClick}
          title="点击查看进度与详情"
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-opacity active:opacity-75 ${statusClass}`}
        >
          {statusLabel}
        </button>
      </div>
    </div>
  );
};
