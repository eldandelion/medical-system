import * as React from 'react';
import { PrimaryButton } from '../common/Buttons';

export interface ProfilePasswordViewProps {
  onSave: (newPassword: string) => void;
}

export function ProfilePasswordView({ onSave }: ProfilePasswordViewProps) {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage('密码长度至少需要 8 个字符');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      return;
    }
    setErrorMessage('');
    onSave(newPassword);
  };

  const isFormValid = newPassword.length >= 8 && confirmPassword.length >= 8;

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      {/* Description above card */}
      <div className="space-y-3 px-1 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
        <p>
          请选择高强度密码，不要在其他账号中重复使用。{' '}
          <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium inline-flex items-center gap-0.5">
            了解详情 <span className="material-symbols-outlined text-[14px]">help</span>
          </a>
        </p>
        <p>
          修改密码后，您可能会在部分设备上退出登录。{' '}
          <a href="#stay-signed-in" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium inline-flex items-center gap-0.5">
            了解关于保持登录状态的更多信息 <span className="material-symbols-outlined text-[14px]">help</span>
          </a>
        </p>
      </div>

      {/* Main Password Card */}
      <form onSubmit={handleSubmit} className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        {/* New Password Field */}
        <div>
          <md-outlined-text-field
            label="新密码"
            type={showNewPassword ? 'text' : 'password'}
            className="w-full"
            value={newPassword}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setNewPassword(target.value);
              if (errorMessage) setErrorMessage('');
            }}
          >
            <md-icon-button
              slot="trailing-icon"
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              <md-icon>{showNewPassword ? 'visibility_off' : 'visibility'}</md-icon>
            </md-icon-button>
          </md-outlined-text-field>
        </div>

        {/* Password Strength Note */}
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1 bg-[var(--md-sys-color-surface-container-lowest)] p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <div className="font-medium text-[var(--md-sys-color-on-surface)]">
            密码强度：
          </div>
          <p className="leading-relaxed">
            使用至少 8 个字符。不要使用来自其他网站的密码，或容易被猜到的信息（如宠物名字）。{' '}
            <a href="#why" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-0.5">
              原因 <span className="material-symbols-outlined text-[12px]">help</span>
            </a>
          </p>
        </div>

        {/* Confirm New Password Field */}
        <div>
          <md-outlined-text-field
            label="确认新密码"
            type={showConfirmPassword ? 'text' : 'password'}
            className="w-full"
            value={confirmPassword}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setConfirmPassword(target.value);
              if (errorMessage) setErrorMessage('');
            }}
          >
            <md-icon-button
              slot="trailing-icon"
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <md-icon>{showConfirmPassword ? 'visibility_off' : 'visibility'}</md-icon>
            </md-icon-button>
          </md-outlined-text-field>
        </div>

        {errorMessage && (
          <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1.5 pt-1">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMessage}
          </div>
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-end pt-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-40">
          <PrimaryButton
            label="更改密码"
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={!isFormValid}
            className="h-10 px-6"
          />
        </div>
      </form>
    </div>
  );
}
