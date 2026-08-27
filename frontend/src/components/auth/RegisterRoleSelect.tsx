import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';

export type RegisterRole = 'student' | 'teacher' | 'head-councillor' | 'trial-admin' | 'doctor';

export interface RegisterRoleOption {
  role: RegisterRole;
  label: string;
  icon: string;
}

export const REGISTRATION_ROLES: RegisterRoleOption[] = [
  {
    role: 'student',
    label: '学生',
    icon: 'school',
  },
  {
    role: 'teacher',
    label: '教师',
    icon: 'person_book',
  },
  {
    role: 'head-councillor',
    label: '主任咨询师',
    icon: 'supervisor_account',
  },
  {
    role: 'trial-admin',
    label: '医院分诊管理员',
    icon: 'local_hospital',
  },
  {
    role: 'doctor',
    label: '精神科医生',
    icon: 'stethoscope',
  },
];

export interface RegisterRoleSelectProps {
  selectedRole?: RegisterRole | null;
  onSelectRole: (role: RegisterRole) => void;
  onBackToLogin: () => void;
  onProceed: (role: RegisterRole) => void;
  isLoading?: boolean;
}

export function RegisterRoleSelect({
  selectedRole,
  onSelectRole,
  onBackToLogin,
  onProceed,
  isLoading = false,
}: RegisterRoleSelectProps) {
  const [currentSelected, setCurrentSelected] = React.useState<RegisterRole | null>(
    selectedRole ?? null
  );

  React.useEffect(() => {
    if (selectedRole !== undefined) {
      setCurrentSelected(selectedRole);
    }
  }, [selectedRole]);

  const handleCardClick = (role: RegisterRole) => {
    setCurrentSelected(role);
    onSelectRole(role);
  };

  const handleKeyDown = (e: React.KeyboardEvent, role: RegisterRole) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCardClick(role);
    }
  };

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentSelected) {
      onProceed(currentSelected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-1 w-full"
    >
      {/* Left Column: Branding */}
      <div className="flex flex-col justify-start">
        <div className="h-[32px] flex items-center">
          <CsuLogo />
        </div>

        <div className="mt-6">
          <h1 className="text-[32px] sm:text-[36px] leading-[40px] sm:leading-[44px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
            创建账号
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            选择您的身份类型以继续注册
          </p>
        </div>
      </div>

      {/* Right Column: Role Selection List & Action Buttons */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          {/* Flat role list separated strictly by horizontal divider lines (no top/bottom border) */}
          <div
            role="listbox"
            aria-label="选择身份类型"
            className="divide-y divide-[var(--md-sys-color-outline-variant)]/40 max-h-[380px] overflow-y-auto focus:outline-none"
          >
            {REGISTRATION_ROLES.map((opt) => {
              const isSelected = currentSelected === opt.role;

              return (
                <div
                  key={opt.role}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => handleCardClick(opt.role)}
                  onKeyDown={(e) => handleKeyDown(e, opt.role)}
                  className={`group relative flex items-center justify-between px-4 py-4.5 min-h-[58px] transition-colors duration-150 cursor-pointer select-none text-left focus:outline-none focus-visible:bg-[var(--md-sys-color-surface-container-high)] ${
                    isSelected
                      ? 'bg-[var(--md-sys-color-secondary-container)]/50'
                      : 'hover:bg-[var(--md-sys-color-surface-container-high)]/40'
                  }`}
                >
                  {/* Left: Role Icon & Label */}
                  <div className="flex items-center min-w-0 flex-1 pr-3">
                    <span
                      className={`material-symbols-outlined text-[22px] shrink-0 transition-colors ${
                        isSelected
                          ? 'text-[var(--md-sys-color-primary)]'
                          : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]'
                      }`}
                    >
                      {opt.icon}
                    </span>

                    <span
                      className={`ml-3.5 text-[15px] font-medium leading-snug ${
                        isSelected
                          ? 'text-[var(--md-sys-color-on-secondary-container)] font-semibold'
                          : 'text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>

                  {/* Right: Selected checkmark indicator */}
                  {isSelected && (
                    <div className="shrink-0 pl-2 flex items-center">
                      <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">
                        check
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-4">
            <TertiaryButton
              label="返回登录"
              onClick={onBackToLogin}
              noCollapse
            />
            <PrimaryButton
              label={isLoading ? "处理中..." : "下一步"}
              onClick={handleSubmit}
              disabled={!currentSelected || isLoading}
              noCollapse
              className="px-6 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
