import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface GenericDialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

export function GenericDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = '560px'
}: GenericDialogProps) {
  const dialogContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 generic-dialog-overlay" role="presentation">
          {/* Scrim/Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Dialog Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ maxWidth }}
            className="relative w-full bg-[var(--md-sys-color-surface-container-high)] rounded-[28px] shadow-2xl overflow-hidden flex flex-col generic-dialog-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Headline */}
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-[var(--md-sys-color-on-surface)] text-[24px] leading-[32px] font-normal">
                {title}
              </h2>
            </div>

            {/* Content */}
            <div className="px-8 pb-8 flex flex-col gap-3 overflow-y-auto custom-scrollbar max-h-[70vh]">
              {children}
            </div>

            {/* Actions */}
            {actions && (
              <div className="px-8 pb-8 flex justify-end gap-3 bg-transparent">
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(dialogContent, document.body);
}
