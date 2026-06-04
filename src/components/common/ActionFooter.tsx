import * as React from 'react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';
import { createPortal } from 'react-dom';
import { useDetails } from '../../contexts/DetailsContext';

export function ActionFooter({ children }: { children: React.ReactNode }) {
  const { isFullScreen } = useDetails();
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isFullScreen) {
      setPortalTarget(document.getElementById('fullscreen-header-actions'));
    }
  }, [isFullScreen]);

  if (isFullScreen && portalTarget) {
    return createPortal(
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
        {children}
      </div>,
      portalTarget
    );
  }

  if (isFullScreen) return null;

  return (
    <div className="action-footer-anchor p-4 bg-[var(--md-sys-color-surface-container-high)] shrink-0 overflow-hidden">
      <div className={`${LAYOUT_CONSTANTS.ACTION_FOOTER_CLASS} flex flex-row items-center justify-start gap-2 w-fit`}>
        {children}
      </div>
    </div>
  );
}
