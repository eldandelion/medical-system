import * as React from 'react';
import { SecondaryButton } from './Buttons';

interface DestructiveButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  className?: string;
}

export const DestructiveButton: React.FC<DestructiveButtonProps> = ({
  icon,
  label,
  onClick,
  className
}) => {
  return (
    <SecondaryButton
      icon={icon}
      label={label}
      onClick={onClick}
      className={className}
      style={{
        color: 'var(--md-sys-color-error)',
        '--md-outlined-button-label-text-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-with-icon-icon-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-hover-label-text-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-hover-state-layer-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-with-icon-hover-icon-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-pressed-label-text-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-pressed-state-layer-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-with-icon-pressed-icon-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-focus-label-text-color': 'var(--md-sys-color-error)',
        '--md-outlined-button-with-icon-focus-icon-color': 'var(--md-sys-color-error)',
      } as React.CSSProperties}
    />
  );
};
