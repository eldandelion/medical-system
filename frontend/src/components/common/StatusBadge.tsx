import * as React from 'react';

export interface StatusBadgeProps {
  children?: React.ReactNode;
  label?: React.ReactNode;
  dotColorClass: string;
  className?: string;
  title?: string;
  isSelected?: boolean;
}

export function StatusBadge({
  children,
  label,
  dotColorClass,
  className = '',
  title,
  isSelected,
}: StatusBadgeProps) {
  const content = children ?? label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium transition-colors ${
        isSelected
          ? 'border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs'
          : 'border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:border-[var(--md-sys-color-outline)] group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:bg-[var(--md-sys-color-surface)] group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:shadow-xs'
      } ${className}`}
      title={title}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColorClass}`} aria-hidden="true" />
      <span>{content}</span>
    </span>
  );
}
