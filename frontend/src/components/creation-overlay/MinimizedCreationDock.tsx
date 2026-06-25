import * as React from 'react';
import { motion } from 'motion/react';
import { useCreationOverlay } from '../../contexts/CreationContext';

export function MinimizedCreationDock() {
  const { title, maximizeCreation, closeCreation } = useCreationOverlay();

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto z-[100] bg-[var(--md-sys-color-surface-container-low)] shadow-[0px_-1px_4px_rgba(0,0,0,0.1)] rounded-t-3xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] transition-colors"
      onClick={maximizeCreation}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">edit_document</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-wider leading-none">Ongoing</span>
          <span className="font-medium text-[var(--md-sys-color-on-surface)] text-[16px] leading-tight mt-1">{title}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <md-icon-button onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          maximizeCreation();
        }}>
          <md-icon>open_in_full</md-icon>
        </md-icon-button>
        <md-icon-button onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          closeCreation();
        }}>
          <md-icon>close</md-icon>
        </md-icon-button>
      </div>
    </motion.div>
  );
}
