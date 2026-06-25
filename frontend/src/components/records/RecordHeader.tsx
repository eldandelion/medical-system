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
      <div className="flex items-center">
        <md-outlined-segmented-button-set>
          <md-outlined-segmented-button 
            label="列表"
            value="list"
            selected={true}
          >
            <md-icon slot="icon">view_list</md-icon>
          </md-outlined-segmented-button>
          <md-outlined-segmented-button 
            label="网格"
            value="grid"
            onClick={onViewToggle}
          >
            <md-icon slot="icon">grid_view</md-icon>
          </md-outlined-segmented-button>
        </md-outlined-segmented-button-set>
      </div>
    </div>
  );
}
