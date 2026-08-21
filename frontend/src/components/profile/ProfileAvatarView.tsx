import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileAvatarViewProps {
  currentInitial?: string;
  currentBgColor?: string;
  onSave: (initial: string, bgColor: string) => void;
  onCancel?: () => void;
}

const COLOR_PRESETS = [
  { name: '活力橙', color: '#E47035' },
  { name: '科技蓝', color: '#1A73E8' },
  { name: '翡翠绿', color: '#137333' },
  { name: '沉稳紫', color: '#8430CE' },
  { name: '典雅棕', color: '#8D6E63' },
  { name: '深海青', color: '#00796B' },
];

export function ProfileAvatarView({
  currentInitial = 'D',
  currentBgColor = '#E47035',
  onSave,
  onCancel,
}: ProfileAvatarViewProps) {
  const [initial, setInitial] = React.useState(currentInitial);
  const [bgColor, setBgColor] = React.useState(currentBgColor);

  const handleSave = () => {
    onSave(initial.trim() || 'D', bgColor);
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        头像有助于在协作交流、医疗审核及转诊记录中快速识别您的身份。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          个人资料头像
        </h2>

        {/* Avatar Live Preview */}
        <div className="flex flex-col items-center justify-center py-6 gap-4 bg-[var(--md-sys-color-surface-container-lowest)] rounded-xl border border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <div
            style={{ backgroundColor: bgColor }}
            className="w-24 h-24 rounded-full text-white flex items-center justify-center text-4xl font-normal shadow-md ring-8 ring-[var(--md-sys-color-surface-container)] transition-colors"
          >
            {initial.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            头像预览效果
          </span>
        </div>

        {/* Initial character input */}
        <div>
          <md-outlined-text-field
            label="头像字母/字符"
            maxLength={2}
            className="w-full"
            value={initial}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setInitial(target.value);
            }}
          />
        </div>

        {/* Color presets */}
        <div>
          <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-2">
            选择背景配色
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                type="button"
                onClick={() => setBgColor(preset.color)}
                style={{ backgroundColor: preset.color }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform ${bgColor === preset.color ? 'scale-110 ring-4 ring-[var(--md-sys-color-primary)]/40 shadow-sm' : 'hover:scale-105'}`}
                title={preset.name}
              >
                {bgColor === preset.color && (
                  <span className="material-symbols-outlined text-[20px]">check</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            谁可以看到您的头像
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">public</span>
            <span>
              头像为公开识别标识，在平台全站内所有与您相关的记录中展示。
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
