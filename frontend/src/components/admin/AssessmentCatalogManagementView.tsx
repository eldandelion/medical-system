import React, { useState } from 'react';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';
import { AssessmentCatalogItemDto } from '../../types';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';

export const AssessmentCatalogManagementView: React.FC = () => {
  const { catalog, isLoading, isError, refetch, toggleAvailability, isToggling } = useAssessmentCatalogManagement();
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  const handleToggle = async (item: AssessmentCatalogItemDto) => {
    const nextState = item.isEnabled === false ? true : false;
    setTogglingCode(item.batteryCode);
    try {
      await toggleAvailability({ batteryCode: item.batteryCode, isAvailable: nextState });
    } finally {
      setTogglingCode(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Info Card */}
      <div className="bg-[var(--md-sys-color-surface-container-high)] p-6 rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[1.375rem] leading-7 font-semibold text-[var(--md-sys-color-on-surface)] mb-1.5">
              心理测评量表目录与分发控制
            </h2>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] max-w-2xl leading-relaxed">
              管理员可在此控制系统内各心理量表在自测目录及教师筛查分发中的可见性。已下线的量表将停止产生新的分发任务；学生端已领取的在途问卷可在有效宽限期内继续作答完成。
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-bold tabular-nums">
            共 {catalog.length} 门量表
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
          正在加载量表目录...
        </div>
      ) : isError ? (
        <div className="p-12 text-center">
          <p className="text-sm text-[var(--md-sys-color-error)] mb-3">加载量表目录失败</p>
          <PrimaryButton
            label="重试"
            onClick={() => refetch()}
            className="h-8"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((item) => {
            const isAvailable = item.isEnabled !== false;
            const isBusy = isToggling && togglingCode === item.batteryCode;

            return (
              <div
                key={item.batteryCode}
                className={`flex flex-col justify-between p-4 rounded-2xl transition-all ${
                  isAvailable
                    ? 'bg-[var(--md-sys-color-surface-container-low)]'
                    : 'bg-[var(--md-sys-color-surface-container-lowest)]'
                }`}
              >
                <div>
                  {item.subtitle && (
                    <p className={`text-xs font-semibold tracking-wide uppercase mb-1 ${isAvailable ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-outline)]'}`}>
                      {item.subtitle}
                    </p>
                  )}
                  {/* Title */}
                  <div className="mb-2.5">
                    <h3 className={`text-base font-bold leading-6 ${isAvailable ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-outline)]'}`}>
                      {item.title}
                    </h3>
                  </div>

                  <p className={`text-sm line-clamp-3 mb-4 leading-relaxed ${isAvailable ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-[var(--md-sys-color-outline)]'}`}>
                    {item.description || '暂无量表详细描述'}
                  </p>
                </div>

                {/* Footer: combined meta pill + action button */}
                <div className="flex items-center justify-between mt-auto">
                  {/* Availability dot · duration · question count */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${isAvailable ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-[var(--md-sys-color-outline)]'}`}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isAvailable ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'
                      }`}
                    />
                    {isAvailable ? '正常可用' : '已隐藏/下线'}
                    <span className="opacity-40">·</span>
                    {item.duration}
                    <span className="opacity-40">·</span>
                    {item.questionCount} 题
                  </span>

                  {/* Toggle Button */}
                  <SecondaryButton
                    label={isBusy ? '处理中...' : isAvailable ? '隐藏量表' : '启用上线'}
                    onClick={() => handleToggle(item)}
                    disabled={isBusy}
                    className="h-8"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
