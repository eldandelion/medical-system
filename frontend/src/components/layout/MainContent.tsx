import React from 'react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';

interface MainContentProps {
  children?: React.ReactNode;
  sidePanel?: React.ReactNode;
  isSidePanelOpen?: boolean;
}

export function MainContent({ children, sidePanel, isSidePanelOpen }: MainContentProps) {
  const [sideWidth, setSideWidth] = React.useState<number>(LAYOUT_CONSTANTS.SIDE_PANEL_DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    const minWidth = LAYOUT_CONSTANTS.SIDE_PANEL_MIN_WIDTH;
    const maxWidth = Math.min(LAYOUT_CONSTANTS.SIDE_PANEL_MAX_WIDTH, containerRect.width * 0.6);

    setSideWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
  }, [isResizing]);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const showSide = sidePanel && isSidePanelOpen;

  return (
    <div ref={containerRef} className="flex-1 pr-2 pb-2 flex h-full overflow-hidden relative">
      {/* Main Container strict boundary */}
      <main className="flex-1 h-full relative bg-[var(--md-sys-color-surface)] rounded-3xl overflow-hidden outline-none border-none ring-0">
        <div className="absolute inset-0 w-full h-full flex flex-col overflow-hidden outline-none border-none">
          {children}
        </div>
      </main>

      {showSide && (
        <>
          {/* Resize Handle Area */}
          <div
            onMouseDown={startResizing}
            className="w-4 h-full group cursor-col-resize flex items-center justify-center z-50 relative shrink-0"
          >
            {/* Visual Indicator - Vertical center line */}
            <div className={`w-1 h-12 rounded-full transition-colors ${isResizing ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline-variant)] group-hover:bg-[var(--md-sys-color-primary)]'}`} />
          </div>

          {/* Side Panel Container */}
          <div id={LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID} style={{ width: sideWidth }} className="@container h-full flex flex-col shrink-0 overflow-hidden">
            {React.isValidElement(sidePanel)
              ? React.cloneElement(sidePanel as React.ReactElement<any>, { width: sideWidth })
              : sidePanel}
          </div>
        </>
      )}
    </div>
  );
}
