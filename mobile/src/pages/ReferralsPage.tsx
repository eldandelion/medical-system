/**
 * Referrals Page (Mobile MD3)
 * Root page for "就医转诊" tab displaying segmented filter chips, referral cards, and full details modal
 */

import React from 'react';
import { useReferrals } from '../contexts/ReferralContext';
import { REFERRAL_FILTER_ITEMS, ReferralFilter } from '../utils/referralConstants';
import { getTargetTabForStatus } from '../utils/referralRouting';
import { SegmentedButton, PrimaryButton } from '../components/common/Buttons';
import { ReferralCard } from '../components/referrals/ReferralCard';
import { ReferralDetailsFullScreen } from '../components/referrals/ReferralDetailsFullScreen';

export const ReferralsPage: React.FC = () => {
  const {
    filteredReferrals,
    filter,
    setFilter,
    loading,
    error,
    refreshReferrals,
    isScrolled,
    selectedReferralId,
    setSelectedReferralId,
    activeDetailsTab,
    setActiveDetailsTab,
  } = useReferrals();

  const handleCardClick = (referralId: string) => {
    setSelectedReferralId(referralId);
    setActiveDetailsTab('overview');
  };

  const handleStatusBadgeClick = (referralId: string, status: string) => {
    setSelectedReferralId(referralId);
    setActiveDetailsTab(getTargetTabForStatus(status));
  };

  return (
    <>
      {/* Fullscreen Details Modal Takeover */}
      {selectedReferralId && (
        <ReferralDetailsFullScreen
          referralId={selectedReferralId}
          initialTab={activeDetailsTab}
          onClose={() => setSelectedReferralId(null)}
        />
      )}

      <div className="space-y-4">
        {/* Segmented Filter */}
        <div
          className={`-mx-4 sm:-mx-5 px-4 sm:px-5 pt-5 sm:pt-6 pb-3 bg-[var(--md-sys-color-surface)] flex justify-start transition-opacity duration-200 ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <SegmentedButton
            items={REFERRAL_FILTER_ITEMS}
            selectedValue={filter}
            onChange={(val) => setFilter(val as ReferralFilter)}
          />
        </div>

        {/* Referrals List Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <md-circular-progress indeterminate></md-circular-progress>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-3">
              加载转诊记录中...
            </span>
          </div>
        ) : error ? (
          <div className="p-6 text-center rounded-2xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
            <p className="text-sm font-medium">{error}</p>
            <div className="mt-3">
              <PrimaryButton label="重新加载" icon="refresh" onClick={refreshReferrals} />
            </div>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-[var(--md-sys-color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[48px] opacity-40">
              {filter === 'closed' ? 'inventory_2' : 'medical_services'}
            </span>
            <p className="text-sm mt-3 font-medium">
              {filter === 'in_progress'
                ? '暂无进行中的转诊'
                : filter === 'closed'
                ? '暂无已结案转诊'
                : '暂无转诊记录'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredReferrals.map((referral) => (
              <ReferralCard
                key={referral.id}
                referral={referral}
                onClick={() => handleCardClick(referral.id)}
                onStatusClick={(status) => handleStatusBadgeClick(referral.id, status)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
