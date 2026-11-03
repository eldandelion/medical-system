import React from 'react';
import { motion } from 'motion/react';
import { DetailsSection } from '../common/DetailsSection';
import { GroupedInfoList } from '../common/GroupedInfoList';
import { AttachmentList } from '../common/AttachmentList';
import { Quote } from 'lucide-react';
import { ReferralDetailsDto, ReferralDto } from '../../api/intakeApi';

export interface ReferralOverviewTabProps {
  details: ReferralDetailsDto;
  referral?: ReferralDto;
}

export const ReferralOverviewTab: React.FC<ReferralOverviewTabProps> = ({
  details,
  referral: customReferral,
}) => {
  const referral = customReferral || details.baseInfo;
  const initiatorName = referral?.referredBy?.name?.trim();
  const initiatorInitial = initiatorName ? Array.from(initiatorName)[0] : '';

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      <DetailsSection title="分诊基本信息" className="border-t-0 pt-0 mt-0">
        <div className="flex flex-col gap-3">
          {/* 3-Column Metrics Grid */}
          {details.triageInfo && (
            <GroupedInfoList
              items={[
                {
                  id: 'firstVisit',
                  icon: 'person_add',
                  label: '是否初诊',
                  value: details.triageInfo.isFirstVisit ? '是' : '否',
                  valueClassName: details.triageInfo.isFirstVisit
                    ? 'text-[var(--md-sys-color-on-surface)]'
                    : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70',
                },
                {
                  id: 'medicated',
                  icon: 'medication',
                  label: '是否服药',
                  value: details.triageInfo.isMedicated ? '是' : '否',
                  valueClassName: details.triageInfo.isMedicated
                    ? 'text-[var(--md-sys-color-on-surface)]'
                    : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70',
                },
                {
                  id: 'priorTherapy',
                  icon: 'monitoring',
                  label: '心理治疗',
                  value: details.triageInfo.priorTherapy || '无',
                  valueClassName:
                    details.triageInfo.priorTherapy === '无'
                      ? 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'
                      : 'text-[var(--md-sys-color-on-surface)] truncate',
                },
              ]}
              layout="horizontal"
            />
          )}

          {/* 3-Column Risk Grid */}
          {details.riskAssessment && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <GroupedInfoList
                items={[
                  {
                    id: 'ideation',
                    icon: 'psychology',
                    label: '自杀意念',
                    value: details.riskAssessment.ideation ? '是' : '否',
                    className: details.riskAssessment.ideation
                      ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                      : '',
                    iconClassName: details.riskAssessment.ideation
                      ? 'text-[var(--md-sys-color-on-error-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)]',
                    labelClassName: details.riskAssessment.ideation
                      ? 'text-[var(--md-sys-color-on-error-container)] opacity-90'
                      : 'text-[var(--md-sys-color-on-surface-variant)]',
                    valueClassName: details.riskAssessment.ideation
                      ? 'font-bold text-[var(--md-sys-color-on-error-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70',
                  },
                  {
                    id: 'attempt',
                    icon: 'personal_injury',
                    label: '自杀企图',
                    value: details.riskAssessment.attempt ? '是' : '否',
                    className: details.riskAssessment.attempt
                      ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                      : '',
                    iconClassName: details.riskAssessment.attempt
                      ? 'text-[var(--md-sys-color-on-error-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)]',
                    labelClassName: details.riskAssessment.attempt
                      ? 'text-[var(--md-sys-color-on-error-container)] opacity-90'
                      : 'text-[var(--md-sys-color-on-surface-variant)]',
                    valueClassName: details.riskAssessment.attempt
                      ? 'font-bold text-[var(--md-sys-color-on-error-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70',
                  },
                  {
                    id: 'selfHarm',
                    icon: 'healing',
                    label: '自残行为',
                    value: details.riskAssessment.selfHarm ? '是' : '否',
                    className: details.riskAssessment.selfHarm
                      ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                      : '',
                    iconClassName: details.riskAssessment.selfHarm
                      ? 'text-[var(--md-sys-color-on-error-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)]',
                    labelClassName: details.riskAssessment.selfHarm
                      ? 'text-[var(--md-sys-color-on-error-container)] opacity-90'
                      : 'text-[var(--md-sys-color-on-surface-variant)]',
                    valueClassName: details.riskAssessment.selfHarm
                      ? 'font-bold text-[var(--md-sys-color-on-error-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70',
                  },
                ]}
                layout="horizontal"
              />
            </div>
          )}

          {/* Referral Full Description Card (Watermarked elegant quote) */}
          <div className="relative p-5 sm:p-6 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border-opacity-10 overflow-hidden flex flex-col gap-3">
            {/* Referrer Pill */}
            {initiatorName && (
              <div className="flex items-center gap-1 pe-3 w-fit self-start rounded-full bg-transparent mt-1">
                <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-medium shrink-0 me-1">
                  {initiatorInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium leading-[1.2] text-[var(--md-sys-color-on-surface)]">
                    {initiatorName}
                  </span>
                  <span className="text-[11px] font-normal leading-[1.2] text-[var(--md-sys-color-on-surface-variant)] opacity-80">
                    转诊发起人
                  </span>
                </div>
              </div>
            )}
            <span className="text-[15px] sm:text-[16px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-85 mt-2 sm:mt-4">
              转诊详细说明
            </span>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] font-normal z-10 pr-6 whitespace-pre-wrap">
              {details.triageInfo?.fullDescription || referral?.description || '暂无详细说明'}
            </p>

            {/* Large elegant watermark quote mark */}
            <Quote
              className="absolute top-5 right-5 sm:top-6 sm:right-6 text-[var(--md-sys-color-primary)] opacity-10"
              size={30}
            />
          </div>

          {/* Attachment List */}
          <AttachmentList
            attachments={details.attachments || []}
            title="转诊附件"
          />
        </div>
      </DetailsSection>
    </motion.div>
  );
};
