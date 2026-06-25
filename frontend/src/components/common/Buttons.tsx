import * as React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';

interface ButtonProps {
  icon?: string;
  label: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  noCollapse?: boolean;
  trailingIcon?: boolean;
  iconSize?: string;
  disabled?: boolean;
}

export function PrimaryButton({ icon, label, className = "h-10", onClick, style, noCollapse, trailingIcon, iconSize, disabled }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-filled-button
      className={`${className} shrink-0 whitespace-nowrap transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0 overflow-hidden' : ''}`}
      onClick={onClick}
      disabled={disabled}
      trailing-icon={trailingIcon ? "" : undefined}
      style={{
        '--md-filled-button-container-elevation': '0',
        '--md-filled-button-hover-container-elevation': '0',
        '--md-filled-button-icon-size': iconSize,
        ...style
      } as React.CSSProperties}
    >
      {icon && <md-icon slot="icon" style={{ '--md-icon-size': iconSize } as React.CSSProperties}>{icon}</md-icon>}
      {label}
    </md-filled-button>
  );
}

export function SecondaryButton({ icon, label, className = "h-10", onClick, style, noCollapse, trailingIcon, iconSize, disabled }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-outlined-button
      className={`${className} shrink-0 whitespace-nowrap transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0 overflow-hidden' : ''}`}
      onClick={onClick}
      disabled={disabled}
      trailing-icon={trailingIcon ? "" : undefined}
      style={{
        '--md-outlined-button-icon-size': iconSize,
        ...style
      } as React.CSSProperties}
    >
      {icon && <md-icon slot="icon" style={{ color: 'inherit', '--md-icon-size': iconSize } as React.CSSProperties}>{icon}</md-icon>}
      {label}
    </md-outlined-button>
  );
}

export function TertiaryButton({ icon, label, className = "h-10", onClick, style, noCollapse, trailingIcon, iconSize, disabled }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-text-button
      className={`${className} shrink-0 whitespace-nowrap transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0 overflow-hidden' : ''}`}
      onClick={onClick}
      disabled={disabled}
      trailing-icon={trailingIcon ? "" : undefined}
      style={{
        '--md-text-button-icon-size': iconSize,
        ...style
      } as React.CSSProperties}
    >
      {icon && <md-icon slot="icon" style={{ color: 'inherit', '--md-icon-size': iconSize } as React.CSSProperties}>{icon}</md-icon>}
      {label}
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


interface SegmentedButtonItem {
  label: string;
  value: string;
}

interface SegmentedButtonProps {
  items: SegmentedButtonItem[];
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SegmentedButton({ items, selectedValue, onChange, disabled }: SegmentedButtonProps) {
  return (
    <div className="inline-flex h-10 border border-[var(--md-sys-color-outline)] rounded-full overflow-hidden bg-transparent">
      {items.map((item, index) => {
        const isSelected = item.value === selectedValue;
        const isLast = index === items.length - 1;

        return (
          <button
            key={item.value}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={`flex items-center justify-center px-6 text-sm font-medium transition-all relative group ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isSelected
              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              : 'text-[var(--md-sys-color-on-surface)]'
              } ${!isLast ? 'border-r border-[var(--md-sys-color-outline)]' : ''}`}
          >
            {/* MD3 State Layer */}
            <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.08] transition-opacity pointer-events-none" />

            <div className="relative flex items-center justify-center">
              {isSelected && (
                <span className="material-symbols-outlined text-[18px] mr-2">check</span>
              )}
              {item.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
