import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { type RegisterRole } from './RegisterRoleSelect';
import {
  validateName,
  validateChineseIdCard,
  extractDobAndGenderFromIdCard,
} from './validationUtils';

export interface RegisterBasicInfoProps {
  role?: RegisterRole | null;
  initialName?: string;
  initialGender?: string;
  initialIdCardNumber?: string;
  onBack: () => void;
  onProceed: (data: { name: string; gender: string; idCardNumber: string }) => void;
  onAutoFillDemographics?: (data: { birthDate: string; gender: string }) => void;
  isLoading?: boolean;
}

export function RegisterBasicInfo({
  role: _role,
  initialName = '',
  initialGender = '',
  initialIdCardNumber = '',
  onBack,
  onProceed,
  onAutoFillDemographics,
  isLoading = false,
}: RegisterBasicInfoProps) {
  const [name, setName] = React.useState(initialName);
  const [gender, setGender] = React.useState(initialGender);
  const [idCardNumber, setIdCardNumber] = React.useState(initialIdCardNumber);

  const [nameError, setNameError] = React.useState('');
  const [genderError, setGenderError] = React.useState('');
  const [idCardError, setIdCardError] = React.useState('');

  const handleIdCardInput = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    const upperValue = target.value.toUpperCase();
    setIdCardNumber(upperValue);
    if (idCardError) setIdCardError('');

    if (upperValue.length === 18) {
      const extracted = extractDobAndGenderFromIdCard(upperValue);
      if (extracted) {
        if (!gender || gender !== extracted.gender) {
          setGender(extracted.gender);
          if (genderError) setGenderError('');
        }
        if (onAutoFillDemographics) {
          onAutoFillDemographics({
            birthDate: extracted.birthDate,
            gender: extracted.gender,
          });
        }
      }
    }
  };

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    let hasError = false;
    const nameValidation = validateName(name);

    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || '请输入姓名');
      hasError = true;
    } else {
      setNameError('');
    }

    const idCardValidation = validateChineseIdCard(idCardNumber, undefined, gender);
    if (!idCardValidation.isValid) {
      setIdCardError(idCardValidation.error || '请输入有效的身份证号');
      hasError = true;
    } else {
      setIdCardError('');
    }

    if (!gender) {
      setGenderError('请选择性别');
      hasError = true;
    } else {
      setGenderError('');
    }

    if (hasError) return;

    onProceed({
      name: name.trim(),
      gender,
      idCardNumber: idCardNumber.trim().toUpperCase(),
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
            基本信息
          </h1>
          <p className="text-[15px] sm:text-[16px] leading-[24px] text-[var(--md-sys-color-on-surface-variant)] mt-2.5 font-normal">
            输入您的姓名、身份证号和性别
          </p>
        </div>
      </div>

      {/* Right Column: Name, ID Card & Gender Material Design Inputs */}
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
                  maxLength={30}
                  value={name}
                  className="w-full"
                  error={!!nameError || undefined}
                  error-text={nameError || undefined}
                  onInput={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLInputElement;
                    setName(target.value);
                    if (nameError) setNameError('');
                  }}
                >
                  {nameError && <span slot="error-text">{nameError}</span>}
                </md-outlined-text-field>
              </div>

              {/* ID Card Number Input Field */}
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

              {/* Gender Input Field */}
              <div>
                <md-outlined-select
                  label="性别"
                  className="w-full"
                  value={gender}
                  error={!!genderError || undefined}
                  error-text={genderError || undefined}
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
                  {genderError && <span slot="error-text">{genderError}</span>}
                </md-outlined-select>
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
