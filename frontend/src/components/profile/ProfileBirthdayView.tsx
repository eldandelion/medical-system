import * as React from 'react';
import { SegmentedButton } from '../common/Buttons';

export interface ProfileBirthdayViewProps {
  birthday: string;
  visibility: 'private' | 'public';
  avatarInitial?: string;
  onSave: (birthday: string, visibility: 'private' | 'public') => void;
}

export function ProfileBirthdayView({
  birthday,
  visibility,
  avatarInitial = 'D',
  onSave,
}: ProfileBirthdayViewProps) {
  const [selectedBirthday, setSelectedBirthday] = React.useState(birthday);
  const [selectedVisibility, setSelectedVisibility] = React.useState(visibility);
  const [isEditingDate, setIsEditingDate] = React.useState(false);
  const [tempBirthday, setTempBirthday] = React.useState(birthday);

  const handleVisibilityChange = (vis: string) => {
    const newVis = vis as 'private' | 'public';
    setSelectedVisibility(newVis);
    onSave(selectedBirthday, newVis);
  };

  const handleSaveDate = () => {
    if (tempBirthday.trim()) {
      setSelectedBirthday(tempBirthday.trim());
      setIsEditingDate(false);
      onSave(tempBirthday.trim(), selectedVisibility);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        {/* Birthday Row */}
        {!isEditingDate ? (
          <div
            onClick={() => setIsEditingDate(true)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40 cursor-pointer transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">生日</span>
              <span className="text-base text-[var(--md-sys-color-on-surface)] font-medium mt-0.5">{selectedBirthday}</span>
            </div>
            <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[20px]">chevron_right</span>
          </div>
        ) : (
          <div className="p-4 bg-[var(--md-sys-color-surface-container)] rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <md-outlined-text-field
                label="修改生日"
                placeholder="例如：2001年2月5日"
                className="flex-1"
                value={tempBirthday}
                onInput={(e: React.SyntheticEvent) => {
                  const target = e.target as HTMLInputElement;
                  setTempBirthday(target.value);
                }}
              />
              <button
                type="button"
                onClick={handleSaveDate}
                className="px-4 py-3 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                确定
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempBirthday(selectedBirthday);
                  setIsEditingDate(false);
                }}
                className="px-3 py-3 text-sm text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] rounded-xl"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Visibility Selector */}
        <div className="border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30 pt-4 space-y-4">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
            选择谁可以看到您的生日
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
            {selectedVisibility === 'private' ? '此信息属于隐私内容，仅限本人可见。' : '任何人均可查看您的生日。'}{' '}
            <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-0.5">
              了解详情 <span className="material-symbols-outlined text-[14px]">help</span>
            </a>
          </p>
        </div>

        {/* Birthday Decoration Card Callout */}
        <div className="border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30 pt-4">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            让其他人知道您的生日
          </h3>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed flex-1">
              如果您公开生日信息，也可以选择在系统中突出显示（例如装扮您的个人资料头像）。
            </p>
            <div className="w-14 h-14 rounded-full bg-[#E47035] text-white flex items-center justify-center text-2xl font-medium shrink-0 shadow-sm ring-4 ring-[#E47035]/20">
              {avatarInitial}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
