import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { type RegisterRole } from './RegisterRoleSelect';

export interface RegisterBasicInfoProps {
  role?: RegisterRole | null;
  initialName?: string;
  initialGender?: string;
  onBack: () => void;
  onProceed: (data: { name: string; gender: string }) => void;
  isLoading?: boolean;
}

export function RegisterBasicInfo({
  role: _role,
  initialName = '',
  initialGender = '',
  onBack,
  onProceed,
  isLoading = false,
}: RegisterBasicInfoProps) {
  const [name, setName] = React.useState(initialName);
  const [gender, setGender] = React.useState(initialGender);
  const [nameError, setNameError] = React.useState('');
  const [genderError, setGenderError] = React.useState('');

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    let hasError = false;
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError('请输入姓名');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!gender) {
      setGenderError('请选择性别');
      hasError = true;
    } else {
      setGenderError('');
    }

    if (hasError) return;

    onProceed({
      name: trimmedName,
      gender,
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
            输入您的姓名和性别
          </p>
        </div>
      </div>

      {/* Right Column: Name & Gender Material Design Inputs */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full space-y-6"
          >
            <div className="space-y-4">
              {/* Name Input Field */}
              <div>
                <md-outlined-text-field
                  label="姓名"
                  value={name}
                  className="w-full"
                  error={!!nameError}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setName(target.value);
                    if (nameError) setNameError('');
                  }}
                />
                {nameError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              {/* Gender Input Field */}
              <div>
                <md-outlined-select
                  label="性别"
                  className="w-full"
                  value={gender}
                  error={!!genderError || undefined}
                  onChange={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLSelectElement;
                    setGender(target.value);
                    if (genderError) setGenderError('');
                  }}
                >
                  <md-select-option value="男">
                    <div slot="headline">男</div>
                  </md-select-option>
                  <md-select-option value="女">
                    <div slot="headline">女</div>
                  </md-select-option>
                </md-outlined-select>
                {genderError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{genderError}</span>
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
