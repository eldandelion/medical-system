import React from 'react';
import { motion } from 'motion/react';
import { DetailsSection, MetricCard } from '../common/DetailsPanel';
import { AttachmentList } from '../common/AttachmentList';
import { Quote } from 'lucide-react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';
import { STATUS_STYLES, STATUS_LABELS } from '../../config/styleConstants';
import { Referral } from '../../types';
import { useDetails } from '../../contexts/DetailsContext';
import { ReferralStatusCard } from './ReferralStatusCard';

interface ReferralOverviewTabProps {
  referral: Referral;
  extendedData: NonNullable<Referral['extendedData']>;
  onNavigateToTracker?: () => void;
}

export function ReferralOverviewTab({ referral, extendedData, onNavigateToTracker }: ReferralOverviewTabProps) {
  const { isFullScreen } = useDetails();

  const displayStatus = referral.displayStatus || referral.status;
  const steps = extendedData.steps || [];
  const activeStep = steps.find(s => s.status === 'active' || s.status === 'issue') || steps[steps.length - 1];

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      {referral.status !== 'Draft' && (
        <ReferralStatusCard 
          activeStep={activeStep} 
          onClick={onNavigateToTracker} 
        />
      )}

      <DetailsSection title="分诊基本信息" className="border-t-0 pt-0 mt-0">
        <div className="flex flex-col gap-6">
          {/* 3-Column Metrics Grid */}
          <div className={`grid grid-cols-3 gap-4 ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: "40" }}>
            <MetricCard
              label="是否初诊"
              icon="person_add"
              value={extendedData.triage.isFirstVisit ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>是
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[16px] font-bold">close</span>否
                </span>
              )}
            />

            <MetricCard
              label="是否服药"
              icon="medication"
              value={extendedData.triage.isMedicated ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>是
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[16px] font-bold">close</span>否
                </span>
              )}
            />

            <MetricCard
              label="心理治疗"
              icon="monitoring"
              value={extendedData.triage.priorTherapy === '无' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-[16px] font-bold">remove</span>无
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>{extendedData.triage.priorTherapy}
                </span>
              )}
            />
          </div>

          {/* 3-Column Risk Grid */}
          <div className={`grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: "40" }}>
            <MetricCard
              label="自杀意念"
              icon="psychology"
              className={extendedData.risk.ideation ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]" : ""}
              value={
                extendedData.risk.ideation ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                    <span className="material-symbols-outlined text-[16px] font-bold">error</span>是
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                    <span className="material-symbols-outlined text-[16px] font-bold">close</span>否
                  </span>
                )
              }
            />

            <MetricCard
              label="自杀企图"
              icon="personal_injury"
              className={extendedData.risk.attempt ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]" : ""}
              value={
                extendedData.risk.attempt ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                    <span className="material-symbols-outlined text-[16px] font-bold">error</span>是
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                    <span className="material-symbols-outlined text-[16px] font-bold">close</span>否
                  </span>
                )
              }
            />

            <MetricCard
              label="自残行为"
              icon="healing"
              className={extendedData.risk.selfHarm ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]" : ""}
              value={
                extendedData.risk.selfHarm ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                    <span className="material-symbols-outlined text-[16px] font-bold">error</span>是
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                    <span className="material-symbols-outlined text-[16px] font-bold">close</span>否
                  </span>
                )
              }
            />
          </div>

          {/* Referral Full Description Card (Watermarked elegant quote) */}
          <div className="relative p-6 rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border-opacity-10 overflow-hidden flex flex-col gap-3">
            {/* Referrer Pill */}
            <div className="flex items-center gap-1 pe-3  w-fit self-start rounded-full bg-transparent mt-1">
              <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-medium shrink-0 me-1">
                {referral.referredBy.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium leading-[1.2] text-[var(--md-sys-color-on-surface)]">{referral.referredBy.name}</span>
                <span className="text-[11px] font-normal leading-[1.2] text-[var(--md-sys-color-on-surface-variant)] opacity-80">转诊发起人</span>
              </div>
            </div>
            <span className="text-[16px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-85 mt-4">转诊详细说明</span>
            <p className="text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] font-normal z-10 pr-6">
              {extendedData.triage.fullDescription}
            </p>

            {/* Large elegant watermark quote mark */}
            <Quote className="absolute top-6 right-6 text-[var(--md-sys-color-primary)] opacity-10" size={30} />
          </div>

          {/* Attachment List */}
          <AttachmentList
            attachments={extendedData.feedback?.attachments || []}
            title="转诊附件"
          />
        </div>
      </DetailsSection>
    </motion.div>
  );
}
