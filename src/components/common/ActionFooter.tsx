import * as React from 'react';

export function ActionFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="action-footer-anchor p-4 bg-[var(--md-sys-color-surface-container-high)] shrink-0 overflow-hidden">
      <div className="action-footer-content-wrapper flex flex-row items-center justify-start gap-2 w-fit">
        {children}
      </div>
    </div>
  );
}
