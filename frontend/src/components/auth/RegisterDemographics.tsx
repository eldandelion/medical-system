import * as React from 'react';
import { motion } from 'motion/react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { CsuLogo } from './LoginOverlay';
import { validateBirthDate, getDaysInMonth } from './validationUtils';
import { useEthnicities, STANDARD_ETHNICITY_NAMES } from '../../hooks/useEthnicities';

export const ETHNICITY_OPTIONS = STANDARD_ETHNICITY_NAMES;

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}月`,
}));

export interface RegisterDemographicsData {
  year: string;
  month: string;
  day: string;
  dateOfBirth: string; // YYYY-MM-DD
  ethnicity: string;
}

export interface RegisterDemographicsProps {
  initialData?: Partial<RegisterDemographicsData>;
  onBack: () => void;
  onProceed: (data: RegisterDemographicsData) => void;
  isLoading?: boolean;
}

export function RegisterDemographics({
  initialData,
  onBack,
  onProceed,
  isLoading = false,
}: RegisterDemographicsProps) {
  const { ethnicities } = useEthnicities();
  const [month, setMonth] = React.useState(initialData?.month || '');
  const [day, setDay] = React.useState(initialData?.day || '');
  const [year, setYear] = React.useState(initialData?.year || '');
  const [ethnicity, setEthnicity] = React.useState(initialData?.ethnicity || '');

  const [dobError, setDobError] = React.useState('');
  const [ethnicityError, setEthnicityError] = React.useState('');

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const dobValidation = validateBirthDate(year.trim(), month.trim(), day.trim());
    let isDobValid = false;

    if (!dobValidation.isValid) {
      setDobError(dobValidation.error || '请输入有效的出生日期');
    } else {
      setDobError('');
      isDobValid = true;
    }

    let isEthnicityValid = true;

    if (!ethnicity.trim()) {
      setEthnicityError('请选择民族');
      isEthnicityValid = false;
    } else {
      setEthnicityError('');
    }

    if (!isDobValid || !isEthnicityValid) {
      return;
    }

    const pad = (n: string | number) => String(n).padStart(2, '0');
    const formattedDob = `${year.trim()}-${pad(month.trim())}-${pad(day.trim())}`;

    onProceed({
      year: year.trim(),
      month: month.trim(),
      day: day.trim(),
      dateOfBirth: formattedDob,
      ethnicity: ethnicity.trim(),
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
            输入您的出生日期和民族
          </p>
        </div>
      </div>

      {/* Right Column: Date of Birth & Ethnicity Inputs */}
      <div className="flex flex-col justify-between h-full">
        {/* Alignment spacer on desktop */}
        <div className="hidden md:flex h-[32px] items-center" />

        <div className="mt-0 md:mt-6 flex flex-col justify-between flex-1">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full space-y-6"
          >
            <div className="space-y-4">
              {/* Day of Birth Section: 3 inputs in the same line */}
              <div>
                <div className="grid grid-cols-3 gap-3 w-full">
                  {/* 1. Month Dropdown */}
                  <div className="min-w-0 w-full">
                    <md-outlined-select
                      label="月"
                      className="w-full min-w-0"
                      style={{ minWidth: 0, width: '100%' } as React.CSSProperties}
                      value={month}
                      error={!!dobError || undefined}
                      onChange={(e: React.SyntheticEvent) => {
                        const target = e.target as HTMLSelectElement;
                        setMonth(target.value);
                        if (dobError) setDobError('');
                      }}
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <md-select-option key={m.value} value={m.value}>
                          <div slot="headline">{m.label}</div>
                        </md-select-option>
                      ))}
                    </md-outlined-select>
                  </div>

                  {/* 2. Day Number Input */}
                  <div className="min-w-0 w-full">
                    <md-outlined-text-field
                      label="日"
                      type="number"
                      min="1"
                      max={year && month ? String(getDaysInMonth(parseInt(year, 10), parseInt(month, 10))) : "31"}
                      className="w-full min-w-0"
                      style={{ minWidth: 0, width: '100%' } as React.CSSProperties}
                      value={day}
                      error={!!dobError}
                      onInput={(e: React.SyntheticEvent) => {
                        const target = e.target as HTMLInputElement;
                        setDay(target.value);
                        if (dobError) setDobError('');
                      }}
                    />
                  </div>

                  {/* 3. Year Number Input */}
                  <div className="min-w-0 w-full">
                    <md-outlined-text-field
                      label="年"
                      type="number"
                      min={String(new Date().getFullYear() - 100)}
                      max={String(new Date().getFullYear() - 18)}
                      className="w-full min-w-0"
                      style={{ minWidth: 0, width: '100%' } as React.CSSProperties}
                      value={year}
                      error={!!dobError}
                      onInput={(e: React.SyntheticEvent) => {
                        const target = e.target as HTMLInputElement;
                        setYear(target.value);
                        if (dobError) setDobError('');
                      }}
                    />
                  </div>
                </div>

                {dobError && (
                  <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{dobError}</span>
                  </div>
                )}
              </div>

              {/* Ethnicity Selector */}
              <div>
                <md-outlined-select
                  label="民族"
                  className="w-full"
                  value={ethnicity}
                  error={!!ethnicityError || undefined}
                  error-text={ethnicityError || undefined}
                  onChange={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLSelectElement;
                    setEthnicity(target.value);
                    if (ethnicityError) setEthnicityError('');
                  }}
                >
                  {ethnicities.map((eth) => (
                    <md-select-option key={eth.id} value={eth.name}>
                      <div slot="headline">{eth.name}</div>
                    </md-select-option>
                  ))}
                  {ethnicityError && <span slot="error-text">{ethnicityError}</span>}
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
