import React from 'react';

import { useSidebar } from '../../contexts/SidebarContext';

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function NavItem({ icon, label, active, onClick }: NavItemProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div 
      onClick={onClick}
      className={`flex rounded-[12px] cursor-pointer transition-all duration-75 overflow-hidden ${
        isCollapsed 
          ? 'flex-col items-center justify-center gap-1 py-1.5 mx-2' 
          : 'flex-row items-center gap-4 px-4 py-2.5 mx-2 rounded-full'
      } ${
        active 
          ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium' 
          : 'hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)]'
      }`}
    >
      <span 
        className="material-symbols-outlined shrink-0" 
      >
        {icon}
      </span>
      <span className={`tracking-wide ${
        isCollapsed 
          ? 'text-[10px] leading-[12px] text-center w-full' 
          : 'text-sm'
      }`}>
        {label}
      </span>
    </div>
  );
}
