import * as React from 'react';
import { ActivityStatusType, STATUS_CHIP_COLORS } from '../../config/dashboardConfig';

// --- Profile Summary Card ---
interface ProfileSummaryCardProps {
  avatarText: string;
  title: string;
  subtitle: string;
  metadata: { icon: string; value: string }[];
  onClick?: () => void;
}

export function ProfileSummaryCard({ avatarText, title, subtitle, metadata, onClick }: ProfileSummaryCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-[var(--md-sys-color-surface-container-low)] rounded-[16px] p-6 flex flex-col gap-4 ${onClick ? 'cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] transition-colors' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium shrink-0">
          {avatarText}
        </div>
        <div className="flex flex-col">
          {/* M3 titleLarge is roughly 22px */}
          <h2 className="text-[22px] leading-[28px] font-normal text-[var(--md-sys-color-on-surface)]">{title}</h2>
          <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">{subtitle}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {metadata.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[14px] leading-[20px] text-[var(--md-sys-color-on-surface)]">
            <span className="material-symbols-outlined text-[18px] opacity-70" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
            <span className="text-[14px] font-normal text-[var(--md-sys-color-on-surface)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Action Metric Widget ---
interface ActionMetricWidgetProps {
  icon: string;
  numericValue: string | number;
  label: string;
  isAlert?: boolean;
  containerColorClass?: string; // Optional custom color class over default
  contentColorClass?: string;
  onClick?: () => void;
}

export function ActionMetricWidget({ icon, numericValue, label, isAlert, containerColorClass, contentColorClass, onClick }: ActionMetricWidgetProps) {
  const bgClass = isAlert 
    ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
    : containerColorClass || 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]';

  const colorClass = contentColorClass || (containerColorClass ? 'text-current' : (isAlert ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-primary)]'));

  return (
    <div 
      onClick={onClick}
      className={`${bgClass} p-6 rounded-[24px] flex flex-col gap-4 cursor-pointer hover:opacity-90 transition-opacity h-full`}
    >
       <div className="flex items-center justify-between">
         <span className={`material-symbols-outlined text-[32px] ${colorClass}`}>{icon}</span>
         {onClick && (
           <span className={`material-symbols-outlined ${colorClass} opacity-70`}>arrow_forward</span>
         )}
       </div>
       <div className="flex-1 flex flex-col mt-1">
         {/* M3 displayMedium is 45px */}
         <div className={`text-[45px] leading-[52px] tracking-[0px] font-normal ${colorClass}`}>
           {numericValue}
         </div>
         {/* M3 titleMedium is 16px */}
         <div className="text-[16px] leading-[24px] tracking-[0.15px] mt-auto font-medium opacity-90">
           {label}
         </div>
       </div>
    </div>
  );
}

// --- Interactive Status List ---
export interface StatusListItem {
  id: string;
  title: string;
  timestamp: string;
  statusText: string;
  statusType?: ActivityStatusType;
}

interface InteractiveStatusListProps {
  items: StatusListItem[];
  onRowClick?: (item: StatusListItem) => void;
}

export function InteractiveStatusList({ items, onRowClick }: InteractiveStatusListProps) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === items.length - 1;
        const radiusClass = items.length === 1 
          ? 'rounded-[16px]' 
          : isFirst 
            ? 'rounded-t-[16px] rounded-b-[4px]' 
            : isLast 
              ? 'rounded-t-[4px] rounded-b-[16px]' 
              : 'rounded-[4px]';

        return (
          <div 
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={`bg-[var(--md-sys-color-surface-container-low)] overflow-hidden flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--md-sys-color-secondary-container)] hover:text-[var(--md-sys-color-on-secondary-container)] transition-colors group ${radiusClass}`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] leading-[24px] tracking-[0.5px] font-normal transition-colors">{item.title}</span>
              <span className="text-[14px] leading-[20px] tracking-[0.25px] font-normal opacity-70 transition-colors">{item.timestamp}</span>
            </div>
            
            <div className="flex items-center gap-4">
              {(() => {
                const chipColor = item.statusType ? STATUS_CHIP_COLORS[item.statusType] : 'surface-variant';
                return (
                  <span className={`px-3 py-1 rounded-full text-[14px] leading-[20px] tracking-[0.1px] font-medium bg-[var(--md-sys-color-${chipColor})] text-[var(--md-sys-color-on-${chipColor})]`}>
                    {item.statusText}
                  </span>
                );
              })()}
              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
