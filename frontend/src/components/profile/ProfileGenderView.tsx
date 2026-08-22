import * as React from 'react';

export interface ProfileGenderViewProps {
  gender: string;
  onSave: (gender: string) => void;
}

export function ProfileGenderView({
  gender,
  onSave,
}: ProfileGenderViewProps) {
  const [selectedGender, setSelectedGender] = React.useState(gender);

  const handleGenderSelect = (val: string) => {
    setSelectedGender(val);
    onSave(val);
  };

  const isSelected = (val: string) => {
    if (val === '男性' || val === '男') {
      return selectedGender === '男' || selectedGender === '男性';
    }
    if (val === '女性' || val === '女') {
      return selectedGender === '女' || selectedGender === '女性';
    }
    return selectedGender === val;
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      {/* Description above card */}
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        您的性别信息用于系统医疗建档、问卷个性化匹配及临床称呼方式。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      {/* Main Gender Card */}
      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          性别
        </h2>

        {/* Radio options: only Male and Female */}
        <div className="space-y-1">
          {[
            { label: '女性', value: '女' },
            { label: '男性', value: '男' },
          ].map((item) => {
            const checked = isSelected(item.value);
            return (
              <label
                key={item.value}
                onClick={() => handleGenderSelect(item.value)}
                className="flex items-center gap-4 py-3.5 px-3 rounded-xl hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40 cursor-pointer transition-colors"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'border-[var(--md-sys-color-primary)]' : 'border-[var(--md-sys-color-outline)]'}`}>
                  {checked && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--md-sys-color-primary)]" />
                  )}
                </div>
                <span className="text-base text-[var(--md-sys-color-on-surface)]">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
