import * as React from 'react';
import { Snackbar } from './Snackbar';

export interface GroupedInfoItemProps {
  id?: string;
  icon?: string;
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  copyValue?: string;
  trailing?: React.ReactNode;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
}

export interface GroupedInfoListProps {
  items: GroupedInfoItemProps[];
  className?: string;
  fallbackText?: string;
  layout?: 'stacked' | 'horizontal';
}

/**
 * Calculates adaptive segmented corner curvature matching mobile-intake:
 * - Single item: fully rounded pill capsule (20px)
 * - First item: large top radius (20px), subtle bottom radius (4px)
 * - Middle items: subtle continuous radius (4px)
 * - Last item: subtle top radius (4px), large bottom radius (20px)
 */
export const getGroupedItemCornerRadius = (index: number, total: number): string => {
  if (total <= 1) return 'rounded-[20px]';
  if (index === 0) return 'rounded-t-[20px] rounded-b-[4px]';
  if (index === total - 1) return 'rounded-t-[4px] rounded-b-[20px]';
  return 'rounded-[4px]';
};

/**
 * Reusable Inset Grouped List Component
 * Renders structured personal, demographic, or record details in continuous grouped capsules
 * with 2px hairline gaps.
 * Supports stacked layout (value beneath label, matching mobile-intake ProfilePage)
 * and horizontal side-by-side layout.
 */
export function GroupedInfoList({
  items,
  className = '',
  fallbackText = '未填报',
  layout = 'stacked',
}: GroupedInfoListProps) {
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const handleCopy = async (text: string) => {
    if (!text || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarOpen(true);
    } catch {
      // Gracefully ignore failure without showing false success notification
    }
  };

  return (
    <>
      <div className={`flex flex-col gap-[2px] w-full ${className}`}>
        {items.map((item, index) => {
          const cornerRadius = getGroupedItemCornerRadius(index, items.length);
          const rawValue = item.value;
          const isValueEmpty = rawValue === null || rawValue === undefined || rawValue === '';
          const displayValue = isValueEmpty ? fallbackText : rawValue;
          const textToCopy = item.copyValue || (typeof rawValue === 'string' ? rawValue : undefined);
          const showCopyButton = item.copyable && Boolean(textToCopy);

          if (layout === 'horizontal') {
            return (
              <div
                key={item.id || `${item.label}-${index}`}
                className={`grouped-info-row px-4 py-3 bg-[var(--md-sys-color-surface-container-low)] flex items-center justify-between gap-3 min-h-[48px] sm:min-h-[52px] ${cornerRadius} ${
                  item.className || ''
                }`}
              >
                {/* Left Column: Icon + Label */}
                <div className="flex items-center gap-3 min-w-0 shrink-0">
                  {item.icon && (
                    <span
                      className={`material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)] shrink-0 ${
                        item.iconClassName || ''
                      }`}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  )}
                  <span
                    className={`text-[13px] sm:text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)] tracking-tight ${
                      item.labelClassName || ''
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Right Column: Value + Copy Button + Trailing Content */}
                <div className="flex items-center gap-2 min-w-0 justify-end flex-1 pl-2">
                  <div
                    className={`text-[13px] sm:text-[14px] font-semibold text-[var(--md-sys-color-on-surface)] truncate text-right tabular-nums ${
                      item.valueClassName || ''
                    } ${isValueEmpty ? 'opacity-50 font-normal' : ''}`}
                  >
                    {displayValue}
                  </div>

                  {showCopyButton && textToCopy && (
                    <button
                      type="button"
                      onClick={() => handleCopy(textToCopy)}
                      className="w-7 h-7 rounded-full hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                      title={`复制${item.label}`}
                      aria-label={`复制${item.label}`}
                    >
                      <span className="material-symbols-outlined text-[14px] leading-none" aria-hidden="true">
                        content_copy
                      </span>
                    </button>
                  )}

                  {item.trailing}
                </div>
              </div>
            );
          }

          // Default: 'stacked' layout matching mobile-intake ProfilePage
          return (
            <div
              key={item.id || `${item.label}-${index}`}
              className={`grouped-info-row px-4 py-3.5 bg-[var(--md-sys-color-surface-container-low)] flex items-center gap-4 min-h-[56px] ${cornerRadius} ${
                item.className || ''
              }`}
            >
              {/* Leading Icon */}
              {item.icon && (
                <span
                  className={`material-symbols-outlined text-[22px] text-[var(--md-sys-color-on-surface-variant)] shrink-0 ${
                    item.iconClassName || ''
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              )}

              {/* Text Column: Label on top, value underneath */}
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium text-[var(--md-sys-color-on-surface)] leading-snug truncate ${
                    item.labelClassName || ''
                  }`}
                >
                  {item.label}
                </div>
                <div
                  className={`text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 truncate font-normal ${
                    item.valueClassName || ''
                  } ${isValueEmpty ? 'opacity-50' : ''}`}
                >
                  {displayValue}
                </div>
              </div>

              {/* Trailing Area: Copy Button + Custom Trailing Content */}
              <div className="flex items-center gap-2 shrink-0">
                {showCopyButton && textToCopy && (
                  <button
                    type="button"
                    onClick={() => handleCopy(textToCopy)}
                    className="w-7 h-7 rounded-full hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title={`复制${item.label}`}
                    aria-label={`复制${item.label}`}
                  >
                    <span className="material-symbols-outlined text-[14px] leading-none" aria-hidden="true">
                      content_copy
                    </span>
                  </button>
                )}

                {item.trailing}
              </div>
            </div>
          );
        })}
      </div>

      <Snackbar
        open={snackbarOpen}
        message="已复制到剪贴板"
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
}
