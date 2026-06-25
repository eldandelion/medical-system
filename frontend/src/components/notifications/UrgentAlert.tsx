import React from 'react';

export interface UrgentAction {
  label: string;
  variant?: 'filled' | 'outlined' | 'text';
  onClick?: () => void;
}

export interface UrgentAlertProps {
  icon: string;
  title: string;
  description: string;
  actions: UrgentAction[];
}

export function UrgentAlert({ icon, title, description, actions }: UrgentAlertProps) {
  return (
    <div className="flex gap-4 mb-8">
      <div className="w-[42px] h-[42px] rounded-full bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{title}</div>
        <div className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1">{description}</div>
        <div className="flex gap-3 mt-3">
          {actions.map((action, idx) => {
             const buttonStyle = { paddingLeft: '12px', paddingRight: '12px' };
             if (action.variant === 'filled') {
               return (
                 <md-filled-button key={idx} onClick={action.onClick} className="h-8" style={buttonStyle}>
                   {action.label}
                 </md-filled-button>
               );
             } else if (action.variant === 'outlined') {
               return (
                 <md-outlined-button key={idx} onClick={action.onClick} className="h-8" style={buttonStyle}>
                   {action.label}
                 </md-outlined-button>
               );
             } else {
               return (
                 <md-text-button key={idx} onClick={action.onClick} className="h-8" style={buttonStyle}>
                   {action.label}
                 </md-text-button>
               );
             }
          })}
        </div>
      </div>
    </div>
  );
}
