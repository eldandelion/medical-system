import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AccountMenu } from './AccountMenu';
import { LoginOverlay } from '../auth/LoginOverlay';
import { useTheme } from '../../contexts/ThemeContext';
import { GlobalSearch } from './GlobalSearch';
import { useAuth, type Role } from '../../contexts/AuthContext';
import { UserProfileDto } from '../../types';

interface HeaderProps {
  searchPlaceholder?: string;
  onProfileClick?: () => void;
}

const ROLE_OPTIONS: { role: Role; label: string; icon: string }[] = [
  { role: 'student',          label: '学生',    icon: 'school' },
  { role: 'teacher',          label: '教师',    icon: 'person_book' },
  { role: 'head-councillor',  label: '主任咨询师', icon: 'supervisor_account' },
  { role: 'trial-admin',      label: '试点管理员', icon: 'manage_accounts' },
  { role: 'doctor',           label: '医生',    icon: 'stethoscope' },
  { role: 'admin',            label: '系统管理员', icon: 'admin_panel_settings' },
];

export function Header({ searchPlaceholder, onProfileClick }: HeaderProps) {
  const { session, setRole } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = React.useState(false);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const { data: userProfile } = useQuery<UserProfileDto | null>({
    queryKey: ['/api/user/profile', session?.token],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/user/profile`.replace('//api', '/api'), {
          headers: {
            'Authorization': `Bearer ${session?.token || ''}`,
          },
        });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: !!session?.token,
    retry: false,
  });

  const displayAvatarInitial = userProfile?.avatarInitial || userProfile?.name?.charAt(0) || '李';
  const displayAvatarBg = userProfile?.avatarBg || '#E47035';
  const displayTitle = userProfile?.name ? `${userProfile.name} 的账号` : '个人账号';

  const currentRoleOption = ROLE_OPTIONS.find(o => o.role === session.role) ?? ROLE_OPTIONS[0];

  return (
    <header className="h-16 flex items-center justify-between pr-1 bg-transparent relative z-50">
      <GlobalSearch placeholder={searchPlaceholder} />

      {/* Role Switcher — right after search bar */}
      <div className="relative flex items-center ml-3 shrink-0">
        <button
          id="role-switcher-anchor"
          onClick={() => setIsRoleMenuOpen(v => !v)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-medium hover:brightness-95 transition-all shrink-0"
          title="切换账号类型"
        >
          <span className="material-symbols-outlined text-base leading-none">{currentRoleOption.icon}</span>
          <span>{currentRoleOption.label}</span>
          <span className="material-symbols-outlined text-base leading-none opacity-70">
            {isRoleMenuOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        <md-menu
          anchor="role-switcher-anchor"
          open={isRoleMenuOpen}
          onClosed={() => setIsRoleMenuOpen(false)}
          quick
          style={{
            minWidth: '180px',
            '--md-menu-item-focus-outline-width': '0',
            '--md-menu-item-selected-outline-width': '0',
          } as React.CSSProperties}
        >
          <div className="px-4 py-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
            切换角色
          </div>
          {ROLE_OPTIONS.map(({ role, label, icon }) => (
            <md-menu-item
              key={role}
              onClick={() => { setRole(role); setIsRoleMenuOpen(false); }}
              style={{ '--md-focus-ring-color': 'transparent' } as React.CSSProperties}
            >
              <md-icon slot="start">{icon}</md-icon>
              <div slot="headline" style={{ whiteSpace: 'nowrap' }}>{label}</div>
              {session.role === role && (
                <md-icon slot="end" style={{ color: 'var(--md-sys-color-primary)', fontSize: '20px' }}>check</md-icon>
              )}
            </md-menu-item>
          ))}
        </md-menu>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center ml-2">
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
            className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium cursor-pointer shadow-sm hover:opacity-90 ring-2 ring-transparent hover:ring-[var(--md-sys-color-outline-variant)] transition-all shrink-0"
            style={{ backgroundColor: displayAvatarBg }}
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            title={displayTitle}
          >
            {displayAvatarInitial}
          </div>

          <AccountMenu
            isOpen={isAccountMenuOpen}
            onClose={() => setIsAccountMenuOpen(false)}
            onProfileClick={onProfileClick}
            onAddAccountClick={() => {
              setIsAccountMenuOpen(false);
              setIsLoginOpen(true);
            }}
            onLogout={() => {
              setIsAccountMenuOpen(false);
              setIsLoginOpen(true);
            }}
            userProfile={userProfile}
          />
        </div>
      </div>

      <LoginOverlay
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          setIsLoginOpen(false);
        }}
      />
    </header>
  );
}
