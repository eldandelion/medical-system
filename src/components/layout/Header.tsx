import * as React from 'react'; // Re-indexing trigger
import { AccountMenu } from './AccountMenu';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  searchPlaceholder?: string;
}

export function Header({ searchPlaceholder = "Search students and referrals" }: HeaderProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 flex items-center justify-between pr-1 bg-transparent relative z-50">
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
        <div className="relative flex items-center mx-1">
          <md-icon-button
            id="settings-anchor"
            aria-label="Settings"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            title="Settings"
          >
            <md-icon>settings</md-icon>
          </md-icon-button>

          <md-menu 
            anchor="settings-anchor" 
            open={isThemeMenuOpen} 
            onClosed={() => setIsThemeMenuOpen(false)}
            quick
            style={{ 
              minWidth: '180px',
              '--md-menu-item-focus-outline-width': '0',
              '--md-menu-item-selected-outline-width': '0'
            } as React.CSSProperties}
          >
            <div className="px-4 py-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              主题模式
            </div>
            <md-menu-item 
              onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }}
              style={{ '--md-focus-ring-color': 'transparent' } as React.CSSProperties}
            >
              <md-icon slot="start">light_mode</md-icon>
              <div slot="headline" style={{ whiteSpace: 'nowrap' }}>浅色模式</div>
              {theme === 'light' && <md-icon slot="end" style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}>check</md-icon>}
            </md-menu-item>
            <md-menu-item 
              onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }}
              style={{ '--md-focus-ring-color': 'transparent' } as React.CSSProperties}
            >
              <md-icon slot="start">dark_mode</md-icon>
              <div slot="headline" style={{ whiteSpace: 'nowrap' }}>深色模式</div>
              {theme === 'dark' && <md-icon slot="end" style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}>check</md-icon>}
            </md-menu-item>
            <md-menu-item 
              onClick={() => { setTheme('system'); setIsThemeMenuOpen(false); }}
              style={{ '--md-focus-ring-color': 'transparent' } as React.CSSProperties}
            >
              <md-icon slot="start">brightness_auto</md-icon>
              <div slot="headline" style={{ whiteSpace: 'nowrap' }}>跟随系统</div>
              {theme === 'system' && <md-icon slot="end" style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}>check</md-icon>}
            </md-menu-item>
          </md-menu>
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
