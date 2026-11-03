/**
 * Referral Details FullScreen Component (Mobile MD3)
 * Ported layout matching the main medical system ReferralDetailsView:
 * Header with avatar, student name & student number, status & risk badges,
 * SecondaryTabs with native M3 tabs and icons, and animated tab presenters.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  intakeApi,
  ReferralDetailsDto,
  ReferralTrackingDto,
  ReferralStatus,
} from '../../api/intakeApi';
import {
  STATUS_LABELS,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_STYLES,
} from '../../utils/referralConstants';
import {
  getTargetTabForStatus,
  ReferralDetailsTab,
} from '../../utils/referralRouting';
import { enrichReferralStatus } from '../../utils/referralStatusEnricher';
import { SecondaryTabs, TabItem } from '../common/Tabs';
import { ReferralOverviewTab } from './ReferralOverviewTab';
import { ReferralTrackerTab } from './ReferralTrackerTab';
import { ReferralFeedbackTab } from './ReferralFeedbackTab';

export interface ReferralDetailsFullScreenProps {
  referralId: string;
  initialTab?: ReferralDetailsTab;
  onClose: () => void;
}

export const REFERRAL_DETAILS_TABS: TabItem[] = [
  { id: 'overview', label: '转诊概览', icon: 'clinical_notes' },
  { id: 'tracker', label: '转诊进度', icon: 'timeline' },
  { id: 'feedback', label: '诊疗反馈', icon: 'history_edu' },
];

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
    if (!details?.baseInfo) return loading ? '' : 'AWAITING_TRIAGE';
    const enriched = enrichReferralStatus(
      details.baseInfo,
      tracking?.steps,
      tracking?.destination?.appointmentTime
    );
    return enriched.displayStatus;
  }, [details, tracking, loading]);

  const handleStatusBadgeClick = () => {
    if (!enrichedStatus) return;
    const target = getTargetTabForStatus(enrichedStatus, Boolean(details?.feedback));
    setActiveTab(target);
  };

  const statusLabel = enrichedStatus ? (STATUS_LABELS[enrichedStatus] || enrichedStatus) : (loading ? '加载中...' : '');
  const riskLevel = details?.baseInfo?.riskLevel;
  const riskLabel = riskLevel ? RISK_LEVEL_LABELS[riskLevel] || riskLevel : null;
  const riskClass = riskLevel ? RISK_LEVEL_STYLES[riskLevel] || RISK_LEVEL_STYLES.default : '';

  const studentName = details?.baseInfo?.studentName || '转诊详情';
  const studentInitial = studentName ? Array.from(studentName.trim())[0] : '?';
  const studentNumber =
    details?.baseInfo?.studentNumber ||
    details?.studentDemographics?.studentId ||
    'N/A';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="转诊详情"
      className="fixed inset-0 z-50 flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
    >
      {/* Top Header matching desktop ReferralDetailsView header */}
      <header className="sticky top-0 z-30 flex flex-col border-b border-[var(--md-sys-color-outline-variant)]/40 bg-[var(--md-sys-color-surface)] shadow-xs pt-[env(safe-area-inset-top,0px)]">
        <div className="flex h-14 items-center justify-between px-3 gap-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="返回"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface)] transition-colors active:bg-[var(--md-sys-color-surface-container-high)] shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>

          {/* Student Avatar */}
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0">
            {studentInitial}
          </div>

          {/* Title Area */}
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold leading-tight text-[var(--md-sys-color-on-surface)] truncate">
              {studentName}
            </h2>
            <p className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight font-mono">
              {studentNumber}
            </p>
          </div>

          {/* Header Action Badges matching desktop ReferralHeaderBadges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="details-status-badge"
              onClick={handleStatusBadgeClick}
              title="点击查看转诊进度"
              aria-label={`转诊状态：${statusLabel}，点击查看转诊进度`}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-[0.5px] shrink-0 whitespace-nowrap bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-[0.98] cursor-pointer transition-all border-0 outline-none"
            >
              {statusLabel}
            </button>
            {riskLabel && (
              <div
                className={`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${riskClass}`}
              >
                <span>{riskLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Tabs using native MD3 secondary tabs */}
        <SecondaryTabs
          tabs={REFERRAL_DETAILS_TABS}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as ReferralDetailsTab)}
        />
      </header>

      {/* Main Body with AnimatePresence */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
        {loading ? (
          <div className="flex flex-col gap-6 animate-pulse p-2 pt-6">
            <div className="h-40 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
            <div className="h-64 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
            <div className="h-32 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
          </div>
        ) : error || !details ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-[var(--md-sys-color-error)]">
              error_outline
            </span>
            <p className="mt-2 text-sm text-[var(--md-sys-color-error)]">
              {error || '未找到转诊记录详情'}
            </p>
            <button
              type="button"
              onClick={loadData}
              className="mt-4 rounded-xl bg-[var(--md-sys-color-primary)] px-4 py-2 text-xs font-semibold text-[var(--md-sys-color-on-primary)] cursor-pointer"
            >
              重新加载
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <ReferralOverviewTab details={details} referral={details.baseInfo} />
            )}
            {activeTab === 'tracker' && (
              <ReferralTrackerTab tracking={tracking} loading={false} />
            )}
            {activeTab === 'feedback' && (
              <ReferralFeedbackTab feedback={details.feedback} />
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};
