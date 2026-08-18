import React, { useState } from 'react';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';
import { AssessmentCatalogItemDto } from '../../types';

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
      <div className="bg-[var(--md-sys-color-surface-container)] p-6 rounded-2xl border border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)] mb-1">
              心理测评量表目录与分发控制
            </h2>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-2xl leading-relaxed">
              管理员可在此控制系统内各心理量表在自测目录及教师筛查分发中的可见性。已下线的量表将停止产生新的分发任务；学生端已领取的在途问卷可在有效宽限期内继续作答完成。
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold">
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
          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 text-xs font-medium rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
          >
            重试
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {catalog.map((item) => {
            const isAvailable = item.isEnabled !== false;
            const isBusy = isToggling && togglingCode === item.batteryCode;

            return (
              <div
                key={item.batteryCode}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  isAvailable
                    ? 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] shadow-xs hover:border-[var(--md-sys-color-primary)]/50'
                    : 'bg-[var(--md-sys-color-surface-container-low)] border-[var(--md-sys-color-outline-variant)]/60 opacity-75'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]">
                      {item.batteryCode}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isAvailable
                          ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                          : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-outline)]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAvailable ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'
                        }`}
                      ></span>
                      {isAvailable ? '正常可用' : '已隐藏/下线'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mb-1">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-[11px] font-medium text-[var(--md-sys-color-primary)] mb-2">
                      {item.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] line-clamp-3 mb-4 leading-relaxed">
                    {item.description || '暂无量表详细描述'}
                  </p>
                </div>

                {/* Footer Meta & Toggle */}
                <div className="pt-4 border-t border-[var(--md-sys-color-outline-variant)]/60 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">timer</span>
                      {item.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">quiz</span>
                      {item.questionCount} 题
                    </span>
                  </div>

                  {/* Toggle Switch Button */}
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={isBusy}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isAvailable
                        ? 'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/30'
                        : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90'
                    }`}
                  >
                    {isBusy ? '处理中...' : isAvailable ? '隐藏量表' : '启用上线'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
