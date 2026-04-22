import * as React from 'react';
import { AccountMenu } from './AccountMenu';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  searchPlaceholder?: string;
}

export function Header({ searchPlaceholder = "Search students and referrals" }: HeaderProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const themeMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen]);

  return (
    <header className="h-16 flex items-center justify-between pr-1 bg-transparent">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-2xl bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] rounded-full px-4 py-3 flex items-center gap-3 focus-within:bg-[var(--md-sys-color-surface-container)] transition-colors">
        <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)]">search</span>
        <input 
          type="text" 
          placeholder={searchPlaceholder} 
          className="bg-transparent outline-none border-none ring-0 flex-1 placeholder:text-[var(--md-sys-color-on-surface-variant)] text-[var(--md-sys-color-on-surface)] text-sm placeholder:font-light font-light"
        />
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center ml-4">
        <div className="mx-1 flex items-center">
          <md-icon-button aria-label="Help">
            <md-icon>help</md-icon>
          </md-icon-button>
        </div>
        
        {/* Settings Menu */}
        <div className="relative flex items-center mx-1" ref={themeMenuRef}>
          <md-icon-button aria-label="Settings" onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} title="Settings">
            <md-icon>settings</md-icon>
          </md-icon-button>
          
          {isThemeMenuOpen && (
            <div className="absolute top-12 right-0 w-56 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-xl shadow-lg z-50 py-2 border border-[var(--md-sys-color-outline-variant)] border-opacity-30">
              <div className="px-4 py-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                Theme
              </div>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--md-sys-color-surface-variant)] transition-colors ${theme === 'light' ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : ''}`}
                onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
              >
                <span className="material-symbols-outlined text-lg">light_mode</span>
                <span className="text-sm font-medium">Light</span>
              </button>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--md-sys-color-surface-variant)] transition-colors ${theme === 'dark' ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : ''}`}
                onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
              >
                <span className="material-symbols-outlined text-lg">dark_mode</span>
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[var(--md-sys-color-surface-variant)] transition-colors ${theme === 'system' ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' : ''}`}
                onClick={() => { setTheme('system'); setIsThemeMenuOpen(false); }}
              >
                <span className="material-symbols-outlined text-lg">brightness_auto</span>
                <span className="text-sm font-medium">Device default</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile & Account Menu */}
        <div className="relative flex items-center w-10 h-10 justify-center mx-1">
          <div 
            className="w-8 h-8 rounded-full bg-[#E47035] text-white flex items-center justify-center text-sm font-medium cursor-pointer shadow-sm hover:opacity-90 ring-2 ring-transparent hover:ring-[var(--md-sys-color-outline-variant)] transition-all shrink-0" 
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} 
            title="Google Account"
          >
            D
          </div>

          <AccountMenu 
            isOpen={isAccountMenuOpen} 
            onClose={() => setIsAccountMenuOpen(false)} 
          />
        </div>
      </div>
    </header>
  );
}
