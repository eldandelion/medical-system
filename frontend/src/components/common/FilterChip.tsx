import * as React from 'react';

interface FilterChipProps {
  label: string;
  options?: string[];
  selectedValue?: string;
  onOptionSelect?: (option: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterChip({ label, options = ['Option 1', 'Option 2'], selectedValue, onOptionSelect, isOpen, onToggle }: FilterChipProps) {
  const buttonId = React.useId().replace(/:/g, ''); // Material web IDs shouldn't have colons
  const menuRef = React.useRef<HTMLElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const displayLabel = selectedValue ? `${label}: ${selectedValue}` : label;

  React.useEffect(() => {
    const menuEl = menuRef.current;
    if (!menuEl) return;

    const handleClosed = () => {
      if (isOpen) {
        onToggle();
      }
    };

    menuEl.addEventListener('closed', handleClosed);
    menuEl.addEventListener('close', handleClosed);
    return () => {
      menuEl.removeEventListener('closed', handleClosed);
      menuEl.removeEventListener('close', handleClosed);
    };
  }, [isOpen, onToggle]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest('md-menu') || target?.closest('md-menu-item')) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isOpen, onToggle]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button 
        id={buttonId}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`flex items-center gap-1 h-8 px-3 rounded-lg border ${isOpen ? 'bg-[var(--md-sys-color-surface-variant)] border-transparent' : 'border-[var(--md-sys-color-outline)] bg-transparent'} text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors font-medium text-[13px]`}
      >
        {displayLabel}
        <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
      </button>
      
      {/* Dropdown Menu using @material/web */}
      <md-menu 
        ref={menuRef}
        anchor={buttonId}
        open={isOpen}
        style={{ zIndex: 100 } as React.CSSProperties}
        onClosed={() => {
          if (isOpen) onToggle();
        }}
        quick
      >
        {options.map((option, idx) => (
          <md-menu-item 
            key={idx}
            onClick={() => {
              onOptionSelect?.(option);
              if (isOpen) onToggle();
            }}
          >
            <div slot="headline">{option}</div>
            {selectedValue === option && (
              <md-icon slot="end">check</md-icon>
            )}
          </md-menu-item>
        ))}
      </md-menu>
    </div>
  );
}

interface FilterChipSetProps {
  chips: { label: string; options?: string[] }[];
  initialFilters?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;
  className?: string;
  children?: React.ReactNode;
}

export function FilterChipSet({ chips, initialFilters = {}, onFilterChange, className, children }: FilterChipSetProps) {
  const [openChip, setOpenChip] = React.useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = React.useState<Record<string, string>>(initialFilters);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!openChip) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest('md-menu') || target?.closest('md-menu-item')) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(target as Node)) {
        setOpenChip(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [openChip]);

  const handleOptionSelect = (chipLabel: string, option: string) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[chipLabel] === option) {
      // Deselect if already selected
      delete newFilters[chipLabel];
    } else {
      newFilters[chipLabel] = option;
    }
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div ref={containerRef} className={className || "flex flex-wrap items-center gap-2 mb-6 px-6 relative z-20"}>
      {chips.map((chip) => (
        <div key={chip.label}>
          <FilterChip 
            label={chip.label}
            options={chip.options}
            selectedValue={selectedFilters[chip.label]}
            onOptionSelect={(option) => handleOptionSelect(chip.label, option)}
            isOpen={openChip === chip.label}
            onToggle={() => setOpenChip(openChip === chip.label ? null : chip.label)}
          />
        </div>
      ))}
      {children}
    </div>
  );
}
