import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { validateChineseIdCard, validateEmail } from './validationUtils';

export interface RegisterIdentityData {
  idCardNumber: string;
  email: string;
}

export interface RegisterIdentityProps {
  initialData?: Partial<RegisterIdentityData>;
  expectedBirthDate?: string;
  expectedGender?: string;
  onBack: () => void;
  onProceed: (data: RegisterIdentityData) => void;
  isLoading?: boolean;
}

export function RegisterIdentity({
  initialData,
  expectedBirthDate,
  expectedGender,
  onBack,
  onProceed,
  isLoading = false,
}: RegisterIdentityProps) {
  const [idCardNumber, setIdCardNumber] = React.useState(initialData?.idCardNumber || '');
  const [email, setEmail] = React.useState(initialData?.email || '');

  const [idCardError, setIdCardError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    let hasError = false;

    const idCardValidation = validateChineseIdCard(idCardNumber, expectedBirthDate, expectedGender);
    if (!idCardValidation.isValid) {
      setIdCardError(idCardValidation.error || '请输入有效的身份证号');
      hasError = true;
    } else {
      setIdCardError('');
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '请输入有效的电子邮箱');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) {
      return;
    }

    onProceed({
      idCardNumber: idCardNumber.trim().toUpperCase(),
      email: email.trim(),
    });
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
            基本信息
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            输入您的身份证号和电子邮箱
          </p>
        </div>
      </div>

      {/* Right Column: ID Card & Email Inputs */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full space-y-6"
          >
            <div className="space-y-4">
              {/* ID Card Number Input */}
              <div>
                <md-outlined-text-field
                  label="身份证号"
                  maxLength={18}
                  value={idCardNumber}
                  className="w-full"
                  error={!!idCardError}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setIdCardNumber(target.value);
                    if (idCardError) setIdCardError('');
                  }}
                />
                {idCardError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{idCardError}</span>
                  </div>
                )}
              </div>

              {/* Email Input */}
              <div>
                <md-outlined-text-field
                  label="电子邮箱"
                  type="email"
                  maxLength={64}
                  value={email}
                  className="w-full"
                  error={!!emailError}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setEmail(target.value);
                    if (emailError) setEmailError('');
                  }}
                />
                {emailError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{emailError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-auto">
              <TertiaryButton
                label="返回"
                onClick={onBack}
                noCollapse
              />
              <PrimaryButton
                label={isLoading ? "处理中..." : "下一步"}
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
