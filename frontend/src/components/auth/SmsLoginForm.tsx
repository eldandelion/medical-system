import * as React from 'react';
import { OutlinedButton, PrimaryButton, TertiaryButton } from '../common/Buttons';
import { authApi, LoginResponseDto, SmsOtpPurpose } from '../../api/auth';
import { ApiError } from '../../api/client';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_VALID_HINT = '验证码已发送，5 分钟内有效';
const PHONE_PATTERN = /^1[3-9]\d{9}$/;
const CODE_PATTERN = /^\d{6}$/;

export interface SmsLoginFormProps {
  onBackToPassword: () => void;
  onLoginSuccess: (result: LoginResponseDto) => void;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function isPhoneAccountError(err: unknown, msg: string): boolean {
  if (err instanceof ApiError && (err.status === 404 || err.status === 401 || err.status === 429)) {
    return true;
  }
  return msg.includes('尚未登记') || msg.includes('尚未激活') || msg.includes('已被禁用');
}

/**
 * SMS one-time-code login form (phone + send code + login).
 *
 * Calls /api/auth/send-code and /api/auth/login-sms directly (atomically verifying and
 * consuming the OTP). Cooldown (60s resend countdown), TTL and lockout/attempt errors
 * surface the backend's messages directly. The mock devCode hint is rendered only in
 * dev builds (import.meta.env.DEV) AND only when the backend actually returned one.
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

  const isMountedRef = React.useRef(true);
  const isSendingRef = React.useRef(false);
  const isLoggingInRef = React.useRef(false);
  const sendAbortRef = React.useRef<AbortController | null>(null);
  const loginAbortRef = React.useRef<AbortController | null>(null);

  const isDevBuild = import.meta.env.DEV;
  const isCountingDown = countdown > 0;

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      sendAbortRef.current?.abort();
      loginAbortRef.current?.abort();
    };
  }, []);

  React.useEffect(() => {
    if (!isCountingDown) return undefined;
    const timer = setInterval(() => {
      setCountdown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCountingDown]);

  const handleBack = () => {
    sendAbortRef.current?.abort();
    loginAbortRef.current?.abort();
    onBackToPassword();
  };

  const handleSendCode = async () => {
    if (isSendingRef.current || countdown > 0) return;
    const trimmed = phone.trim();
    if (!PHONE_PATTERN.test(trimmed)) {
      setPhoneError('请输入正确的中国大陆手机号（11位）');
      return;
    }

    sendAbortRef.current?.abort();
    const controller = new AbortController();
    sendAbortRef.current = controller;

    setPhoneError('');
    setCodeError('');
    setInfoMessage('');
    setDevCode(null);
    isSendingRef.current = true;
    setIsSending(true);
    try {
      const res = await authApi.sendSmsCode(trimmed, 'LOGIN' as SmsOtpPurpose, controller.signal);
      if (!isMountedRef.current || controller.signal.aborted) return;
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage(OTP_VALID_HINT);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
    } catch (err: unknown) {
      if (!isMountedRef.current || controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        return;
      }
      setPhoneError(errorMessage(err, '验证码发送失败，请稍后重试'));
    } finally {
      isSendingRef.current = false;
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  };

  const handleLogin = async () => {
    if (isLoggingInRef.current) return;
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
    if (!CODE_PATTERN.test(trimmedCode)) {
      setCodeError('请输入 6 位数字验证码');
      return;
    }

    loginAbortRef.current?.abort();
    const controller = new AbortController();
    loginAbortRef.current = controller;

    setPhoneError('');
    setCodeError('');
    isLoggingInRef.current = true;
    setIsLoggingIn(true);
    try {
      const loginRes = await authApi.loginWithSms(trimmedPhone, trimmedCode, controller.signal);
      if (!isMountedRef.current || controller.signal.aborted) return;
      onLoginSuccess(loginRes);
    } catch (err: unknown) {
      if (!isMountedRef.current || controller.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        return;
      }
      const msg = errorMessage(err, '登录失败，请检查验证码后重试');
      if (isPhoneAccountError(err, msg)) {
        setPhoneError(msg);
      } else {
        setCodeError(msg);
      }
    } finally {
      isLoggingInRef.current = false;
      if (isMountedRef.current) {
        setIsLoggingIn(false);
      }
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
            maxLength={11}
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
            maxLength={6}
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
          <OutlinedButton
            data-testid="sms-send-code-button"
            label={countdown > 0 ? `${countdown}s后重发` : isSending ? '发送中...' : '发送验证码'}
            onClick={handleSendCode}
            disabled={isSending || countdown > 0}
            noCollapse
            className="h-[56px] shrink-0"
            style={{
              '--md-outlined-button-container-height': '56px',
              '--md-outlined-button-container-shape': '12px',
            } as React.CSSProperties}
          />
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
      </div>

      <div className="flex items-center justify-end gap-3 pt-8 mt-auto">
        <TertiaryButton
          data-testid="sms-back-to-password"
          label="使用密码登录"
          onClick={handleBack}
          noCollapse
        />
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
