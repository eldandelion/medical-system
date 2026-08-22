import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileEmergencyContactViewProps {
  contactName: string;
  contactPhone: string;
  contactRelation?: string;
  onSave: (data: { contactName: string; contactPhone: string; contactRelation: string }) => void;
  onCancel?: () => void;
}

export function ProfileEmergencyContactView({
  contactName = '张建军',
  contactPhone = '+86 139-0013-9001',
  contactRelation = '父亲',
  onSave,
  onCancel,
}: ProfileEmergencyContactViewProps) {
  const [name, setName] = React.useState(contactName);
  const [phone, setPhone] = React.useState(contactPhone);
  const [relation, setRelation] = React.useState(contactRelation);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    setName(contactName);
    setPhone(contactPhone);
    setRelation(contactRelation);
  }, [contactName, contactPhone, contactRelation]);


  const handleSave = () => {
    if (!name.trim()) {
      setErrorMessage('请输入紧急联系人姓名');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('请输入紧急联系人电话');
      return;
    }
    setErrorMessage('');
    onSave({
      contactName: name.trim(),
      contactPhone: phone.trim(),
      contactRelation: relation.trim() || '亲属',
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        紧急联系人信息仅在发生重大危机事件、紧急就医转诊或极端突发状况时，由授权工作人员进行联系。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          紧急联系人
        </h2>

        <div className="space-y-4">
          <md-outlined-text-field
            label="联系人姓名"
            placeholder="例如：张建军"
            className="w-full"
            value={name}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setName(target.value);
              if (errorMessage) setErrorMessage('');
            }}
          >
            <md-icon slot="leading-icon">person</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="联系电话"
            placeholder="例如：13900139001"
            className="w-full"
            value={phone}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setPhone(target.value);
              if (errorMessage) setErrorMessage('');
            }}
          >
            <md-icon slot="leading-icon">phone</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="与本人关系"
            placeholder="例如：父亲 / 母亲 / 监护人"
            className="w-full"
            value={relation}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setRelation(target.value);
            }}
          >
            <md-icon slot="leading-icon">group</md-icon>
          </md-outlined-text-field>
        </div>

        {errorMessage && (
          <div className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1.5 pt-1">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMessage}
          </div>
        )}

        {/* Privacy Note */}
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            安全与保密说明
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">contact_emergency</span>
            <span>
              平台对紧急联系人信息进行严密访问控制与审计留痕，日常教学和普通筛查中不会向外部透露。
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
