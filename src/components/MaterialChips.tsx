import * as React from 'react';

interface MaterialFilterChipProps {
  key?: React.Key;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function MaterialFilterChip({ label, selected, onClick }: MaterialFilterChipProps) {
  return (
    <md-filter-chip
      label={label}
      selected={selected}
      onClick={onClick}
    />
  );
}

interface MaterialChipSetProps {
  children: React.ReactNode;
}

export function MaterialChipSet({ children }: MaterialChipSetProps) {
  return (
    <md-chip-set>
      {children}
    </md-chip-set>
  );
}

interface MaterialAssistChipProps {
  label: string;
  icon?: string;
  onClick?: () => void;
}

export function MaterialAssistChip({ label, icon, onClick }: MaterialAssistChipProps) {
  return (
    <md-assist-chip label={label} onClick={onClick}>
      {icon && <md-icon slot="icon" style={{ marginRight: '6px' }}>{icon}</md-icon>}
    </md-assist-chip>
  );
}
