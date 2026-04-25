import React from 'react';

interface CanvasHeaderProps {
  title: string;
}

export function CanvasHeader({ title }: CanvasHeaderProps) {
  return (
    <div className="sticky top-0 z-30 w-full flex items-center justify-between px-6 py-3 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)]">
      <h2 className="text-[22px] font-normal text-[var(--md-sys-color-on-surface)]">{title}</h2>
      <md-icon-button aria-label="More options">
        <md-icon>more_vert</md-icon>
      </md-icon-button>
    </div>
  );
}
