import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FullScreenView } from './FullScreenView';
import { DetailsContext } from '../../contexts/DetailsContext';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';

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
  width?: number | string;
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
  width = LAYOUT_CONSTANTS.SIDE_PANEL_DEFAULT_WIDTH
}: DetailsPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [titleOverride, setTitleOverride] = React.useState<string | null>(null);
  const [tabsOverride, setTabsOverride] = React.useState<any[] | null>(null);

  // Reset expansion state when the panel is closed
  React.useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
      setTitleOverride(null);
      setTabsOverride(null);
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
            style={{ width: typeof width === 'number' ? `${width}px` : width }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="material-symbols-outlined shrink-0" style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] truncate">{titleOverride || title}</span>
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


            <div className="flex-1 custom-scrollbar flex flex-col scroll-smooth overflow-hidden">
              <DetailsContext.Provider value={{ isFullScreen: false, titleOverride, setTitleOverride, tabsOverride, setTabsOverride }}>
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
        tabs={tabsOverride || tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      >
        <DetailsContext.Provider value={{ isFullScreen: true, titleOverride, setTitleOverride, tabsOverride, setTabsOverride }}>
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
    <div className={`flex flex-col gap-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30 pt-0 mt-6 first:border-0 first:pt-0 first:mt-0 ${className}`}>
      {title && (
        <div className="flex items-center gap-3">
          {icon && <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface)]">{icon}</span>}
          <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)]">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

import { Snackbar } from './Snackbar';

/**
 * Helper component for structured 3-column demographic or metric card items
 */
export function MetricCard({
  label,
  value,
  icon,
  className = "",
  labelClassName = "text-[var(--md-sys-color-on-surface-variant)]",
  iconClassName = "text-[var(--md-sys-color-on-surface-variant)]",
  valueClassName = "text-sm leading-5 font-semibold text-[var(--md-sys-color-on-surface)] tabular-nums",
  badgeClassName = "",
  copyable = false,
  copyValue,
}: {
  label: string;
  value: React.ReactNode;
  icon: string;
  className?: string;
  labelClassName?: string;
  iconClassName?: string;
  iconContainerClassName?: string;
  valueClassName?: string;
  badgeClassName?: string;
  copyable?: boolean;
  copyValue?: string;
}) {
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const textToCopy = copyValue || (typeof value === 'string' ? value : undefined);
  const showCopyButton = copyable && textToCopy;

  const handleCopy = () => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setSnackbarOpen(true);
    }
  };

  return (
    <div className={`p-3.5 rounded-[16px] bg-[var(--md-sys-color-surface-container-low)] flex items-center gap-3 min-w-0 overflow-hidden ${className}`}>
      <span className={`material-symbols-outlined text-[24px] shrink-0 ${iconClassName}`}>
        {icon}
      </span>
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
        <span className={`text-xs leading-4 font-medium tracking-wide truncate ${labelClassName}`}>
          {label}
        </span>
        <div className="flex items-center justify-between gap-1 min-w-0 h-5">
          <div className="flex flex-1 min-w-0 overflow-hidden">
            {typeof value === 'string' ? (
              <span className={`truncate leading-5 tabular-nums ${badgeClassName || valueClassName}`}>
                {value}
              </span>
            ) : (
              value
            )}
          </div>
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="w-5 h-5 rounded-full hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] transition-colors flex items-center justify-center shrink-0"
              title="复制"
            >
              <span className="material-symbols-outlined text-[13px] leading-none">content_copy</span>
            </button>
          )}
        </div>
      </div>
      <Snackbar 
        open={snackbarOpen} 
        message={`${label} 已复制到剪贴板`} 
        onClose={() => setSnackbarOpen(false)} 
        duration={3000} 
      />
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

interface ScrollableDetailsLayoutProps {
  header?: React.ReactNode;
  tabs?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

/**
 * Reusable details view layout that handles standard scroll-to-collapse header interactions,
 * sticky tab items with scroll-based shadows, fixed action footers, and minimum tab content heights.
 * Automatically synchronizes the scroll title with the outer details shell.
 */
export function ScrollableDetailsLayout({
  header,
  tabs,
  footer,
  children,
  className = '',
  title
}: ScrollableDetailsLayoutProps) {
  const { isScrolled, handleScroll } = useScrollCollapse(20);
  const { setTitleOverride } = React.useContext(DetailsContext);

  React.useEffect(() => {
    if (setTitleOverride) {
      if (isScrolled && title) {
        setTitleOverride(title);
      } else {
        setTitleOverride(null);
      }
    }
  }, [isScrolled, title, setTitleOverride]);

  return (
    <div className={`flex flex-col h-full bg-[var(--md-sys-color-surface)] relative overflow-hidden ${className}`}>
      <div
        className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden relative"
        onScroll={handleScroll}
      >
        {/* Header Section */}
        {header && (
          <div className="p-6 pb-4 flex flex-col gap-5 shrink-0">
            {header}
          </div>
        )}

        {/* Sticky Tabs */}
        {tabs && (
          <div className={`sticky top-0 z-20 bg-[var(--md-sys-color-surface)] transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
            {tabs}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-6 pb-8 min-h-[80vh]">
          {children}
        </div>
      </div>

      {/* Fixed Action Footer */}
      {footer}
    </div>
  );
}

