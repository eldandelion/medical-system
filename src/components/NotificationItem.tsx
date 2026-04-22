import React from 'react';

export interface NotificationAction {
  label: string;
  variant?: 'filled' | 'outlined' | 'text';
  onClick?: () => void;
}

export interface NotificationItemProps {
  icon: string;
  iconBgColor: string;
  iconTextColor?: string;
  header: React.ReactNode;
  time: string;
  body?: React.ReactNode;
  actions?: NotificationAction[];
}

export function NotificationItem({ 
  icon, 
  iconBgColor, 
  iconTextColor = 'inherit', 
  header, 
  time, 
  body, 
  actions 
}: NotificationItemProps) {
  return (
    <div className="flex gap-4">
      <div 
        className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBgColor, color: iconTextColor }}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="text-[14px] text-[var(--md-sys-color-on-surface)] mt-1 font-medium">
          {header} <span className="text-[var(--md-sys-color-on-surface-variant)] ml-1 font-normal">• {time}</span>
        </div>
        {body && (
          <div className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed">
            {body}
          </div>
        )}
        {actions && actions.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
