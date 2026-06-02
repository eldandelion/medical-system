import * as React from 'react';
import { motion } from 'motion/react';
import { useCreationOverlay } from '../../contexts/CreationContext';

export function CreationSheetTemplate() {
  const { viewState, title, activePayload, headerActions, minimizeCreation, expandToFullscreen, collapseToStandard, closeCreation } = useCreationOverlay();
  const isFullscreen = viewState === 'FULLSCREEN';
  const sheetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If we clicked outside the sheet, minimize it
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        minimizeCreation();
      }
    };

    // Use capture phase to ensure it evaluates before React synthetic events stop propagation
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [minimizeCreation]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isFullscreen ? 0 : 0.4 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black z-[90] ${isFullscreen ? 'pointer-events-none' : 'pointer-events-auto'}`}
        onClick={minimizeCreation}
      />

      {/* Surface */}
      <motion.div
        ref={sheetRef}
        layout
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
        className={`fixed bottom-0 left-0 right-0 z-[100] flex flex-col overflow-hidden ${
          isFullscreen 
            ? 'top-0 w-full rounded-none bg-[var(--md-sys-color-surface)]' 
            : 'h-[75dvh] w-full max-w-4xl mx-auto rounded-t-[32px] bg-[var(--md-sys-color-surface-container-low)] shadow-[0px_-2px_8px_rgba(0,0,0,0.1)]'
        }`}
      >
        {/* Header Architecture */}
        <div className="flex-none flex flex-col relative">
          {/* Top App Bar Content */}
          <div className="flex items-center justify-between px-6 py-4 min-h-[64px]">
            <div className="flex-1 truncate">
              <span className="text-[22px] font-medium text-[var(--md-sys-color-on-surface)]">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {headerActions}
              {isFullscreen ? (
                <md-icon-button onClick={collapseToStandard}>
                  <md-icon>close_fullscreen</md-icon>
                </md-icon-button>
              ) : (
                <md-icon-button onClick={expandToFullscreen}>
                  <md-icon>fullscreen</md-icon>
                </md-icon-button>
              )}
              <md-icon-button onClick={minimizeCreation}>
                <md-icon>minimize</md-icon>
              </md-icon-button>
            </div>
          </div>
          {/* Slot for injecting progress bars right underneath the header */}
          <div id="creation-progress-slot" className="absolute bottom-0 left-0 right-0 w-full z-50"></div>
        </div>

        {/* Dynamic Content Payload */}
        <div className="flex-1 flex flex-col overflow-hidden w-full max-w-[1200px] mx-auto relative">
          {activePayload}
        </div>
      </motion.div>
    </>
  );
}
