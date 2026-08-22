import * as React from 'react';

export interface ProfileBirthdayViewProps {
  birthday: string;
  onSave: (birthday: string) => void;
}

export function ProfileBirthdayView({
  birthday,
  onSave,
}: ProfileBirthdayViewProps) {
  const [selectedBirthday, setSelectedBirthday] = React.useState(birthday);
  const [isEditingDate, setIsEditingDate] = React.useState(false);
  const [tempBirthday, setTempBirthday] = React.useState(birthday);

  const handleSaveDate = () => {
    if (tempBirthday.trim()) {
      setSelectedBirthday(tempBirthday.trim());
      setIsEditingDate(false);
      onSave(tempBirthday.trim());
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        您的出生日期用于计算年龄、筛查量表基线分析以及临床健康档案。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          生日
        </h2>

        {/* Birthday Row */}
        {!isEditingDate ? (
          <div
            onClick={() => setIsEditingDate(true)}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40 cursor-pointer transition-colors border border-[var(--md-sys-color-outline-variant)] border-opacity-40"
          >
            <div className="flex flex-col">
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">出生日期</span>
              <span className="text-base text-[var(--md-sys-color-on-surface)] font-medium mt-0.5">{selectedBirthday}</span>
            </div>
            <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[20px]">edit</span>
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
      </div>
    </div>
  );
}
