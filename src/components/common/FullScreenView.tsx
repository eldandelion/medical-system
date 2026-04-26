import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FullScreenViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children: React.ReactNode;
  disablePadding?: boolean;
}

export function FullScreenView({ 
  isOpen, 
  onClose, 
  title,
  tabs = [],
  activeTab = '',
  onTabChange,
  children,
  disablePadding = false
}: FullScreenViewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[150] bg-[var(--md-sys-color-surface)] flex flex-col overflow-hidden"
        >
          {/* Header with back button and title */}
          <header className="h-16 flex items-center border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 shrink-0 px-4 gap-2">
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-variant)] transition-colors text-[var(--md-sys-color-on-surface)] shrink-0"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] truncate">{title}</h1>
          </header>

          {/* Tabs - Centered in fullscreen */}
          {tabs && tabs.length > 0 && (
            <div className="flex justify-center border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 shrink-0">
              <div className="max-w-4xl w-full flex">
                {tabs.map((tab) => (
                  <div
                    key={tab}
                    onClick={() => onTabChange?.(tab)}
                    className={`flex-1 flex justify-center py-3 text-[14px] font-medium cursor-pointer transition-colors relative ${activeTab === tab
                      ? 'text-[var(--md-sys-color-primary)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--md-sys-color-primary)]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main content - Centered layout */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar bg-[var(--md-sys-color-surface)] ${disablePadding ? '' : 'pt-8 pb-32'}`}>
            <div className={`max-w-4xl w-full mx-auto ${disablePadding ? 'h-full' : 'px-6'}`}>
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
