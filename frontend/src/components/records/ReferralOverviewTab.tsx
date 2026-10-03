import React from 'react';
import { motion } from 'motion/react';
import { DetailsSection } from '../common/DetailsPanel';
import { GroupedInfoList } from '../common/GroupedInfoList';
import { AttachmentList, Attachment } from '../common/AttachmentList';
import { Quote } from 'lucide-react';
import { STATUS_STYLES, STATUS_LABELS } from '../../config/styleConstants';
import { Referral, ReferralDetails } from '../../types';
import { useDetails } from '../../contexts/DetailsContext';
import { useAttachmentActions } from '../../hooks/useAttachmentActions';
import { ReferralStatusCard } from './ReferralStatusCard';

interface ReferralOverviewTabProps {
  referral: Referral;
  referralDetails: ReferralDetails;
  onNavigateToTracker?: () => void;
}

export function ReferralOverviewTab({ referral, referralDetails, onNavigateToTracker }: ReferralOverviewTabProps) {
  const { isFullScreen } = useDetails();
  const { previewAttachment, downloadAttachment, loadingFileId } = useAttachmentActions();

  const displayStatus = referral.displayStatus || referral.status;
  // Steps will be loaded in the tracker tab; overview tab no longer depends on it
  const activeStep = null; // Removed activeStep logic for overview as it's separate now

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      {referral.status !== 'DRAFT' && (
        <ReferralStatusCard 
          status={displayStatus || referral.status}
          onClick={onNavigateToTracker} 
        />
      )}

      <DetailsSection title="分诊基本信息" className="border-t-0 pt-0 mt-0">
        <div className="flex flex-col gap-3">
          {/* 3-Column Metrics Grid */}
          {referralDetails.triageInfo && (
            <GroupedInfoList
              items={[
                {
                  id: 'firstVisit',
                  icon: 'person_add',
                  label: '是否初诊',
                  value: referralDetails.triageInfo.isFirstVisit ? '是' : '否',
                  valueClassName: referralDetails.triageInfo.isFirstVisit 
                    ? 'text-[var(--md-sys-color-on-surface)]' 
                    : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'
                },
                {
                  id: 'medicated',
                  icon: 'medication',
                  label: '是否服药',
                  value: referralDetails.triageInfo.isMedicated ? '是' : '否',
                  valueClassName: referralDetails.triageInfo.isMedicated 
                    ? 'text-[var(--md-sys-color-on-surface)]' 
                    : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'
                },
                {
                  id: 'priorTherapy',
                  icon: 'monitoring',
                  label: '心理治疗',
                  value: referralDetails.triageInfo.priorTherapy || '无',
                  valueClassName: referralDetails.triageInfo.priorTherapy === '无' 
                    ? 'text-[var(--md-sys-color-on-surface-variant)] opacity-70' 
                    : 'text-[var(--md-sys-color-on-surface)] truncate'
                }
              ]}
              layout="horizontal"
            />
          )}

          {/* 3-Column Risk Grid */}
          {referralDetails.riskAssessment && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <GroupedInfoList
                items={[
                  {
                    id: 'ideation',
                    icon: 'psychology',
                    label: '自杀意念',
                    value: referralDetails.riskAssessment.ideation ? '是' : '否',
                    className: referralDetails.riskAssessment.ideation ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]' : '',
                    iconClassName: referralDetails.riskAssessment.ideation ? 'text-[var(--md-sys-color-on-error-container)]' : 'text-[var(--md-sys-color-on-surface-variant)]',
                    labelClassName: referralDetails.riskAssessment.ideation ? 'text-[var(--md-sys-color-on-error-container)] opacity-90' : 'text-[var(--md-sys-color-on-surface-variant)]',
                    valueClassName: referralDetails.riskAssessment.ideation 
                      ? 'font-bold text-[var(--md-sys-color-on-error-container)]' 
                      : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'
                  },
                  {
                    id: 'attempt',
                    icon: 'personal_injury',
                    label: '自杀企图',
                    value: referralDetails.riskAssessment.attempt ? '是' : '否',
                    className: referralDetails.riskAssessment.attempt ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]' : '',
                    iconClassName: referralDetails.riskAssessment.attempt ? 'text-[var(--md-sys-color-on-error-container)]' : 'text-[var(--md-sys-color-on-surface-variant)]',
                    labelClassName: referralDetails.riskAssessment.attempt ? 'text-[var(--md-sys-color-on-error-container)] opacity-90' : 'text-[var(--md-sys-color-on-surface-variant)]',
                    valueClassName: referralDetails.riskAssessment.attempt 
                      ? 'font-bold text-[var(--md-sys-color-on-error-container)]' 
                      : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'
                  },
                  {
                    id: 'selfHarm',
                    icon: 'healing',
                    label: '自残行为',
                    value: referralDetails.riskAssessment.selfHarm ? '是' : '否',
                    className: referralDetails.riskAssessment.selfHarm ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]' : '',
                    iconClassName: referralDetails.riskAssessment.selfHarm ? 'text-[var(--md-sys-color-on-error-container)]' : 'text-[var(--md-sys-color-on-surface-variant)]',
                    labelClassName: referralDetails.riskAssessment.selfHarm ? 'text-[var(--md-sys-color-on-error-container)] opacity-90' : 'text-[var(--md-sys-color-on-surface-variant)]',
                    valueClassName: referralDetails.riskAssessment.selfHarm 
                      ? 'font-bold text-[var(--md-sys-color-on-error-container)]' 
                      : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'
                  }
                ]}
                layout="horizontal"
              />
            </div>
          )}

          {/* Referral Full Description Card (Watermarked elegant quote) */}
          <div className="relative p-6 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border-opacity-10 overflow-hidden flex flex-col gap-3">
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
              {referralDetails.triageInfo?.fullDescription || referral.description}
            </p>

            {/* Large elegant watermark quote mark */}
            <Quote className="absolute top-6 right-6 text-[var(--md-sys-color-primary)] opacity-10" size={30} />
          </div>

          {/* Attachment List */}
          <AttachmentList
            attachments={referralDetails.attachments || referral.attachments || []}
            title="转诊附件"
            loadingFileId={loadingFileId}
            onPreview={(file) => {
              if (file.fileId && referral.id) {
                previewAttachment({
                  referralId: referral.id,
                  fileId: file.fileId,
                  name: file.name,
                });
              }
            }}
            onDownload={(file) => {
              if (file.fileId && referral.id) {
                downloadAttachment({
                  referralId: referral.id,
                  fileId: file.fileId,
                  name: file.name,
                });
              }
            }}
          />
        </div>
      </DetailsSection>
    </motion.div>
  );
}
