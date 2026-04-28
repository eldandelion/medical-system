import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalSearchProps {
  placeholder?: string;
}

export function GlobalSearch({ placeholder = "Search students and referrals" }: GlobalSearchProps) {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Handle click outside to close search
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    if (isSearchFocused) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchFocused]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchFocused(false);
    };
    if (isSearchFocused) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  return (
    <div ref={searchRef} className="flex-1 max-w-2xl relative h-12">
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setIsSearchFocused(false)}
          />
        )}
      </AnimatePresence>

      {/* Base Search Bar (Always visible) */}
      <div 
        className="w-full bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] rounded-full h-12 px-4 flex items-center gap-3 cursor-text hover:bg-[var(--md-sys-color-surface-container)] transition-colors group shadow-sm"
        onClick={() => setIsSearchFocused(true)}
      >
        <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)] transition-colors">search</span>
        <span className="text-[var(--md-sys-color-on-surface-variant)] text-sm font-light select-none">{placeholder}</span>
      </div>

      {/* Expanded Overlay Panel */}
      <AnimatePresence>
        {isSearchFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-0 left-0 right-0 z-50 bg-[var(--md-sys-color-surface-container-high)] shadow-2xl rounded-[24px] overflow-hidden flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="h-12 px-4 flex items-center gap-3 shrink-0">
              <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">search</span>
              <input
                autoFocus
                type="text"
                placeholder={placeholder}
                className="bg-transparent outline-none border-none ring-0 flex-1 placeholder:text-[var(--md-sys-color-on-surface-variant)] text-[var(--md-sys-color-on-surface)] text-sm placeholder:font-light font-light"
              />
              <md-icon-button className="scale-75" onClick={(e: any) => { e.stopPropagation(); setIsSearchFocused(false); }}>
                <md-icon>close</md-icon>
              </md-icon-button>
            </div>

            {/* Suggestions Panel with Divider */}
            <div className="flex flex-col overflow-hidden">
              <div className="h-[1px] w-full bg-[var(--md-sys-color-outline-variant)] opacity-30 mx-0" />
              <div className="flex flex-col py-1">
                <div className="px-4 py-3 flex items-center gap-4 hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer transition-colors group">
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]">star</span>
                  <span className="text-sm text-[var(--md-sys-color-on-surface)]">Favorites</span>
                </div>
                <div className="px-4 py-3 flex items-center gap-4 hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer transition-colors group">
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]">history</span>
                  <span className="text-sm text-[var(--md-sys-color-on-surface)]">Recent assessments</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
