import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { authApi, LoginResponseDto, SmsOtpPurpose } from '../../api/auth';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_VALID_HINT = '验证码已发送，5 分钟内有效';
const PHONE_PATTERN = /^1[3-9]\d{9}$/;

export interface SmsLoginFormProps {
  onBackToPassword: () => void;
  onLoginSuccess: (result: LoginResponseDto) => void;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * SMS one-time-code login form (phone + send code + verify).
 *
 * Calls the existing backend endpoints /api/auth/send-code, /api/auth/verify-code and
 * /api/auth/login-sms. Cooldown (60s resend countdown), TTL and lockout/attempt errors
 * surface the backend's messages directly. The mock devCode hint is rendered only in
 * dev builds (import.meta.env.DEV) AND only when the backend actually returned one
 * (mock sender active); production builds never render it.
 */
export function SmsLoginForm({ onBackToPassword, onLoginSuccess }: SmsLoginFormProps) {
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [codeError, setCodeError] = React.useState('');
  const [infoMessage, setInfoMessage] = React.useState('');
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  const isDevBuild = import.meta.env.DEV;

  React.useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setInterval(() => setCountdown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    const trimmed = phone.trim();
    if (!PHONE_PATTERN.test(trimmed)) {
      setPhoneError('请输入正确的中国大陆手机号（11位）');
      return;
    }
    setPhoneError('');
    setCodeError('');
    setInfoMessage('');
    setDevCode(null);
    setIsSending(true);
    try {
      const res = await authApi.sendSmsCode(trimmed, 'LOGIN' as SmsOtpPurpose);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage(OTP_VALID_HINT);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
    } catch (err: unknown) {
      // Cooldown / rate-limit (429) / daily-quota messages from the backend pass through.
      setPhoneError(errorMessage(err, '验证码发送失败，请稍后重试'));
    } finally {
      setIsSending(false);
    }
  };

  const handleLogin = async () => {
    const trimmedPhone = phone.trim();
    const trimmedCode = code.trim();
    if (!PHONE_PATTERN.test(trimmedPhone)) {
      setPhoneError('请输入正确的中国大陆手机号（11位）');
      return;
    }
    if (!trimmedCode) {
      setCodeError('请输入验证码');
      return;
    }
    setPhoneError('');
    setCodeError('');
    setIsLoggingIn(true);
    try {
      // Pre-check without consuming, then verify + consume atomically via login-sms.
      await authApi.verifySmsCode(trimmedPhone, trimmedCode, 'LOGIN');
      const loginRes = await authApi.loginWithSms(trimmedPhone, trimmedCode);
      onLoginSuccess(loginRes);
    } catch (err: unknown) {
      // Wrong code, attempt lockout, unregistered phone, rate limits — backend messages pass through.
      setCodeError(errorMessage(err, '登录失败，请检查验证码后重试'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return (
    <div
      key="sms-login-form"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLogin();
        }
      }}
      className="flex flex-col justify-between h-full space-y-6"
    >
      <div className="space-y-2">
        <div>
          <md-outlined-text-field
            label="手机号"
            value={phone}
            className="w-full"
            inputmode="numeric"
            maxlength={11}
            error={!!phoneError || undefined}
            error-text={phoneError || undefined}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setPhone(target.value);
              if (phoneError) setPhoneError('');
            }}
          >
            {phoneError && <span slot="error-text">{phoneError}</span>}
          </md-outlined-text-field>
        </div>

        <div className="flex items-start gap-3">
          <md-outlined-text-field
            label="验证码"
            value={code}
            className="flex-1 min-w-0"
            inputmode="numeric"
            maxlength={6}
            error={!!codeError || undefined}
            error-text={codeError || undefined}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCode(target.value);
              if (codeError) setCodeError('');
            }}
          >
            {codeError && <span slot="error-text">{codeError}</span>}
          </md-outlined-text-field>
          <button
            type="button"
            data-testid="sms-send-code-button"
            onClick={handleSendCode}
            disabled={isSending || countdown > 0}
            className="shrink-0 mt-1 px-3 py-2 rounded-full text-[14px] font-medium text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countdown > 0 ? `${countdown}s后重发` : isSending ? '发送中...' : '发送验证码'}
          </button>
        </div>

        {infoMessage && (
          <p data-testid="sms-info-message" className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
            {infoMessage}
          </p>
        )}

        {/* devCode hint: dev builds only, and only when the mock sender returned a code. */}
        {isDevBuild && devCode && (
          <p
            data-testid="sms-devcode-hint"
            className="text-[13px] font-medium text-[var(--md-sys-color-primary)]"
          >
            开发模式：本次验证码为 {devCode}（仅本地 Mock 短信生效）
          </p>
        )}

        <div className="pt-1">
          <button
            type="button"
            data-testid="sms-back-to-password"
            onClick={onBackToPassword}
            className="text-[14px] font-medium text-[var(--md-sys-color-primary)] hover:underline transition-colors"
          >
            使用密码登录
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-8 mt-auto">
        <TertiaryButton label="返回密码登录" onClick={onBackToPassword} noCollapse />
        <PrimaryButton
          label={isLoggingIn ? '登录中...' : '登录'}
          onClick={handleLogin}
          disabled={isLoggingIn}
          noCollapse
          className="px-6 rounded-full"
        />
      </div>
    </div>
  );
}
