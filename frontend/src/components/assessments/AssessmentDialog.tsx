import * as React from 'react';
import { GenericDialog } from '../common/GenericDialog';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

interface Assessment {
  id: string;
  title: string;
  assignedBy: {
    name: string;
    initial: string;
  };
  type: string;
  completionPercentage: number;
  duration: string;
}

interface AssessmentDialogProps {
  open: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  onConfirm: () => void;
}

export function AssessmentDialog({
  open,
  onClose,
  assessment,
  onConfirm
}: AssessmentDialogProps) {
  if (!assessment) return null;

  const isStarted = assessment.completionPercentage > 0;
  const isCompleted = assessment.completionPercentage === 100;

  const title = isCompleted ? '查看评估' : isStarted ? '继续评估' : '开始评估';

  const actions = (
    <>
      <TertiaryButton
        onClick={onClose}
        label="取消"
      />
      <PrimaryButton
        onClick={onConfirm}
        label={isCompleted ? '确定' : isStarted ? '继续' : '开始'}
      />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={actions}
    >
      <div className="flex flex-col gap-3">
        <p className="text-[var(--md-sys-color-on-surface-variant)] text-[16px] leading-[24px]">
          您确定要{isCompleted ? '查看' : isStarted ? '继续' : '开始'}“<span className="text-[var(--md-sys-color-on-surface)] font-medium">{assessment.title}</span>”吗？
        </p>
        <div className="flex items-center gap-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[20px]">schedule</span>
          <span>预计用时：{assessment.duration}</span>
        </div>
      </div>
    </GenericDialog>
  );
}


