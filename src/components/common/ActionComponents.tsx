import * as React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';

interface ButtonProps {
  icon?: string;
  label: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  noCollapse?: boolean;
}

export function PrimaryButton({ icon, label, className = "h-10", onClick, style, noCollapse }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-filled-button
      className={`${className} shrink-0 whitespace-nowrap overflow-hidden transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0' : ''}`}
      onClick={onClick}
      style={{
        '--md-filled-button-container-elevation': '0',
        '--md-filled-button-hover-container-elevation': '0',
        ...style
      } as React.CSSProperties}
    >
      {icon && <md-icon slot="icon" className={effectiveCollapsed ? "m-0" : "ml-4"}>{icon}</md-icon>}
      {!effectiveCollapsed && <span className={icon ? "mr-4" : "mx-4"}>{label}</span>}
    </md-filled-button>
  );
}

export function SecondaryButton({ icon, label, className = "h-10", onClick, style, noCollapse }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-outlined-button
      className={`${className} shrink-0 whitespace-nowrap overflow-hidden transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0' : ''}`}
      onClick={onClick}
      style={{
        '--md-outlined-button-container-elevation': '0',
        ...style
      } as React.CSSProperties}
    >
      {icon && <md-icon slot="icon" className={effectiveCollapsed ? "m-0" : "ml-4"}>{icon}</md-icon>}
      {!effectiveCollapsed && <span className={icon ? "mr-4" : "mx-4"}>{label}</span>}
    </md-outlined-button>
  );
}

export function TertiaryButton({ icon, label, className = "h-10", onClick, style, noCollapse }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-text-button
      className={`${className} shrink-0 whitespace-nowrap overflow-hidden transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0' : ''}`}
      onClick={onClick}
      style={style}
    >
      {icon && <md-icon slot="icon" className={effectiveCollapsed ? "m-0" : "ml-4"}>{icon}</md-icon>}
      {!effectiveCollapsed && <span className={icon ? "mr-4" : "mx-4"}>{label}</span>}
    </md-text-button>
  );
}

export function TertiaryFab({ icon, label, onClick }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  return (
    <md-fab
      variant="tertiary"
      label={isCollapsed ? undefined : label}
      onClick={onClick}
      className={`transition-all duration-200 ${isCollapsed ? '' : 'w-full'}`}
      style={{
        '--md-fab-container-shape': '16px',
        display: isCollapsed ? 'inline-flex' : 'flex'
      } as React.CSSProperties}
    >
      {icon && <md-icon slot="icon">{icon}</md-icon>}
    </md-fab>
  );
}

export function ActionFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="action-footer-anchor p-4 bg-[var(--md-sys-color-surface-container-high)] shrink-0 overflow-hidden">
      <div className="action-footer-content-wrapper flex flex-row items-center justify-start gap-2 w-fit">
        {children}
      </div>
    </div>
  );
}
