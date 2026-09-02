import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { validatePassword, evaluatePasswordStrength } from './validationUtils';
import { Check, X } from 'lucide-react';

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

  const strength = React.useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

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

  const getStrengthBarColor = () => {
    if (strength.score <= 1) return 'bg-rose-500';
    if (strength.score === 2) return 'bg-amber-500';
    if (strength.score === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (!password) return '';
    if (strength.score <= 1) return '弱';
    if (strength.score === 2) return '中等';
    if (strength.score === 3) return '良好';
    return '强';
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
            为您的账号设置一个安全的登录密码
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
            className="flex flex-col justify-between h-full space-y-4"
          >
            <div className="space-y-3">
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    <span>密码强度</span>
                    <span className="font-medium">{getStrengthText()}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          strength.score >= step
                            ? getStrengthBarColor()
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs pt-1.5 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      {strength.checks.minLength ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={strength.checks.minLength ? 'text-slate-700 dark:text-slate-200' : ''}>
                        8-64 个字符
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {strength.checks.hasLetter ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={strength.checks.hasLetter ? 'text-slate-700 dark:text-slate-200' : ''}>
                        包含英文字母
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {strength.checks.hasDigit ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={strength.checks.hasDigit ? 'text-slate-700 dark:text-slate-200' : ''}>
                        包含数字
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {strength.checks.hasSpecial ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className={strength.checks.hasSpecial ? 'text-slate-700 dark:text-slate-200' : ''}>
                        包含特殊符号
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password Input */}
              <div className="pt-1">
                <md-outlined-text-field
                  label="确认密码"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={64}
                  value={confirmPassword}
                  className="w-full"
                  error={!!errorMessage || undefined}
                  error-text={errorMessage || undefined}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setConfirmPassword(target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                >
                  {errorMessage && <span slot="error-text">{errorMessage}</span>}
                </md-outlined-text-field>
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
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-auto">
              <TertiaryButton
                label="返回"
                onClick={onBack}
                noCollapse
              />
              <PrimaryButton
                label={isLoading ? "正在提交..." : "提交注册"}
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
