import * as React from 'react';

export interface StatusBadgeProps {
  children?: React.ReactNode;
  label?: React.ReactNode;
  dotColorClass: string;
  className?: string;
  title?: string;
}

export function StatusBadge({
  children,
  label,
  dotColorClass,
  className = '',
  title
}: StatusBadgeProps) {
  const content = children ?? label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--md-sys-color-outline-variant)] bg-transparent text-[12px] font-medium text-[var(--md-sys-color-on-surface)] ${className}`}
      title={title}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColorClass}`} aria-hidden="true" />
      <span>{content}</span>
    </span>
  );
}
