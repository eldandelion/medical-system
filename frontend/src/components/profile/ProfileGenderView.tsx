import * as React from 'react';
import { SegmentedButton } from '../common/Buttons';

export interface ProfileGenderViewProps {
  gender: string;
  visibility: 'private' | 'public';
  onSave: (gender: string, visibility: 'private' | 'public') => void;
}

export function ProfileGenderView({
  gender,
  visibility,
  onSave,
}: ProfileGenderViewProps) {
  const [selectedGender, setSelectedGender] = React.useState(gender);
  const [selectedVisibility, setSelectedVisibility] = React.useState(visibility);
  const [isCustom, setIsCustom] = React.useState(!['男', '女', '女性', '男性', '不愿透露'].includes(gender));
  const [customValue, setCustomValue] = React.useState(!['男', '女', '女性', '男性', '不愿透露'].includes(gender) ? gender : '');

  const handleGenderSelect = (val: string) => {
    setIsCustom(false);
    setSelectedGender(val);
    onSave(val, selectedVisibility);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      setSelectedGender(customValue.trim());
      onSave(customValue.trim(), selectedVisibility);
    }
  };

  const handleVisibilityChange = (vis: string) => {
    const newVis = vis as 'private' | 'public';
    setSelectedVisibility(newVis);
    onSave(selectedGender, newVis);
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
        您的性别信息可能用于系统服务中的个性化设置以及我们对您的称呼方式。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      {/* Main Gender Card */}
      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          性别
        </h2>

        {/* Radio options */}
        <div className="space-y-1">
          {[
            { label: '女性', value: '女' },
            { label: '男性', value: '男' },
            { label: '不愿透露', value: '不愿透露' },
          ].map((item) => {
            const checked = isSelected(item.value);
            return (
              <label
                key={item.value}
                onClick={() => handleGenderSelect(item.value)}
                className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40 cursor-pointer transition-colors"
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

        {/* Custom Gender Option */}
        {!isCustom ? (
          <div>
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--md-sys-color-outline)] text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)] hover:bg-opacity-20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              添加自定义性别
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 pt-2">
            <md-outlined-text-field
              label="自定义性别"
              className="flex-1"
              value={customValue}
              onInput={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLInputElement;
                setCustomValue(target.value);
              }}
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="px-4 py-3 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              应用
            </button>
          </div>
        )}

        <div className="border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30 pt-4 space-y-4">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
            选择谁可以看到您的性别
          </h3>

          <div className="w-full">
            <SegmentedButton
              items={[
                { label: '仅限本人', value: 'private' },
                { label: '任何人', value: 'public' },
              ]}
              selectedValue={selectedVisibility}
              onChange={handleVisibilityChange}
            />
          </div>

          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            {selectedVisibility === 'private' ? '此信息属于隐私内容，仅限本人可见。' : '任何人均可查看您的性别。'}{' '}
            <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-0.5">
              了解详情 <span className="material-symbols-outlined text-[14px]">help</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
