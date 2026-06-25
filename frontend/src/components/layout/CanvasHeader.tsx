import React from 'react';

import { useIsFetching } from '@tanstack/react-query';

interface CanvasHeaderProps {
  title: string;
  isLoading?: boolean;
}

export function CanvasHeader({ title, isLoading }: CanvasHeaderProps) {
  const isFetching = useIsFetching();
  const showLoading = isLoading || isFetching > 0;

  return (
    <div className="sticky top-0 z-30 w-full flex items-center justify-between px-6 py-3 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] relative">
      <h2 className="text-[22px] font-normal text-[var(--md-sys-color-on-surface)]">{title}</h2>
      <md-icon-button aria-label="More options">
        <md-icon>more_vert</md-icon>
      </md-icon-button>
      {showLoading && (
        <div className="absolute bottom-[-1px] left-0 w-full z-10">
          {/* @ts-ignore */}
          <md-linear-progress indeterminate className="w-full"></md-linear-progress>
        </div>
      )}
    </div>
  );
}
