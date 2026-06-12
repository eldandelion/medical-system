import React from 'react';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';

interface MainContentProps {
  children?: React.ReactNode;
  sidePanel?: React.ReactNode;
  isSidePanelOpen?: boolean;
}

export function MainContent({ children, sidePanel, isSidePanelOpen }: MainContentProps) {
  const [sideWidth, setSideWidth] = React.useState(400);
  const [isResizing, setIsResizing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragMinWidthRef = React.useRef<number>(400);

  const calculateMinWidth = React.useCallback(() => {
    let minW = 400;
    const sidePanelContainer = document.getElementById(LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID);
    if (!sidePanelContainer) return minW;

    // 1. Check Action Footer buttons
    const footerContent = sidePanelContainer.querySelector(`.${LAYOUT_CONSTANTS.ACTION_FOOTER_CLASS}`);
    if (footerContent) {
      const intrinsicWidth = footerContent.scrollWidth + 32;
      minW = Math.max(minW, Math.ceil(intrinsicWidth));
    }

    // 2. Check Tabs row
    const tabsContent = sidePanelContainer.querySelector(`.${LAYOUT_CONSTANTS.TABS_LIST_CLASS}`);
    if (tabsContent) {
      let intrinsicTabsWidth = 0;
      Array.from(tabsContent.children).forEach(child => {
        const style = window.getComputedStyle(child);
        intrinsicTabsWidth += parseFloat(style.minWidth) || 0;
      });
      minW = Math.max(minW, Math.ceil(intrinsicTabsWidth + 16));
    }

    // 3. Check dynamic minimum width anchors
    const dynamicAnchors = sidePanelContainer.querySelectorAll(`.${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`);
    dynamicAnchors.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const originalWidth = htmlEl.style.width;
      htmlEl.style.width = 'max-content';
      const offset = parseInt(htmlEl.getAttribute(LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR) || '0', 10);
      const intrinsic = htmlEl.offsetWidth + offset;
      htmlEl.style.width = originalWidth;
      minW = Math.max(minW, intrinsic);
    });

    return minW;
  }, []);

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragMinWidthRef.current = calculateMinWidth();
    setIsResizing(true);
  }, [calculateMinWidth]);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    const minWidth = dragMinWidthRef.current;
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
        const calculatedMinWidth = calculateMinWidth();
        setSideWidth(prevWidth => {
          // Only override if the current width is too small to fit the content
          if (prevWidth < calculatedMinWidth) {
            return calculatedMinWidth;
          }
          return prevWidth;
        });
      });
    }
  }, [showSide, sidePanel, calculateMinWidth]);

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
          <div id={LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID} style={{ width: sideWidth }} className="h-full flex flex-col shrink-0">
            {React.isValidElement(sidePanel)
              ? React.cloneElement(sidePanel as React.ReactElement<any>, { width: sideWidth })
              : sidePanel}
          </div>
        </>
      )}
    </div>
  );
}
