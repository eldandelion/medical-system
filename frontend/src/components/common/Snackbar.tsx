import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface SnackbarProps {
  open: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

export function Snackbar({
  open,
  message,
  actionLabel,
  onAction,
  onClose,
  duration = 5000
}: SnackbarProps) {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const snackbarContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed bottom-6 left-6 z-[10001] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto min-w-[344px] max-w-[560px] bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] rounded-md shadow-lg px-4 py-3.5 flex items-center justify-between gap-6"
          >
            <span className="text-sm font-normal leading-5 tracking-wide">
              {message}
            </span>
            {actionLabel && (
              <button
                onClick={onAction}
                className="text-[var(--md-sys-color-inverse-primary)] text-sm font-medium px-2 py-1 rounded hover:bg-[var(--md-sys-color-inverse-primary)] hover:bg-opacity-[0.08] transition-colors uppercase tracking-wider cursor-pointer"
              >
                {actionLabel}
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(snackbarContent, document.body);
}
