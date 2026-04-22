import * as React from 'react';

interface FilterChipProps {
  label: string;
  options?: string[];
  onOptionSelect?: (option: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterChip({ label, options = ['Option 1', 'Option 2'], onOptionSelect, isOpen, onToggle }: FilterChipProps) {
  const buttonId = React.useId().replace(/:/g, ''); // Material web IDs shouldn't have colons

  return (
    <div className="relative shrink-0">
      <button 
        id={buttonId}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`flex items-center gap-1 h-8 px-3 rounded-lg border ${isOpen ? 'bg-[var(--md-sys-color-surface-variant)] border-transparent' : 'border-[var(--md-sys-color-outline)] bg-transparent'} text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors font-medium text-[13px]`}
      >
        {label}
        <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
      </button>
      
      {/* Dropdown Menu using @material/web */}
      <md-menu 
        anchor={buttonId}
        open={isOpen}
        onClose={(e: any) => {
          // Prevent closing when it's already being closed by onToggle logic 
          // to avoid double toggle issues
          if (isOpen) onToggle();
        }}
        quick
      >
        {options.map((option, idx) => (
          <md-menu-item 
            key={idx}
            onClick={() => {
              onOptionSelect?.(option);
              // onToggle will be called by md-menu's onClose or explicitly here
              onToggle();
            }}
          >
            <div slot="headline">{option}</div>
          </md-menu-item>
        ))}
      </md-menu>
    </div>
  );
}

interface FilterChipSetProps {
  chips: { label: string; options?: string[] }[];
}

export function FilterChipSet({ chips }: FilterChipSetProps) {
  const [openChip, setOpenChip] = React.useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 px-6 relative z-20">
      {chips.map((chip) => (
        <div key={chip.label}>
          <FilterChip 
            label={chip.label}
            options={chip.options}
            isOpen={openChip === chip.label}
            onToggle={() => setOpenChip(openChip === chip.label ? null : chip.label)}
          />
        </div>
      ))}
    </div>
  );
}
