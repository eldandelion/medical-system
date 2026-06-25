import React from 'react';
import { motion } from 'motion/react';
import { AttachmentList } from '../common/AttachmentList';
import { Referral } from '../../types';
import { useDetails } from '../../contexts/DetailsContext';

interface ReferralFeedbackTabProps {
  extendedData: NonNullable<Referral['extendedData']>;
}

export function ReferralFeedbackTab({ extendedData }: ReferralFeedbackTabProps) {
  const { isFullScreen } = useDetails();

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-[var(--md-sys-color-primary)] uppercase tracking-widest">医院诊断结果</h4>
          <p className="text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] font-normal">
            {extendedData.feedback?.summary || '暂无反馈数据'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border-l-4 border-[var(--md-sys-color-tertiary)] flex flex-col gap-2">
          <h4 className="text-[11px] font-bold text-[var(--md-sys-color-tertiary)] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">repeat</span>
            随访计划
          </h4>
          <p className="text-[14px] text-[var(--md-sys-color-on-surface)] font-medium">
            {extendedData.feedback?.followUp || '暂无随访计划'}
          </p>
        </div>
      </div>

      <AttachmentList
        attachments={extendedData.feedback?.attachments || []}
        title="附件"
      />
    </motion.div>
  );
}
