import * as React from 'react';
import { getFileCapability } from '../../utils/fileType';

export interface Attachment {
  name: string;
  size: string;
  fileId?: number | string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  title?: string;
  className?: string;
  loadingFileId?: string | number | null;
  onPreview?: (file: Attachment) => void;
  onDownload?: (file: Attachment) => void;
  onDelete?: (file: Attachment) => void;
}

/**
 * Material Design 3 inspired Attachment List component.
 * Displays a list of file attachments with preview, download, and delete action handlers.
 */
export function AttachmentList({ 
  attachments, 
  title = "附件", 
  className = "", 
  loadingFileId,
  onPreview,
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
        {attachments.map((file, idx) => {
          const capability = getFileCapability(file.name);
          const isLoading = file.fileId != null && loadingFileId === file.fileId;

          return (
            <div 
              key={file.fileId ?? idx} 
              className={`p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group ${isLoading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
              onClick={() => {
                if (onDelete) {
                  onDelete(file);
                } else if (capability.isPreviewable && onPreview) {
                  onPreview(file);
                } else {
                  onDownload?.(file);
                }
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors shrink-0">
                  <span className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}>
                    {isLoading ? 'progress_activity' : capability.iconName}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)] truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">
                    {file.size} {capability.isPreviewable && !onDelete && '· 点击预览'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* @ts-ignore */}
                <md-icon-button 
                  disabled={isLoading}
                  onClick={() => {
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
