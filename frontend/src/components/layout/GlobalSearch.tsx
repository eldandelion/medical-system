import * as React from 'react';
import { useGlobalSearch } from '../../contexts/GlobalSearchContext';

interface GlobalSearchProps {
  placeholder?: string;
}

export function GlobalSearch({ placeholder = "搜索学生、转诊或测评量表..." }: GlobalSearchProps) {
  const { openSearch } = useGlobalSearch();
  const [isMac, setIsMac] = React.useState(true);

  React.useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().includes('MAC'));
    }
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="全局搜索 (快捷键 ⌘K)"
      onClick={() => openSearch()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSearch();
        }
      }}
      className="flex-1 max-w-2xl bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] rounded-full h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] transition-colors group shadow-sm border border-transparent hover:border-[var(--md-sys-color-outline-variant)]/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition-colors text-xl shrink-0">
          search
        </span>
        <span className="text-[var(--md-sys-color-on-surface-variant)] text-sm font-light select-none truncate">
          {placeholder}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <kbd className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)]/40 shadow-xs select-none">
          {isMac ? '⌘K' : 'Ctrl+K'}
        </kbd>
      </div>
    </div>
  );
}
