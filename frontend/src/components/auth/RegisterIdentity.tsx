import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import {
  validateChineseIdCard,
  validateEmail,
  validateOtp,
  isDisposableEmail,
  extractDobAndGenderFromIdCard,
} from './validationUtils';
import { authApi } from '../../api/auth';

export interface RegisterIdentityData {
  idCardNumber: string;
  email: string;
  emailOtp: string;
}

export interface RegisterIdentityProps {
  initialData?: Partial<RegisterIdentityData>;
  expectedBirthDate?: string;
  expectedGender?: string;
  onBack: () => void;
  onProceed: (data: RegisterIdentityData) => void;
  onAutoFillDemographics?: (data: { birthDate: string; gender: string }) => void;
  isLoading?: boolean;
}

export function RegisterIdentity({
  initialData,
  expectedBirthDate,
  expectedGender,
  onBack,
  onProceed,
  onAutoFillDemographics,
  isLoading = false,
}: RegisterIdentityProps) {
  const [idCardNumber, setIdCardNumber] = React.useState(initialData?.idCardNumber || '');
  const [email, setEmail] = React.useState(initialData?.email || '');
  const [emailOtp, setEmailOtp] = React.useState(initialData?.emailOtp || '');

  const [idCardError, setIdCardError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [otpError, setOtpError] = React.useState('');

  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [otpSentSuccess, setOtpSentSuccess] = React.useState(false);

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle ID Card input changes & auto-extraction
  const handleIdCardInput = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    const upperValue = target.value.toUpperCase();
    setIdCardNumber(upperValue);
    if (idCardError) setIdCardError('');

    // Attempt auto-extraction if 18 chars
    if (upperValue.length === 18) {
      const extracted = extractDobAndGenderFromIdCard(upperValue);
      if (extracted && onAutoFillDemographics) {
        onAutoFillDemographics({
          birthDate: extracted.birthDate,
          gender: extracted.gender,
        });
      }
    }
  };

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    const emailValidation = validateEmail(trimmedEmail);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '请输入有效的电子邮箱');
      return;
    }
    if (isDisposableEmail(trimmedEmail)) {
      setEmailError('暂不支持使用临时/一次性邮箱，请输入有效的工作邮箱');
      return;
    }

    setEmailError('');
    setIsSendingOtp(true);
    try {
      const res = await authApi.sendEmailOtp(trimmedEmail);
      setCooldown(res.cooldownSeconds || 60);
      setOtpSentSuccess(true);
      setOtpError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '发送验证码失败，请稍后重试';
      setEmailError(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

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
    } else if (isDisposableEmail(email)) {
      setEmailError('暂不支持使用临时/一次性邮箱');
      hasError = true;
    } else {
      setEmailError('');
    }

    const otpValidation = validateOtp(emailOtp);
    if (!otpValidation.isValid) {
      setOtpError(otpValidation.error || '请输入6位验证码');
      hasError = true;
    } else {
      setOtpError('');
    }

    if (hasError) {
      return;
    }

    onProceed({
      idCardNumber: idCardNumber.trim().toUpperCase(),
      email: email.trim(),
      emailOtp: emailOtp.trim(),
    });
  };

  const extractedInfo = React.useMemo(() => {
    if (idCardNumber.length === 18) {
      return extractDobAndGenderFromIdCard(idCardNumber);
    }
    return null;
  }, [idCardNumber]);

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
            身份认证
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            校验您的身份证件并完成工作邮箱验证
          </p>
        </div>
      </div>

      {/* Right Column: ID Card & Email/OTP Inputs */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full space-y-5"
          >
            <div className="space-y-4">
              {/* ID Card Number Input */}
              <div>
                <md-outlined-text-field
                  label="身份证号"
                  maxLength={18}
                  value={idCardNumber}
                  className="w-full"
                  error={!!idCardError || undefined}
                  error-text={idCardError || undefined}
                  onInput={handleIdCardInput}
                >
                  {idCardError && <span slot="error-text">{idCardError}</span>}
                </md-outlined-text-field>
                {!idCardError && extractedInfo && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>已自动识别：{extractedInfo.gender}性，出生于 {extractedInfo.birthDate}</span>
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
                  error={!!emailError || undefined}
                  error-text={emailError || undefined}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setEmail(target.value);
                    if (emailError) setEmailError('');
                  }}
                >
                  {emailError && <span slot="error-text">{emailError}</span>}
                </md-outlined-text-field>
              </div>

              {/* OTP Verification Code + Send Code Button */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <md-outlined-text-field
                      label="邮箱验证码"
                      maxLength={6}
                      value={emailOtp}
                      className="w-full"
                      error={!!otpError || undefined}
                      error-text={otpError || undefined}
                      onInput={(e: React.SyntheticEvent) => {
                        const target = e.target as HTMLInputElement;
                        setEmailOtp(target.value);
                        if (otpError) setOtpError('');
                      }}
                    >
                      {otpError && <span slot="error-text">{otpError}</span>}
                    </md-outlined-text-field>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || cooldown > 0 || !email.trim()}
                    className={`h-[54px] px-4 rounded-xl text-sm font-medium transition-all shrink-0 select-none ${
                      cooldown > 0 || isSendingOtp || !email.trim()
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800'
                    }`}
                  >
                    {isSendingOtp
                      ? '正在发送...'
                      : cooldown > 0
                      ? `${cooldown} 秒后重试`
                      : '获取验证码'}
                  </button>
                </div>
                {!otpError && otpSentSuccess && (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    <span>验证码已发送至您的邮箱，5分钟内有效</span>
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
