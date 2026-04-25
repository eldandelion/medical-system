import * as React from 'react';

interface RecordHeaderProps {
  title: string;
  onExpandToggle?: () => void;
  onViewToggle?: () => void;
}

export function RecordHeader({ title, onExpandToggle, onViewToggle }: RecordHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div 
        onClick={onExpandToggle}
        className="flex items-center gap-2 cursor-pointer hover:bg-[var(--md-sys-color-surface-variant)] pr-2 py-1 rounded-md transition-colors ml-[-8px] pl-2 text-[var(--md-sys-color-on-surface-variant)]"
      >
        <span className="material-symbols-outlined text-[20px]">expand_more</span>
        <span className="text-[16px] font-medium">{title}</span>
      </div>
      <div className="flex bg-[var(--md-sys-color-surface-container-high)] rounded-full border border-[var(--md-sys-color-outline-variant)] border-opacity-50 overflow-hidden">
        <button className="flex items-center justify-center w-12 h-8 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
          <span className="material-symbols-outlined text-[18px]">check</span>
          <span className="material-symbols-outlined text-[18px] ml-[-4px]">menu</span>
        </button>
        <button 
          onClick={onViewToggle}
          className="flex items-center justify-center w-10 h-8 text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
        </button>
      </div>
    </div>
  );
}
