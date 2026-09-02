import * as React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';

interface ButtonProps {
  id?: string;
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

export function PrimaryButton({ id, icon, label, className = "h-10", onClick, style, noCollapse, trailingIcon, iconSize, disabled }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-filled-button
      id={id}
      className={`${className} shrink-0 whitespace-nowrap transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0 overflow-hidden' : ''}`}
      onClick={onClick}
      onPointerUp={(e) => e.currentTarget.blur()}
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

export function SecondaryButton({ id, icon, label, className = "h-10", onClick, style, noCollapse, trailingIcon, iconSize, disabled }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-filled-tonal-button
      id={id}
      className={`${className} shrink-0 whitespace-nowrap transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0 overflow-hidden' : ''}`}
      onClick={onClick}
      onPointerUp={(e) => e.currentTarget.blur()}
      disabled={disabled}
      trailing-icon={trailingIcon ? "" : undefined}
      style={{
        '--md-filled-tonal-button-icon-size': iconSize,
        ...style
      } as React.CSSProperties}
    >
      {icon && <md-icon slot="icon" style={{ color: 'inherit', '--md-icon-size': iconSize } as React.CSSProperties}>{icon}</md-icon>}
      {label}
    </md-filled-tonal-button>
  );
}

export const FilledTonalButton = SecondaryButton;

export function OutlinedButton({ id, icon, label, className = "h-10", onClick, style, noCollapse, trailingIcon, iconSize, disabled }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-outlined-button
      id={id}
      className={`${className} shrink-0 whitespace-nowrap transition-all duration-75 ${effectiveCollapsed ? 'w-10 min-w-0 !p-0 overflow-hidden' : ''}`}
      onClick={onClick}
      onPointerUp={(e) => e.currentTarget.blur()}
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

export function TertiaryButton({ id, icon, label, className = "h-10", onClick, style, noCollapse, trailingIcon, iconSize, disabled }: ButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  return (
    <md-text-button
      id={id}
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

export interface SplitButtonOption {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface SplitButtonProps {
  id?: string;
  icon?: string;
  label: string;
  className?: string;
  onClick: () => void;
  options: SplitButtonOption[];
  variant?: 'primary' | 'secondary' | 'tonal' | 'outlined';
  disabled?: boolean;
  noCollapse?: boolean;
  iconSize?: string;
  style?: React.CSSProperties;
}

export function SplitButton({
  id,
  icon,
  label,
  className = "h-10",
  onClick,
  options,
  variant = "secondary",
  disabled,
  noCollapse,
  iconSize,
  style,
}: SplitButtonProps) {
  const { isCollapsed } = useSidebar();
  const effectiveCollapsed = noCollapse ? false : isCollapsed;
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLElement>(null);
  const autoId = React.useId().replace(/:/g, '');
  const menuAnchorId = id || `split-btn-${autoId}`;

  React.useEffect(() => {
    const menuEl = menuRef.current;
    if (!menuEl) return;

    const handleClosed = () => {
      setIsOpen(false);
    };

    menuEl.addEventListener('closed', handleClosed);
    menuEl.addEventListener('close', handleClosed);
    return () => {
      menuEl.removeEventListener('closed', handleClosed);
      menuEl.removeEventListener('close', handleClosed);
    };
  }, []);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const menuEl = menuRef.current as any;
    const isCurrentlyOpen = menuEl ? Boolean(menuEl.open) : isOpen;
    setIsOpen(!isCurrentlyOpen);
  };

  const isTonal = variant === 'secondary' || variant === 'tonal';
  const isPrimary = variant === 'primary';
  const isOutlined = variant === 'outlined';

  const leftButtonShapeStyles = {
    '--md-filled-button-container-shape-start-start': '9999px',
    '--md-filled-button-container-shape-end-start': '9999px',
    '--md-filled-button-container-shape-start-end': '4px',
    '--md-filled-button-container-shape-end-end': '4px',
    '--md-filled-button-container-elevation': '0',
    '--md-filled-button-hover-container-elevation': '0',
    '--md-filled-button-icon-size': iconSize,
    '--md-filled-tonal-button-container-shape-start-start': '9999px',
    '--md-filled-tonal-button-container-shape-end-start': '9999px',
    '--md-filled-tonal-button-container-shape-start-end': '4px',
    '--md-filled-tonal-button-container-shape-end-end': '4px',
    '--md-filled-tonal-button-icon-size': iconSize,
    '--md-outlined-button-container-shape-start-start': '9999px',
    '--md-outlined-button-container-shape-end-start': '9999px',
    '--md-outlined-button-container-shape-start-end': '4px',
    '--md-outlined-button-container-shape-end-end': '4px',
    '--md-outlined-button-icon-size': iconSize,
  } as React.CSSProperties;

  const rightButtonShapeStyles = {
    '--md-filled-button-container-shape-start-start': '4px',
    '--md-filled-button-container-shape-end-start': '4px',
    '--md-filled-button-container-shape-start-end': '9999px',
    '--md-filled-button-container-shape-end-end': '9999px',
    '--md-filled-button-container-elevation': '0',
    '--md-filled-button-hover-container-elevation': '0',
    '--md-filled-button-leading-space': '0px',
    '--md-filled-button-trailing-space': '0px',
    '--md-filled-button-with-leading-icon-leading-space': '0px',
    '--md-filled-button-with-leading-icon-trailing-space': '0px',
    '--md-filled-button-with-trailing-icon-leading-space': '0px',
    '--md-filled-button-with-trailing-icon-trailing-space': '0px',
    '--md-filled-tonal-button-container-shape-start-start': '4px',
    '--md-filled-tonal-button-container-shape-end-start': '4px',
    '--md-filled-tonal-button-container-shape-start-end': '9999px',
    '--md-filled-tonal-button-container-shape-end-end': '9999px',
    '--md-filled-tonal-button-leading-space': '0px',
    '--md-filled-tonal-button-trailing-space': '0px',
    '--md-filled-tonal-button-with-leading-icon-leading-space': '0px',
    '--md-filled-tonal-button-with-leading-icon-trailing-space': '0px',
    '--md-filled-tonal-button-with-trailing-icon-leading-space': '0px',
    '--md-filled-tonal-button-with-trailing-icon-trailing-space': '0px',
    '--md-outlined-button-container-shape-start-start': '4px',
    '--md-outlined-button-container-shape-end-start': '4px',
    '--md-outlined-button-container-shape-start-end': '9999px',
    '--md-outlined-button-container-shape-end-end': '9999px',
    '--md-outlined-button-leading-space': '0px',
    '--md-outlined-button-trailing-space': '0px',
    '--md-outlined-button-with-leading-icon-leading-space': '0px',
    '--md-outlined-button-with-leading-icon-trailing-space': '0px',
    '--md-outlined-button-with-trailing-icon-leading-space': '0px',
    '--md-outlined-button-with-trailing-icon-trailing-space': '0px',
  } as React.CSSProperties;

  return (
    <div
      className={`inline-flex items-center gap-1 shrink-0 ${effectiveCollapsed ? 'w-10 min-w-0 overflow-hidden' : ''}`}
      style={style}
    >
      {/* 1. Main Action Button */}
      {isPrimary && (
        <md-filled-button
          className={`${className} shrink-0 whitespace-nowrap transition-all duration-75`}
          onClick={onClick}
          onPointerUp={(e) => e.currentTarget.blur()}
          disabled={disabled}
          style={leftButtonShapeStyles}
        >
          {icon && <md-icon slot="icon" style={{ '--md-icon-size': iconSize } as React.CSSProperties}>{icon}</md-icon>}
          {label}
        </md-filled-button>
      )}

      {isTonal && (
        <md-filled-tonal-button
          className={`${className} shrink-0 whitespace-nowrap transition-all duration-75`}
          onClick={onClick}
          onPointerUp={(e) => e.currentTarget.blur()}
          disabled={disabled}
          style={leftButtonShapeStyles}
        >
          {icon && <md-icon slot="icon" style={{ color: 'inherit', '--md-icon-size': iconSize } as React.CSSProperties}>{icon}</md-icon>}
          {label}
        </md-filled-tonal-button>
      )}

      {isOutlined && (
        <md-outlined-button
          className={`${className} shrink-0 whitespace-nowrap transition-all duration-75`}
          onClick={onClick}
          onPointerUp={(e) => e.currentTarget.blur()}
          disabled={disabled}
          style={leftButtonShapeStyles}
        >
          {icon && <md-icon slot="icon" style={{ color: 'inherit', '--md-icon-size': iconSize } as React.CSSProperties}>{icon}</md-icon>}
          {label}
        </md-outlined-button>
      )}

      {/* 2. Trailing Dropdown Trigger + Menu */}
      {!effectiveCollapsed && (
        <div className="relative shrink-0">
          {isPrimary && (
            <md-filled-button
              id={menuAnchorId}
              aria-label="更多操作"
              className={`${className} !w-8 !min-w-0 !p-0 shrink-0 transition-all duration-75`}
              onClick={handleToggleMenu}
              onPointerUp={(e) => e.currentTarget.blur()}
              disabled={disabled}
              style={rightButtonShapeStyles}
            >
              <md-icon slot="icon">arrow_drop_down</md-icon>
            </md-filled-button>
          )}

          {isTonal && (
            <md-filled-tonal-button
              id={menuAnchorId}
              aria-label="更多操作"
              className={`${className} !w-8 !min-w-0 !p-0 shrink-0 transition-all duration-75`}
              onClick={handleToggleMenu}
              onPointerUp={(e) => e.currentTarget.blur()}
              disabled={disabled}
              style={rightButtonShapeStyles}
            >
              <md-icon slot="icon">arrow_drop_down</md-icon>
            </md-filled-tonal-button>
          )}

          {isOutlined && (
            <md-outlined-button
              id={menuAnchorId}
              aria-label="更多操作"
              className={`${className} !w-8 !min-w-0 !p-0 shrink-0 transition-all duration-75 -ml-[1px]`}
              onClick={handleToggleMenu}
              onPointerUp={(e) => e.currentTarget.blur()}
              disabled={disabled}
              style={rightButtonShapeStyles}
            >
              <md-icon slot="icon">arrow_drop_down</md-icon>
            </md-outlined-button>
          )}

          <md-menu
            ref={menuRef}
            anchor={menuAnchorId}
            open={isOpen}
            onClosed={() => setIsOpen(false)}
            quick
            style={{
              minWidth: '150px',
              '--md-menu-item-focus-outline-width': '0',
              '--md-menu-item-selected-outline-width': '0',
              zIndex: 100,
            } as React.CSSProperties}
          >
            {options.map((opt, idx) => (
              <md-menu-item
                key={idx}
                disabled={opt.disabled}
                onClick={() => {
                  setIsOpen(false);
                  opt.onClick();
                }}
              >
                {opt.icon && <md-icon slot="start">{opt.icon}</md-icon>}
                <div slot="headline">{opt.label}</div>
              </md-menu-item>
            ))}
          </md-menu>
        </div>
      )}
    </div>
  );
}
