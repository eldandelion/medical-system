import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileNameViewProps {
  name: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  legalName?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave: (data: { firstName: string; lastName: string; nickname?: string }) => void;
}

export function ProfileNameView({
  name,
  firstName = '伟',
  lastName = '张',
  nickname = '未设置',
  legalName = '张伟',
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
}: ProfileNameViewProps) {
  const [internalEditing, setInternalEditing] = React.useState(isEditing);
  const [editFirstName, setEditFirstName] = React.useState(firstName);
  const [editLastName, setEditLastName] = React.useState(lastName);

  React.useEffect(() => {
    setInternalEditing(isEditing);
  }, [isEditing]);

  const handleStartEdit = () => {
    if (onStartEdit) {
      onStartEdit();
    } else {
      setInternalEditing(true);
    }
  };

  const handleCancel = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    if (onCancelEdit) {
      onCancelEdit();
    } else {
      setInternalEditing(false);
    }
  };

  const handleSave = () => {
    onSave({
      firstName: editFirstName.trim() || firstName,
      lastName: editLastName.trim() || lastName,
      nickname,
    });
    if (!onCancelEdit) {
      setInternalEditing(false);
    }
  };

  if (internalEditing) {
    return (
      <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
        <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            更改您的姓名后，系统内的相关显示都会同步更新。您之前的姓名可能仍会显示在历史消息或旧记录中。{' '}
            <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
              了解详情
            </a>
          </p>

          <div className="space-y-4">
            <md-outlined-text-field
              label="姓氏"
              className="w-full"
              value={editLastName}
              onInput={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLInputElement;
                setEditLastName(target.value);
              }}
            />

            <md-outlined-text-field
              label="名字"
              className="w-full"
              value={editFirstName}
              onInput={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLInputElement;
                setEditFirstName(target.value);
              }}
            />
          </div>

          {/* Privacy info banner */}
          <div className="pt-2">
            <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
              谁可以看到您的姓名
            </h3>
            <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">group</span>
              <span>
                当其他人与您通信或查看您在平台中创建的内容时，都可以看到此信息。{' '}
                <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-0.5">
                  了解详情 <span className="material-symbols-outlined text-[14px]">help</span>
                </a>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-40">
            <TertiaryButton
              label="取消"
              onClick={handleCancel}
              className="h-10 px-5"
            />
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

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      {/* Card 1: Display Name & Nickname */}
      <div className="bg-[var(--md-sys-color-surface)] rounded-xl border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        {/* Name Item */}
        <div
          onClick={handleStartEdit}
          className="flex items-center justify-between p-5 hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40 cursor-pointer transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">姓名</span>
            <span className="text-base text-[var(--md-sys-color-on-surface)] font-medium mt-0.5">{name}</span>
          </div>
          <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[20px]">chevron_right</span>
        </div>

        <div className="border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30" />

        {/* Nickname Item */}
        <div
          onClick={handleStartEdit}
          className="flex items-center justify-between p-5 hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40 cursor-pointer transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">昵称</span>
            <span className="text-base text-[var(--md-sys-color-on-surface)] font-medium mt-0.5">{nickname}</span>
          </div>
          <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[20px]">chevron_right</span>
        </div>

        <div className="p-5 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            谁可以看到您的姓名
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">group</span>
            <span>
              当其他人与您通信或查看您在平台中创建的内容时，都可以看到此信息。{' '}
              <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-0.5">
                了解详情 <span className="material-symbols-outlined text-[14px]">help</span>
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Card 2: Legal Name */}
      <div className="bg-[var(--md-sys-color-surface)] rounded-xl border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        <div
          onClick={handleStartEdit}
          className="flex items-center justify-between p-5 hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40 cursor-pointer transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">法定姓名</span>
            <span className="text-base text-[var(--md-sys-color-on-surface)] font-medium mt-0.5">{legalName}</span>
          </div>
          <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] text-[20px]">chevron_right</span>
        </div>

        <div className="p-5 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            谁可以看到您的法定姓名
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">verified_user</span>
            <span>
              您的法定姓名仅在必要时向具有管理和审核权限的人员可见。{' '}
              <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline">
                了解法定姓名可见性
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
