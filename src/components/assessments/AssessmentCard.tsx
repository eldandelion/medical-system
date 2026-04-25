import * as React from 'react';

interface AssessmentCardProps {
  key?: React.Key;
  title: string;
  assignedBy: {
    name: string;
    initial: string;
    bgColor?: string;
    textColor?: string;
  };
  type: string;
  completionPercentage: number;
  duration: string;
  actionLabel: string;
  onAction?: () => void;
  onMoreClick?: () => void;
}

export function AssessmentCard({
  title,
  assignedBy,
  type,
  completionPercentage,
  duration,
  actionLabel,
  onAction,
  onMoreClick
}: AssessmentCardProps) {
  const showProgress = completionPercentage > 0 && completionPercentage < 100;

  return (
    <div className="rounded-xl border border-[var(--md-sys-color-outline-variant)] border-opacity-50 bg-transparent p-6 flex flex-col gap-4 relative">
      {/* More Options */}
      <div className="absolute top-5 right-4 text-[var(--md-sys-color-on-surface-variant)]">
        <md-icon-button className="scale-75" onClick={onMoreClick}>
          <md-icon>more_horiz</md-icon>
        </md-icon-button>
      </div>
      
      {/* Header: Profile & Name */}
      <div className="flex items-center gap-3 mb-1">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
          style={{ 
            backgroundColor: assignedBy.bgColor || 'var(--md-sys-color-primary-container)',
            color: assignedBy.textColor || 'var(--md-sys-color-on-primary-container)'
          }}
        >
          {assignedBy.initial}
        </div>
        <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{assignedBy.name}</span>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)]">{title}</h3>
        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">
          {type} • {completionPercentage}% complete • {duration}
        </p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full h-[6px] bg-[var(--md-sys-color-surface-variant)] rounded-full overflow-hidden mt-1">
          <div 
            className="h-full bg-[var(--md-sys-color-primary)] rounded-full transition-all duration-500" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end mt-2">
        <button 
          onClick={onAction}
          className="h-[40px] px-6 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-sm font-medium hover:opacity-90 transition shadow-sm outline-none"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
