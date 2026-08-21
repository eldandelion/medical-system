import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileContactViewProps {
  type: 'email' | 'phone';
  value: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
}

export function ProfileContactView({
  type,
  value,
  onSave,
  onCancel,
}: ProfileContactViewProps) {
  const isEmail = type === 'email';
  const [currentValue, setCurrentValue] = React.useState(value);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSave = () => {
    if (!currentValue.trim()) {
      setErrorMessage(isEmail ? '请输入有效的电子邮箱地址' : '请输入有效的手机号码');
      return;
    }
    setErrorMessage('');
    onSave(currentValue.trim());
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        {isEmail
          ? '您的电子邮箱用于接收系统安全警报、通知以及重置密码。'
          : '您的手机号码可用于接收紧急短信验证码以及关键事件通知。'}{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          {isEmail ? '电子邮箱' : '手机号码'}
        </h2>

        <div>
          <md-outlined-text-field
            label={isEmail ? '主要邮箱地址' : '主要联系电话'}
            type={isEmail ? 'email' : 'tel'}
            className="w-full"
            value={currentValue}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCurrentValue(target.value);
              if (errorMessage) setErrorMessage('');
            }}
          />
          {errorMessage && (
            <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1.5 mt-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {errorMessage}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            谁可以看到您的{isEmail ? '邮箱' : '电话'}
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">lock</span>
            <span>
              此联系方式为私密信息，仅在平台通知与安全验证时使用，不会公开展示给未授权人员。
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-40">
          {onCancel && (
            <TertiaryButton
              label="取消"
              onClick={onCancel}
              className="h-10 px-5"
            />
          )}
          <PrimaryButton
            label="保存"
            onClick={handleSave}
            className="h-10 px-6"
          />
        </div>
      </div>
    </div>
  );
}
