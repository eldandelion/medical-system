import * as React from 'react';

export interface Attachment {
  name: string;
  size: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  title?: string;
  className?: string;
  onDownload?: (file: Attachment) => void;
  onDelete?: (file: Attachment) => void;
}

/**
 * Material Design 3 inspired Attachment List component.
 * Displays a list of file attachments with download/delete action buttons.
 */
export function AttachmentList({ 
  attachments, 
  title = "附件", 
  className = "", 
  onDownload,
  onDelete
}: AttachmentListProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest px-1">
        {title} ({attachments.length})
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {attachments.map((file, idx) => (
          <div 
            key={idx} 
            className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group cursor-pointer"
            onClick={() => {
              if (onDelete) {
                onDelete(file);
              } else {
                onDownload?.(file);
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors shrink-0">
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">
                  {file.name}
                </span>
                <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">
                  {file.size}
                </span>
              </div>
            </div>
            {/* @ts-ignore */}
            <md-icon-button 
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (onDelete) {
                  onDelete(file);
                } else {
                  onDownload?.(file);
                }
              }}
            >
              {/* @ts-ignore */}
              <md-icon>{onDelete ? 'delete' : 'download'}</md-icon>
            {/* @ts-ignore */}
            </md-icon-button>
          </div>
        ))}
      </div>
    </div>
  );
}
