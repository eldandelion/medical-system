import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileNameViewProps {
  name: string;
  firstName?: string;
  lastName?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSave: (data: { firstName: string; lastName: string; fullName?: string; name?: string }) => void;
}

export function ProfileNameView({
  name,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSave,
}: ProfileNameViewProps) {
  const [internalEditing, setInternalEditing] = React.useState(isEditing);
  const [editName, setEditName] = React.useState(name);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setInternalEditing(isEditing);
  }, [isEditing]);

  React.useEffect(() => {
    setEditName(name);
  }, [name]);

  const handleStartEdit = () => {
    setError('');
    if (onStartEdit) {
      onStartEdit();
    } else {
      setInternalEditing(true);
    }
  };

  const handleCancel = () => {
    setError('');
    setEditName(name);
    if (onCancelEdit) {
      onCancelEdit();
    } else {
      setInternalEditing(false);
    }
  };

  const handleSave = () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setError('请输入您的姓名');
      return;
    }
    setError('');
    const first = trimmed.length > 1 ? trimmed.slice(1) : trimmed;
    const last = trimmed.length > 1 ? trimmed[0] : '';
    onSave({
      name: trimmed,
      fullName: trimmed,
      firstName: first,
      lastName: last,
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
              label="姓名"
              className="w-full"
              value={editName}
              onInput={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLInputElement;
                setEditName(target.value);
                if (error) setError('');
              }}
            >
              <md-icon slot="leading-icon">badge</md-icon>
            </md-outlined-text-field>
          </div>

          {error && (
            <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1.5 pt-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}



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
    </div>
  );
}
