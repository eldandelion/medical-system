import * as React from 'react';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';

export interface ProfileAddressViewProps {
  homeAddress?: string;
  workAddress?: string;
  otherAddress?: string;
  onSave: (data: { homeAddress: string; workAddress: string; otherAddress: string }) => void;
  onCancel?: () => void;
}

export function ProfileAddressView({
  homeAddress = '123 Template Blvd., Cityville',
  workAddress = '未设置',
  otherAddress = '未设置',
  onSave,
  onCancel,
}: ProfileAddressViewProps) {
  const [home, setHome] = React.useState(homeAddress === '未设置' ? '' : homeAddress);
  const [work, setWork] = React.useState(workAddress === '未设置' ? '' : workAddress);
  const [other, setOther] = React.useState(otherAddress === '未设置' ? '' : otherAddress);

  React.useEffect(() => {
    setHome(homeAddress === '未设置' ? '' : homeAddress);
    setWork(workAddress === '未设置' ? '' : workAddress);
    setOther(otherAddress === '未设置' ? '' : otherAddress);
  }, [homeAddress, workAddress, otherAddress]);


  const handleSave = () => {
    onSave({
      homeAddress: home.trim() || '未设置',
      workAddress: work.trim() || '未设置',
      otherAddress: other.trim() || '未设置',
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 md:p-10 space-y-6">
      <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
        设置您的常用地址，以便在医疗转诊、健康随访或紧急情况下进行定位与路线规划。{' '}
        <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-[var(--md-sys-color-primary)] hover:underline font-medium">
          了解详情
        </a>
      </p>

      <div className="bg-[var(--md-sys-color-surface)] rounded-xl p-6 border border-[var(--md-sys-color-outline-variant)] space-y-6">
        <h2 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
          地址信息
        </h2>

        <div className="space-y-4">
          <md-outlined-text-field
            label="家庭地址"
            placeholder="例如：123 Template Blvd., Cityville"
            className="w-full"
            value={home}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setHome(target.value);
            }}
          >
            <md-icon slot="leading-icon">home</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="工作/校区地址"
            placeholder="例如：主校区行政楼 302"
            className="w-full"
            value={work}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setWork(target.value);
            }}
          >
            <md-icon slot="leading-icon">work</md-icon>
          </md-outlined-text-field>

          <md-outlined-text-field
            label="其他地址"
            placeholder="例如：实习单位地址"
            className="w-full"
            value={other}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setOther(target.value);
            }}
          >
            <md-icon slot="leading-icon">signpost</md-icon>
          </md-outlined-text-field>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] mb-2">
            谁可以看到您的地址
          </h3>
          <div className="flex items-start gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">lock</span>
            <span>
              地址信息属于受保护个人数据，仅限指定辅导员和就诊医生在转诊阶段查阅。
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
