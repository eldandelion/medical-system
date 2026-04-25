import * as React from 'react';

interface SegmentedButtonItem {
  label: string;
  value: string;
}

interface SegmentedButtonProps {
  items: SegmentedButtonItem[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export function SegmentedButton({ items, selectedValue, onChange }: SegmentedButtonProps) {
  return (
    <div className="inline-flex h-10 border border-[var(--md-sys-color-outline)] rounded-full overflow-hidden bg-transparent">
      {items.map((item, index) => {
        const isSelected = item.value === selectedValue;
        const isLast = index === items.length - 1;
        
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`flex items-center justify-center px-6 text-sm font-medium transition-all relative group ${
              isSelected 
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
