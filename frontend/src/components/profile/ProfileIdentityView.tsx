import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileIdentityViewProps {
  ethnicity: string;
  idCardNumber: string;
  onSave: (data: { ethnicity: string; idCardNumber: string }) => void;
  onCancel?: () => void;
}

export function ProfileIdentityView({
  ethnicity = '汉族',
  idCardNumber = '110101200301011234',
  onSave,
  onCancel,
}: ProfileIdentityViewProps) {
  const [currentEthnicity, setCurrentEthnicity] = React.useState(ethnicity);
  const [currentIdCardNumber, setCurrentIdCardNumber] = React.useState(idCardNumber);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    setCurrentEthnicity(ethnicity);
    setCurrentIdCardNumber(idCardNumber);
  }, [ethnicity, idCardNumber]);


  const handleSave = () => {
    if (!currentEthnicity.trim()) {
      setErrorMessage('请输入您的民族');
      return;
    }
    if (!currentIdCardNumber.trim()) {
      setErrorMessage('请输入您的身份证号');
      return;
    }
    setErrorMessage('');
    onSave({
      ethnicity: currentEthnicity.trim(),
      idCardNumber: currentIdCardNumber.trim(),
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        民族与居民身份证号码用于平台实名认证、医疗档案建档及临床身份核实。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          身份与民族特征
        </h2>

        <div className="space-y-4">
          <md-outlined-text-field
            label="民族"
            placeholder="例如：汉族"
            className="w-full"
            value={currentEthnicity}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCurrentEthnicity(target.value);
              if (errorMessage) setErrorMessage('');
            }}
          >
            <md-icon slot="leading-icon">public</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="身份证号码"
            placeholder="例如：110101200301011234"
            maxLength={18}
            className="w-full"
            value={currentIdCardNumber}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setCurrentIdCardNumber(target.value);
              if (errorMessage) setErrorMessage('');
            }}
          >
            <md-icon slot="leading-icon">badge</md-icon>
          </md-outlined-text-field>
        </div>

        {errorMessage && (
          <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1.5 pt-1">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMessage}
          </div>
        )}

        {/* Privacy Note */}
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            谁可以看到您的身份认证信息
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">verified_user</span>
            <span>
              身份证号码等敏感身份信息经过平台端到端加密存储，仅在医疗转诊建档与法定身份核验时对授权人员可见。
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
