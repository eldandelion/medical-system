import React from 'react';

interface MainContentProps {
  children?: React.ReactNode;
  sidePanel?: React.ReactNode;
  isSidePanelOpen?: boolean;
}

export function MainContent({ children, sidePanel, isSidePanelOpen }: MainContentProps) {
  const [sideWidth, setSideWidth] = React.useState(360);
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

    // Constraints: min 200px, max 800px or 60% of container
    let minWidth = 200;

    // Use the action footer as a dynamic stopping anchor to prevent squishing buttons
    const sidePanelContainer = document.getElementById('side-panel-wrapper');
    if (sidePanelContainer) {
      const footerContent = sidePanelContainer.querySelector('.action-footer-content-wrapper');
      if (footerContent) {
        // scrollWidth of the w-fit content wrapper gives the true intrinsic size of buttons + gaps
        // We add 32px for the parent footer's p-4 (16px left + 16px right)
        const intrinsicWidth = footerContent.scrollWidth + 32;
        minWidth = Math.max(minWidth, Math.ceil(intrinsicWidth));
      }
    }

    const maxWidth = Math.min(800, containerRect.width * 0.6);

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSideWidth(newWidth);
    } else if (newWidth < minWidth) {
      setSideWidth(minWidth);
    } else if (newWidth > maxWidth) {
      setSideWidth(maxWidth);
    }
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

  // Enforce initial minimum width when the side panel opens or content changes
  React.useEffect(() => {
    if (showSide) {
      // Use requestAnimationFrame to let the DOM settle before measuring
      requestAnimationFrame(() => {
        const sidePanelContainer = document.getElementById('side-panel-wrapper');
        if (sidePanelContainer) {
          const footerContent = sidePanelContainer.querySelector('.action-footer-content-wrapper');
          if (footerContent) {
            const intrinsicWidth = footerContent.scrollWidth + 32; // 32px for wrapper p-4 margins
            const minWidth = Math.max(200, Math.ceil(intrinsicWidth));

            setSideWidth(prevWidth => {
              // Only override if the current width is too small to fit the buttons
              if (prevWidth < minWidth) {
                return minWidth;
              }
              return prevWidth;
            });
          }
        }
      });
    }
  }, [showSide, sidePanel]);

  return (
    <div ref={containerRef} className="flex-1 pr-2 pb-2 flex h-full overflow-hidden relative">
      {/* Main Container strict boundary */}
      <main className="flex-1 h-full relative bg-[var(--md-sys-color-surface)] rounded-3xl overflow-hidden outline-none border-none ring-0">
        <div className="absolute inset-0 w-full h-full flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar outline-none border-none">
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
          <div id="side-panel-wrapper" style={{ width: sideWidth }} className="h-full flex flex-col shrink-0">
            {React.isValidElement(sidePanel)
              ? React.cloneElement(sidePanel as React.ReactElement<any>, { width: sideWidth })
              : sidePanel}
          </div>
        </>
      )}
    </div>
  );
}
