import * as React from 'react';

export interface AvatarBadgeProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isSelected?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[11px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-2xl font-bold',
};

/**
 * Avatar badge component with high visual separation on selected list items.
 * When unselected, renders in primary-container with subtle ring.
 * When selected (or within a selected row), elevates to solid primary with a surface halo ring and shadow.
 */
export function AvatarBadge({
  name = '?',
  avatarUrl,
  size = 'sm',
  className = '',
  isSelected,
}: AvatarBadgeProps) {
  const initial = name ? name.trim().charAt(0) : '?';
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0 m-0.5 ring-1 ring-[var(--md-sys-color-outline-variant)] ${
          isSelected
            ? 'ring-2 ring-[var(--md-sys-color-surface)] shadow-xs'
            : 'group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:ring-2 group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:ring-[var(--md-sys-color-surface)] group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:shadow-xs'
        } ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-medium shrink-0 m-0.5 transition-all duration-150 ${
        isSelected
          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] ring-2 ring-[var(--md-sys-color-surface)] shadow-xs font-semibold'
          : 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] ring-1 ring-black/5 dark:ring-white/10 group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:bg-[var(--md-sys-color-primary)] group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:text-[var(--md-sys-color-on-primary)] group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:ring-2 group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:ring-[var(--md-sys-color-surface)] group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:shadow-xs group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:font-semibold'
      } ${className}`}
    >
      {initial}
    </div>
  );
}
