import * as React from 'react';
import { ActivityStatusType, STATUS_CHIP_COLORS } from '../../config/dashboardConfig';

// --- Profile Summary Card ---
interface ProfileSummaryCardProps {
  avatarUrl?: string | null;
  name?: string;
  role?: string;
  metadata?: { icon: string; value: string }[];
  onClick?: () => void;
  isLoading?: boolean;
}

export function ProfileSummaryCard({ avatarUrl, name, role, metadata, onClick, isLoading }: ProfileSummaryCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-[var(--md-sys-color-surface-container-low)] h-full rounded-[16px] p-6 flex flex-col gap-4 relative overflow-hidden ${onClick && !isLoading ? 'cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] transition-colors' : ''}`}
    >
      {isLoading && <div className="absolute inset-0 skeleton-wave" />}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[24px] font-medium shrink-0 overflow-hidden">
          {isLoading ? (
            <div className="w-full h-full bg-[var(--md-sys-color-surface-variant)] opacity-20" />
          ) : avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            name ? name.charAt(0).toUpperCase() : '?'
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          {/* M3 titleLarge is roughly 22px */}
          <h2 className="m-0 text-[22px] leading-[28px] font-normal text-[var(--md-sys-color-on-surface)] truncate">
            {isLoading ? <div className="h-[22px] my-[3px] w-3/4 bg-[var(--md-sys-color-surface-variant)] opacity-20 rounded" /> : name}
          </h2>
          <span className="m-0 text-[14px] leading-[20px] text-[var(--md-sys-color-on-surface-variant)] truncate">
            {isLoading ? <div className="h-[14px] my-[3px] w-1/2 bg-[var(--md-sys-color-surface-variant)] opacity-20 rounded" /> : role}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2 relative z-10">
        {isLoading ? (
          <>
            <div className="flex items-center gap-2 h-[22px] text-[14px] leading-[20px] min-w-0">
              <div className="w-[18px] h-[18px] rounded bg-[var(--md-sys-color-surface-variant)] opacity-20 shrink-0" />
              <div className="h-[14px] w-full max-w-[200px] bg-[var(--md-sys-color-surface-variant)] opacity-20 rounded" />
            </div>
            <div className="flex items-center gap-2 h-[22px] text-[14px] leading-[20px] min-w-0">
              <div className="w-[18px] h-[18px] rounded bg-[var(--md-sys-color-surface-variant)] opacity-20 shrink-0" />
              <div className="h-[14px] w-full max-w-[150px] bg-[var(--md-sys-color-surface-variant)] opacity-20 rounded" />
            </div>
          </>
        ) : (
          metadata?.filter(item => item.value != null).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 h-[22px] text-[14px] leading-[20px] text-[var(--md-sys-color-on-surface)] min-w-0">
              <span className="material-symbols-outlined text-[18px] opacity-70 shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
              <span className="text-[14px] font-normal text-[var(--md-sys-color-on-surface)] truncate">{item.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- Profile Summary Error ---
export function ProfileSummaryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-[var(--md-sys-color-surface-container-low)] h-full rounded-[16px] p-6 flex flex-col items-center justify-center gap-4 text-center">
      <span className="material-symbols-outlined text-[48px] text-[var(--md-sys-color-error)] opacity-80">error_outline</span>
      <div className="flex flex-col items-center">
        <h3 className="m-0 mb-1 text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">加载个人资料失败</h3>
        <p className="m-0 text-[14px] text-[var(--md-sys-color-on-surface-variant)]">请检查您的网络连接并重试</p>
      </div>
      <button 
        onClick={onRetry}
        className="mt-2 px-6 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-[14px] font-medium hover:opacity-90 transition-opacity"
      >
        重试
      </button>
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
  items?: StatusListItem[];
  onRowClick?: (item: StatusListItem) => void;
}

export function InteractiveStatusList({ items = [], onRowClick }: InteractiveStatusListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-[var(--md-sys-color-surface-container-low)] rounded-[16px] p-6 text-center text-[var(--md-sys-color-on-surface-variant)] text-[14px] leading-[20px]">
        暂无动态
      </div>
    );
  }

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
