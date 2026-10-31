/**
 * Referral Details FullScreen Component (Mobile MD3)
 * Fullscreen modal takeover with sticky top bar, status badge routing, and tabbed presenters
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  intakeApi,
  ReferralDetailsDto,
  ReferralTrackingDto,
  ReferralStatus,
} from '../../api/intakeApi';
import {
  STATUS_LABELS,
  STATUS_STYLES,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_STYLES,
} from '../../utils/referralConstants';
import {
  getTargetTabForStatus,
  ReferralDetailsTab,
} from '../../utils/referralRouting';
import { enrichReferralStatus } from '../../utils/referralStatusEnricher';
import { ReferralOverviewTab } from './ReferralOverviewTab';
import { ReferralTrackerTab } from './ReferralTrackerTab';
import { ReferralFeedbackTab } from './ReferralFeedbackTab';

export interface ReferralDetailsFullScreenProps {
  referralId: string;
  initialTab?: ReferralDetailsTab;
  onClose: () => void;
}

export const ReferralDetailsFullScreen: React.FC<ReferralDetailsFullScreenProps> = ({
  referralId,
  initialTab = 'overview',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ReferralDetailsTab>(initialTab);
  const [details, setDetails] = useState<ReferralDetailsDto | null>(null);
  const [tracking, setTracking] = useState<ReferralTrackingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [detailsData, trackingData] = await Promise.all([
        intakeApi.getReferralDetails(referralId),
        intakeApi.getReferralTracking(referralId).catch(() => null),
      ]);
      setDetails(detailsData);
      setTracking(trackingData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载转诊详情失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [referralId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive enriched status using steps and appointment timeline
  const enrichedStatus = useMemo<ReferralStatus | string>(() => {
    if (!details?.baseInfo) return 'AWAITING_TRIAGE';
    const enriched = enrichReferralStatus(
      details.baseInfo,
      tracking?.steps,
      tracking?.destination?.appointmentTime
    );
    return enriched.displayStatus;
  }, [details, tracking]);

  const handleStatusBadgeClick = () => {
    const target = getTargetTabForStatus(enrichedStatus, Boolean(details?.feedback));
    setActiveTab(target);
  };

  const statusLabel = STATUS_LABELS[enrichedStatus] || enrichedStatus;
  const statusClass = STATUS_STYLES[enrichedStatus] || STATUS_STYLES.default;

  const riskLevel = details?.baseInfo?.riskLevel;
  const riskLabel = riskLevel ? RISK_LEVEL_LABELS[riskLevel] || riskLevel : null;
  const riskClass = riskLevel ? RISK_LEVEL_STYLES[riskLevel] || RISK_LEVEL_STYLES.default : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="转诊详情"
      className="fixed inset-0 z-50 flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
    >
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-10 flex flex-col border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] shadow-xs">
        <div className="flex h-14 items-center justify-between px-3 gap-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="返回"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface)] transition-colors active:bg-[var(--md-sys-color-surface-container-high)]"
          >
            <span className="material-symbols-rounded text-[22px]">arrow_back</span>
          </button>

          {/* Title Area */}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold leading-tight text-[var(--md-sys-color-on-surface)] truncate">
              {details?.baseInfo?.title || '转诊详情'}
            </h2>
            {details?.baseInfo?.studentName && (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                {details.baseInfo.studentName} ({details.baseInfo.studentNumber})
              </p>
            )}
          </div>

          {/* Header Action Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {riskLabel && (
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${riskClass}`}>
                {riskLabel}
              </span>
            )}
            <button
              type="button"
              data-testid="details-status-badge"
              onClick={handleStatusBadgeClick}
              title="点击跳转对应进度/反馈"
              className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity active:opacity-75 ${statusClass}`}
            >
              <span>{statusLabel}</span>
              <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Segment */}
        <div className="flex border-t border-[var(--md-sys-color-outline-variant)]/60 px-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)]'
                : 'border-transparent text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            转诊概览
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tracker'}
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'tracker'
                ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)]'
                : 'border-transparent text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            转诊进度
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'feedback'}
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 py-2.5 text-center text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'feedback'
                ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)]'
                : 'border-transparent text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            诊疗反馈
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-32 rounded-2xl bg-[var(--md-sys-color-surface-container)]" />
            <div className="h-44 rounded-2xl bg-[var(--md-sys-color-surface-container)]" />
          </div>
        ) : error || !details ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <span className="material-symbols-rounded text-[40px] text-[var(--md-sys-color-error)]">
              error_outline
            </span>
            <p className="mt-2 text-sm text-[var(--md-sys-color-error)]">
              {error || '未找到转诊记录详情'}
            </p>
            <button
              type="button"
              onClick={loadData}
              className="mt-4 rounded-xl bg-[var(--md-sys-color-primary)] px-4 py-2 text-xs font-semibold text-[var(--md-sys-color-on-primary)]"
            >
              重新加载
            </button>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && <ReferralOverviewTab details={details} />}
            {activeTab === 'tracker' && (
              <ReferralTrackerTab tracking={tracking} loading={false} />
            )}
            {activeTab === 'feedback' && (
              <ReferralFeedbackTab feedback={details.feedback} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
