import React from 'react';
import { motion } from 'motion/react';
import { AttachmentList } from '../common/AttachmentList';
import { FeedbackDto } from '../../api/intakeApi';

export interface ReferralFeedbackTabProps {
  feedback?: FeedbackDto | null;
}

export const ReferralFeedbackTab: React.FC<ReferralFeedbackTabProps> = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--md-sys-color-outline-variant)] p-8 text-center">
        <span className="material-symbols-outlined text-[40px] text-[var(--md-sys-color-outline)]">
          pending_actions
        </span>
        <h4 className="mt-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
          暂无反馈数据
        </h4>
        <p className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          接诊医生尚未提交就医诊疗反馈，问诊完成后将在此同步诊断结果与随访方案。
        </p>
      </div>
    );
  }

  const attachments = feedback.attachments || [];

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-[var(--md-sys-color-primary)] uppercase tracking-widest">
            医院诊断结果
          </h4>
          <p className="text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] font-normal z-10 pr-6 whitespace-pre-wrap">
            {feedback.summary || '暂无反馈数据'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border-l-4 border-[var(--md-sys-color-tertiary)] flex flex-col gap-2">
          <h4 className="text-[11px] font-bold text-[var(--md-sys-color-tertiary)] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">repeat</span>
            随访计划
          </h4>
          <p className="text-[14px] text-[var(--md-sys-color-on-surface)] font-medium whitespace-pre-wrap">
            {feedback.followUp || '暂无随访计划'}
          </p>
        </div>
      </div>

      <AttachmentList attachments={attachments} title="附件" />
    </motion.div>
  );
};
