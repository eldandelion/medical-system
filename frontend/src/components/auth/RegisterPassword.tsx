import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { validatePassword } from './validationUtils';

export interface RegisterPasswordData {
  password: string;
}

export interface RegisterPasswordProps {
  onBack: () => void;
  onProceed: (data: RegisterPasswordData) => void;
  isLoading?: boolean;
}

export function RegisterPassword({
  onBack,
  onProceed,
  isLoading = false,
}: RegisterPasswordProps) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.isValid) {
      setErrorMessage(pwdValidation.error || '请输入密码');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      return;
    }

    setErrorMessage('');
    onProceed({ password });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-1 w-full"
    >
      {/* Left Column: Branding & Overview */}
      <div className="flex flex-col justify-start">
        <div className="h-[32px] flex items-center">
          <CsuLogo />
        </div>

        <div className="mt-6">
          <h1 className="text-[32px] sm:text-[36px] leading-[40px] sm:leading-[44px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
            设置密码
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            为您的账号设置一个强密码
          </p>
        </div>
      </div>

      {/* Right Column: Password & Confirm Password Inputs */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full space-y-6"
          >
            <div className="space-y-4">
              {/* Password Input */}
              <div>
                <md-outlined-text-field
                  label="密码"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={64}
                  value={password}
                  className="w-full"
                  error={!!errorMessage}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setPassword(target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <md-outlined-text-field
                  label="确认密码"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={64}
                  value={confirmPassword}
                  className="w-full"
                  error={!!errorMessage}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setConfirmPassword(target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </div>

              {/* Show Password Toggle Checkbox */}
              <div className="pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer text-[14px] text-[var(--md-sys-color-on-surface)] select-none">
                  <md-checkbox
                    checked={showPassword}
                    onChange={(e: React.SyntheticEvent) => {
                      const target = e.target as HTMLInputElement;
                      setShowPassword(target.checked);
                    }}
                  />
                  <span>显示密码</span>
                </label>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-auto">
              <TertiaryButton
                label="返回"
                onClick={onBack}
                noCollapse
              />
              <PrimaryButton
                label={isLoading ? "正在创建..." : "创建账号"}
                onClick={handleSubmit}
                disabled={isLoading}
                noCollapse
                className="px-6 rounded-full"
              />
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
