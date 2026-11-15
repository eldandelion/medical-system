import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GenericDialog } from '../common/GenericDialog';
import { TertiaryButton } from '../common/Buttons';
import { AssessmentCatalogItemDto } from '../../types';

export interface HideScaleConfirmationDialogProps {
  scale: AssessmentCatalogItemDto | null;
  isOpen: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface ComplianceImpactItem {
  icon: string;
  title: string;
  description: string;
}

const COMPLIANCE_IMPACT_ITEMS: ComplianceImpactItem[] = [
  {
    icon: 'visibility_off',
    title: '目录隐藏与分发暂停',
    description: '该量表将立即从学生自测目录及教师筛查分发列表中下线，无法发起新的评定任务。',
  },
  {
    icon: 'pending_actions',
    title: '在途问卷有效完成',
    description: '学生端已领取的在途测评任务不受影响，在有效截止期内仍可正常作答并提交。',
  },
  {
    icon: 'verified_user',
    title: '历史档案完整保留',
    description: '所有历史评定得分、常模比对结果与心理档案记录均完整留存，不影响历次健康报告。',
  },
  {
    icon: 'replay',
    title: '随时恢复上线',
    description: '管理员可随时在量表目录管理中点击「启用上线」重新向全校开放。',
  },
];

const ERROR_TEXT_BUTTON_STYLE: React.CSSProperties = {
  color: 'var(--md-sys-color-error)',
  '--md-text-button-label-text-color': 'var(--md-sys-color-error)',
  '--md-text-button-hover-label-text-color': 'var(--md-sys-color-error)',
  '--md-text-button-hover-state-layer-color': 'var(--md-sys-color-error)',
  '--md-text-button-pressed-label-text-color': 'var(--md-sys-color-error)',
  '--md-text-button-pressed-state-layer-color': 'var(--md-sys-color-error)',
  '--md-text-button-focus-label-text-color': 'var(--md-sys-color-error)',
} as React.CSSProperties;

/**
 * Confirmation modal shown before hiding an active assessment scale,
 * including collapsible compliance and impact explanations.
 */
export function HideScaleConfirmationDialog({
  scale,
  isOpen,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: HideScaleConfirmationDialogProps) {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsDetailsOpen(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsDetailsOpen(false);
    onCancel();
  };

  return (
    <GenericDialog
      open={isOpen && !!scale}
      onClose={handleClose}
      maxWidth="500px"
      title={
        <span className="text-[20px] font-semibold text-[var(--md-sys-color-on-surface)]">
          确认隐藏测评量表？
        </span>
      }
      actions={
        <>
          <TertiaryButton
            label="取消"
            onClick={handleClose}
            disabled={isSubmitting}
          />
          <TertiaryButton
            label="确认隐藏"
            style={ERROR_TEXT_BUTTON_STYLE}
            onClick={async () => {
              setIsDetailsOpen(false);
              await onConfirm();
            }}
            disabled={isSubmitting}
          />
        </>
      }
    >
      {scale && (
        <div className="space-y-3.5 text-sm text-[var(--md-sys-color-on-surface)]">
          <div className="bg-[var(--md-sys-color-surface-container)] p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-[15px]">{scale.title}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] shrink-0">
                {scale.batteryCode}
              </span>
            </div>
            <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1">
              <div>
                题目总数：<span className="font-mono text-[var(--md-sys-color-on-surface)]">{scale.questionCount} 题</span>
              </div>
              <div>
                预估用时：<span className="text-[var(--md-sys-color-on-surface)]">{scale.duration}</span>
              </div>
              {scale.subtitle && (
                <div>
                  量表类别：<span className="text-[var(--md-sys-color-on-surface)]">{scale.subtitle}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              aria-expanded={isDetailsOpen}
              onClick={() => setIsDetailsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                  info
                </span>
                <span>查看操作影响与合规说明</span>
              </span>
              <span
                className={`material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ${
                  isDetailsOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {isDetailsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  {COMPLIANCE_IMPACT_ITEMS.map((item) => (
                    <div
                      key={item.title}
                      className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                          {item.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                          {item.title}
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </GenericDialog>
  );
}
