import React from 'react';

export interface ProfileListItemProps {
  key?: React.Key;
  icon: string;
  title: string;
  value?: React.ReactNode;
  rightElement?: React.ReactNode;
  isLast?: boolean;
  iconClassName?: string;
}

export function ProfileListItem({ icon, title, value, rightElement, isLast, iconClassName = "" }: ProfileListItemProps) {
  return (
    <div className={`flex items-center px-6 py-4 hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer transition-colors ${isLast ? '' : 'border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30'}`}>
      <div className="text-[var(--md-sys-color-on-surface-variant)] mr-6 w-6 h-6 flex items-center justify-center shrink-0">
        <span className={`material-symbols-outlined text-[24px] ${iconClassName}`}>{icon}</span>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="text-[16px] text-[var(--md-sys-color-on-surface)] font-normal">{title}</div>
        {value && <div className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">{value}</div>}
      </div>
      {rightElement}
    </div>
  );
}
