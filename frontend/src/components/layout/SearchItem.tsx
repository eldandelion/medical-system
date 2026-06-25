import * as React from 'react';

interface SearchItemProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export function SearchItem({ icon, label, onClick }: SearchItemProps) {
  return (
    <div 
      className="px-4 py-3 flex items-center gap-4 hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition-colors">
        {icon}
      </span>
      <span className="text-sm text-[var(--md-sys-color-on-surface)] font-light">
        {label}
      </span>
    </div>
  );
}
