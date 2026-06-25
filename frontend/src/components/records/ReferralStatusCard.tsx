import React from 'react';
import { ReferralStep } from '../../types';
import { getIconForType } from './ReferralTracker';

interface ReferralStatusCardProps {
  activeStep?: ReferralStep;
  onClick?: () => void;
}

export function ReferralStatusCard({ activeStep, onClick }: ReferralStatusCardProps) {
  const isError = activeStep?.status === 'issue';
  const IconComponent = activeStep ? getIconForType(activeStep.type) : null;

  // Use the exact colors from the tracker container logic (primary container and error container)
  const containerBg = isError 
    ? 'bg-[var(--md-sys-color-error-container)]/20' 
    : 'bg-[var(--md-sys-color-primary-container)]';
  
  const textColor = isError 
    ? 'text-[var(--md-sys-color-on-error-container)]' 
    : 'text-[var(--md-sys-color-on-primary-container)]';
  
  const iconBg = isError 
    ? 'bg-[var(--md-sys-color-error-container)]' 
    : 'bg-[var(--md-sys-color-primary)]';
    
  const iconColor = isError 
    ? 'text-[var(--md-sys-color-error)]' 
    : 'text-[var(--md-sys-color-on-primary)]';

  const titleText = isError 
    ? 'text-[var(--md-sys-color-on-error-container)]' 
    : 'text-[var(--md-sys-color-on-primary-container)]';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl ${containerBg} ${textColor} cursor-pointer hover:opacity-95 transition-all duration-300 -mb-3 group`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          {IconComponent ? (
            <IconComponent size={20} className={iconColor} />
          ) : (
            <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>pending_actions</span>
          )}
        </div>
        <span className={`text-[17px] font-medium tracking-tight ${titleText}`}>
          {activeStep ? activeStep.title : '转诊处理中'}
        </span>
      </div>
      <span className="material-symbols-outlined opacity-90 transition-transform">
        chevron_right
      </span>
    </div>
  );
}
