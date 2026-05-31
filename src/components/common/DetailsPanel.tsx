import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FullScreenView } from './FullScreenView';
import { DetailsContext } from '../../contexts/DetailsContext';

interface DetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExpand?: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  headerAvatar?: React.ReactNode;
  iconColor?: string;
  tabs?: { id: string, label: string, icon: string }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  width?: number;
  disablePadding?: boolean;
}

export function DetailsPanel({
  isOpen,
  onClose,
  onExpand,
  title,
  subtitle,
  icon,
  headerAvatar,
  iconColor = 'var(--md-sys-color-primary)',
  tabs = [],
  activeTab = '',
  onTabChange,
  children,
  width = 720,
  disablePadding = false
}: DetailsPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Reset expansion state when the panel is closed
  React.useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '20%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '20%', opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full bg-[var(--md-sys-color-surface)] rounded-3xl overflow-hidden flex flex-col shrink-0 border-none ring-0 relative"
            style={{ width: width }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="material-symbols-outlined shrink-0" style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] truncate">{title}</span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => onExpand ? onExpand() : setIsExpanded(true)}
                  className="p-1.5 hover:bg-[var(--md-sys-color-surface-variant)] rounded-full transition-colors flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]"
                >
                  <span className="material-symbols-outlined text-[20px]">open_in_full</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-[var(--md-sys-color-surface-variant)] rounded-full transition-colors flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>


            {/* Panel Scrollable Content */}
            <div className={`flex-1 custom-scrollbar flex flex-col scroll-smooth ${disablePadding ? 'overflow-hidden' : 'overflow-y-auto p-5'}`}>
              <DetailsContext.Provider value={{ isFullScreen: false }}>
                {children}
              </DetailsContext.Provider>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <FullScreenView
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title={title}
        subtitle={subtitle}
        avatar={headerAvatar}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        disablePadding={disablePadding}
      >
        <DetailsContext.Provider value={{ isFullScreen: true }}>
          {children}
        </DetailsContext.Provider>
      </FullScreenView>
    </>
  );
}

/**
 * Helper component for sections inside the DetailsPanel
 */
export function DetailsSection({ title, children, icon, className = "" }: { title?: string, children: React.ReactNode, icon?: string, className?: string }) {
  return (
    <div className={`flex flex-col gap-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30 pt-6 mt-6 first:border-0 first:pt-0 first:mt-0 ${className}`}>
      {title && (
        <div className="flex items-center gap-3">
          {icon && <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface)]">{icon}</span>}
          <h3 className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Helper component for key-value details
 */
export function DetailItem({ label, value }: { label: string, value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">{label}</span>
      <span className="text-[14px] text-[var(--md-sys-color-on-surface)]">{value}</span>
    </div>
  );
}

/**
 * Hook to manage scroll collapsing state for detail view headers.
 */
export function useScrollCollapse(threshold = 20) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > threshold);
  }, [threshold]);

  return { isScrolled, handleScroll, setIsScrolled };
}

interface CollapsibleHeaderProps {
  visible: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable motion wrapper to animate header collapse on scroll.
 */
export function CollapsibleHeader({ visible, children, className = '' }: CollapsibleHeaderProps) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`overflow-hidden origin-top ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
