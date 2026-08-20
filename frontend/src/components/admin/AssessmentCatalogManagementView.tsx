import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';
import { AssessmentCatalogItemDto } from '../../types';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { GenericDialog } from '../common/GenericDialog';

export const AssessmentCatalogManagementView: React.FC = () => {
  const { catalog, isLoading, isError, refetch, toggleAvailability, isToggling } = useAssessmentCatalogManagement();
  const [togglingCode, setTogglingCode] = useState<string | null>(null);
  const [pendingHideScale, setPendingHideScale] = useState<AssessmentCatalogItemDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleToggle = async (item: AssessmentCatalogItemDto, explicitState?: boolean) => {
    const nextState = explicitState !== undefined ? explicitState : item.isEnabled === false;
    setTogglingCode(item.batteryCode);
    try {
      await toggleAvailability({ batteryCode: item.batteryCode, isAvailable: nextState });
    } finally {
      setTogglingCode(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Info Banner — edge-to-edge, pinned */}
      <div className="bg-[var(--md-sys-color-surface)] px-6 py-5 shrink-0 flex items-start justify-between">
        <div>
          <h2 className="text-[1.375rem] leading-7 font-normal text-[var(--md-sys-color-on-surface)] mb-1.5">
            心理测评量表目录与分发控制
          </h2>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] max-w-2xl leading-relaxed">
            管理员可在此控制系统内各心理量表在自测目录及教师筛查分发中的可见性。已下线的量表将停止产生新的分发任务；学生端已领取的在途问卷可在有效宽限期内继续作答完成。
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-4xl font-medium tabular-nums shrink-0">
          {catalog.length}
        </div>
      </div>

      {/* Catalog Grid — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 no-scrollbar">
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
                      onClick={() => {
                        if (isAvailable) {
                          setPendingHideScale(item);
                        } else {
                          handleToggle(item, true);
                        }
                      }}
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

      {/* Confirmation Dialog: 隐藏测评量表 (Hide Assessment Scale) */}
      <GenericDialog
        open={!!pendingHideScale}
        onClose={() => {
          setPendingHideScale(null);
          setIsDetailsOpen(false);
        }}
        maxWidth="500px"
        title={
          <span className="text-[20px] font-semibold text-[var(--md-sys-color-on-surface)]">
            确认隐藏测评量表？
          </span>
        }
        actions={
          <>
            <TertiaryButton
              label="取消"
              onClick={() => {
                setPendingHideScale(null);
                setIsDetailsOpen(false);
              }}
              disabled={isToggling}
            />
            <TertiaryButton
              label="确认隐藏"
              style={{
                color: 'var(--md-sys-color-error)',
                '--md-text-button-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-hover-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-hover-state-layer-color': 'var(--md-sys-color-error)',
                '--md-text-button-pressed-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-pressed-state-layer-color': 'var(--md-sys-color-error)',
                '--md-text-button-focus-label-text-color': 'var(--md-sys-color-error)',
              } as React.CSSProperties}
              onClick={async () => {
                if (pendingHideScale) {
                  const scale = pendingHideScale;
                  setPendingHideScale(null);
                  setIsDetailsOpen(false);
                  await handleToggle(scale, false);
                }
              }}
              disabled={isToggling}
            />
          </>
        }
      >
        {pendingHideScale && (
          <div className="space-y-3.5 text-sm text-[var(--md-sys-color-on-surface)]">
            {/* Scale Info Card */}
            <div className="bg-[var(--md-sys-color-surface-container)] p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[15px]">{pendingHideScale.title}</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                  {pendingHideScale.batteryCode}
                </span>
              </div>
              <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1">
                <div>题目总数：<span className="font-mono text-[var(--md-sys-color-on-surface)]">{pendingHideScale.questionCount} 题</span></div>
                <div>预估用时：<span className="text-[var(--md-sys-color-on-surface)]">{pendingHideScale.duration}</span></div>
                {pendingHideScale.subtitle && (
                  <div>量表类别：<span className="text-[var(--md-sys-color-on-surface)]">{pendingHideScale.subtitle}</span></div>
                )}
              </div>
            </div>

            {/* Collapsible Action Consequences */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                    info
                  </span>
                  <span>查看操作影响与合规说明</span>
                </span>
                <span
                  className={`material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ${
                    isDetailsOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              <AnimatePresence>
                {isDetailsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                          visibility_off
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                          目录隐藏与分发暂停
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                          该量表将立即从学生自测目录及教师筛查分发列表中下线，无法发起新的评定任务。
                        </p>
                      </div>
                    </div>

                    <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                          pending_actions
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                          在途问卷有效完成
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                          学生端已领取的在途测评任务不受影响，在有效截止期内仍可正常作答并提交。
                        </p>
                      </div>
                    </div>

                    <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                          verified_user
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                          历史档案完整保留
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                          所有历史评定得分、常模比对结果与心理档案记录均完整留存，不影响历次健康报告。
                        </p>
                      </div>
                    </div>

                    <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                          replay
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                          随时恢复上线
                        </div>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                          管理员可随时在量表目录管理中点击「启用上线」重新向全校开放。
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </GenericDialog>
    </div>
  );
};
