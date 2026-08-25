import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface LoginOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialIdentifier?: string;
}

export function CsuLogo() {
  return (
    <div className="flex items-center">
      <span className="text-[28px] font-bold text-[var(--md-sys-color-primary)] tracking-tight">CSU</span>
    </div>
  );
}

export function LoginOverlay({
  isOpen,
  onClose,
  onSuccess,
  initialIdentifier = 'warfacealpine10@gmail.com',
}: LoginOverlayProps) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [identifier, setIdentifier] = React.useState(initialIdentifier);
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [identifierError, setIdentifierError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIdentifier(initialIdentifier);
      setPassword('');
      setShowPassword(false);
      setIdentifierError('');
      setPasswordError('');
    }
  }, [isOpen, initialIdentifier]);

  // Handle keyboard shortcuts (Escape to close)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleStep1Submit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!identifier.trim()) {
      setIdentifierError('请输入电子邮件地址或学工号');
      return;
    }
    setIdentifierError('');
    setPasswordError('');
    setPassword('');
    setStep(2);
  };

  const handleStep2Submit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!password.trim()) {
      setPasswordError('请输入密码');
      return;
    }
    setPasswordError('');
    onSuccess?.();
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] overflow-y-auto"
        >
          {/* Main Card Container */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="relative w-full max-w-[1040px] min-h-[440px] bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-on-surface)] rounded-[28px] p-8 sm:p-10 md:p-12 shadow-sm flex flex-col justify-between"
          >
            {/* Two-Column Step Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-1">
              {/* Left Column */}
              <div className="flex flex-col justify-start">
                <div className="h-[32px] flex items-center">
                  <CsuLogo />
                </div>

                {step === 1 ? (
                  <div className="mt-6">
                    <h1 className="text-[36px] leading-[44px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
                      登录
                    </h1>
                    <p className="text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-3 font-normal">
                      使用您的CSU账号
                    </p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <h1 className="text-[36px] leading-[44px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
                      欢迎
                    </h1>
                    {/* Account Indicator Chip */}
                    <div
                      className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--md-sys-color-outline-variant)] text-[14px] font-medium text-[var(--md-sys-color-on-surface)] select-none max-w-full text-left"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] shrink-0">
                        account_circle
                      </span>
                      <span className="truncate max-w-[260px] sm:max-w-[300px]">
                        {identifier || 'warfacealpine10@gmail.com'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="flex flex-col justify-between h-full">
                {/* Spacer to align right form horizontally with left title section */}
                <div className="hidden md:flex h-[32px] items-center" />

                <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
                  {step === 1 ? (
                    /* Step 1 Form */
                    <form
                      key="step1-form"
                      onSubmit={handleStep1Submit}
                      className="flex flex-col justify-between h-full space-y-6"
                    >
                      <div className="space-y-2">
                        <div>
                          <md-outlined-text-field
                            label="电子邮件或学工号"
                            value={identifier}
                            className="w-full"
                            error={!!identifierError}
                            onInput={(e: React.SyntheticEvent) => {
                              const target = e.target as HTMLInputElement;
                              setIdentifier(target.value);
                              if (identifierError) setIdentifierError('');
                            }}
                          />
                          {identifierError && (
                            <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                              <span className="material-symbols-outlined text-[16px]">error</span>
                              <span>{identifierError}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {}}
                            className="text-[14px] font-medium text-[var(--md-sys-color-primary)] hover:underline transition-colors"
                          >
                            忘记了电子邮件地址？
                          </button>
                        </div>
                      </div>

                      {/* Step 1 Action Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-8 mt-auto">
                        <TertiaryButton
                          label="创建账号"
                          onClick={() => {}}
                          noCollapse
                        />
                        <PrimaryButton
                          label="下一步"
                          onClick={() => handleStep1Submit()}
                          noCollapse
                          className="px-6 rounded-full"
                        />
                      </div>
                    </form>
                  ) : (
                    /* Step 2 Form */
                    <form
                      key="step2-form"
                      onSubmit={handleStep2Submit}
                      className="flex flex-col justify-between h-full space-y-6"
                    >
                      <div className="space-y-3">
                        <p className="text-[16px] text-[var(--md-sys-color-on-surface)] font-normal">
                          如要继续，请先验证您的身份
                        </p>

                        <div>
                          <md-outlined-text-field
                            label="输入您的密码"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            className="w-full"
                            error={!!passwordError}
                            onInput={(e: React.SyntheticEvent) => {
                              const target = e.target as HTMLInputElement;
                              setPassword(target.value);
                              if (passwordError) setPasswordError('');
                            }}
                          />
                          {passwordError && (
                            <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                              <span className="material-symbols-outlined text-[16px]">error</span>
                              <span>{passwordError}</span>
                            </div>
                          )}
                        </div>

                        {/* Show password checkbox */}
                        <label
                          className="flex items-center gap-2 pt-1 cursor-pointer select-none text-[14px] text-[var(--md-sys-color-on-surface)] w-fit"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowPassword(!showPassword);
                          }}
                        >
                          <md-checkbox
                            aria-label="显示密码"
                            checked={showPassword || undefined}
                            touch-target="none"
                          />
                          <span>显示密码</span>
                        </label>
                      </div>

                      {/* Step 2 Action Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-8 mt-auto">
                        <TertiaryButton
                          label="使用其他账号"
                          onClick={() => setStep(1)}
                          noCollapse
                        />
                        <PrimaryButton
                          label="下一步"
                          onClick={() => handleStep2Submit()}
                          noCollapse
                          className="px-6 rounded-full"
                        />
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
