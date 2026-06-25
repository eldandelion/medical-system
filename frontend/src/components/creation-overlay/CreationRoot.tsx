import * as React from 'react';
import { AnimatePresence } from 'motion/react';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { MinimizedCreationDock } from './MinimizedCreationDock';
import { CreationSheetTemplate } from './CreationSheetTemplate';

export function CreationRoot() {
  const { viewState } = useCreationOverlay();

  return (
    <AnimatePresence>
      {viewState === 'MINIMIZED' && <MinimizedCreationDock key="dock" />}
      {(viewState === 'STANDARD' || viewState === 'FULLSCREEN') && <CreationSheetTemplate key="sheet" />}
    </AnimatePresence>
  );
}
