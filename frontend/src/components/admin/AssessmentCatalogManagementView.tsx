import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';
import { AssessmentCatalogItemDto } from '../../types';
import { PrimaryButton, TertiaryButton, OutlinedButton, SegmentedButton } from '../common/Buttons';
import { GenericDialog } from '../common/GenericDialog';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { AssessmentAssignmentCreationForm } from '../assessments/AssessmentAssignmentCreationForm';
import { AssessmentScaleDetailsFullScreen } from '../assessments/AssessmentScaleDetailsFullScreen';

export const CATALOG_VIEW_SEGMENTS = [
  { label: '量表列表', value: 'catalog' },
  { label: '指派历史', value: 'history' },
];

export const AssessmentCatalogManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const { catalog, isLoading, isError, refetch, toggleAvailability, isToggling } = useAssessmentCatalogManagement();
  const { openCreation, closeCreation } = useCreationOverlay();
  const [togglingCode, setTogglingCode] = useState<string | null>(null);
  const [activeMenuCode, setActiveMenuCode] = useState<string | null>(null);
  const [pendingHideScale, setPendingHideScale] = useState<AssessmentCatalogItemDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingScale, setViewingScale] = useState<AssessmentCatalogItemDto | null>(null);

  const handleToggle = async (item: AssessmentCatalogItemDto, explicitState?: boolean) => {
    const nextState = explicitState !== undefined ? explicitState : item.isEnabled === false;
    setTogglingCode(item.batteryCode);
    try {
      await toggleAvailability({ batteryCode: item.batteryCode, isAvailable: nextState });
    } finally {
      setTogglingCode(null);
    }
  };

  const handleOpenAssign = (item: AssessmentCatalogItemDto) => {
    openCreation(
      '指派心理测评',
      <AssessmentAssignmentCreationForm
        initialScale={item}
        onClose={closeCreation}
      />,
      { initialViewState: 'FULLSCREEN', allowStandardView: false }
    );
  };

  return (
    <div className="w-full h-full flex flex-col pt-5 overflow-hidden relative">
      {/* Segmented Button Navigation */}
      <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-5 pt-5 px-6 mb-6 flex items-center justify-start">
        <SegmentedButton
          items={CATALOG_VIEW_SEGMENTS}
          selectedValue={activeTab}
          onChange={(value) => setActiveTab(value)}
        />
      </div>

      {activeTab === 'catalog' ? (
        /* Catalog Grid — scrollable portrait cards */
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-20 custom-scrollbar">
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
            <div className="max-w-[800px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalog.map((item) => {
                const isAvailable = item.isEnabled !== false;
                const isBusy = isToggling && togglingCode === item.batteryCode;
                const anchorId = `scale-menu-${item.batteryCode.replace(/[^a-zA-Z0-9_-]/g, '')}`;

                return (
                  <div
                    key={item.batteryCode}
                    className={`group relative flex flex-col justify-between px-4 pt-3 pb-3.5 rounded-3xl transition-all duration-200 min-h-[280px] ${
                      isAvailable
                        ? 'bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container)]'
                        : 'bg-[var(--md-sys-color-surface-container-lowest)] opacity-75'
                    }`}
                  >
                    <div className="flex flex-col flex-1">
                      {/* Top row: Markers (Availability, Time, Questions) + 3-dots Menu Button */}
                      <div className="flex items-center justify-between min-h-[24px] mb-1">
                        <div className="flex items-center gap-1.5 min-w-0 text-[11px] font-medium">
                          <span
                            className={`inline-flex items-center gap-1 shrink-0 ${
                              isAvailable ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-[var(--md-sys-color-outline)]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isAvailable ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'
                              }`}
                            />
                            {isAvailable ? '正常可用' : '已隐藏'}
                          </span>
                          <span className="opacity-30 shrink-0">·</span>
                          <span className="text-[var(--md-sys-color-on-surface-variant)] opacity-75 tabular-nums truncate">
                            {item.duration}
                          </span>
                          <span className="opacity-30 shrink-0">·</span>
                          <span className="text-[var(--md-sys-color-on-surface-variant)] opacity-75 tabular-nums shrink-0">
                            {item.questionCount} 题
                          </span>
                        </div>

                        <div className="relative shrink-0">
                          <md-icon-button
                            id={anchorId}
                            className="scale-75 -mr-2 -my-1 text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
                            title="更多选项"
                            disabled={isBusy}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setActiveMenuCode(activeMenuCode === item.batteryCode ? null : item.batteryCode);
                            }}
                          >
                            <md-icon>more_horiz</md-icon>
                          </md-icon-button>

                          <md-menu
                            anchor={anchorId}
                            open={activeMenuCode === item.batteryCode}
                            onClosed={() => {
                              if (activeMenuCode === item.batteryCode) setActiveMenuCode(null);
                            }}
                            quick
                            style={{
                              minWidth: '150px',
                              '--md-menu-item-focus-outline-width': '0',
                              '--md-menu-item-selected-outline-width': '0',
                              zIndex: 100,
                            } as React.CSSProperties}
                          >
                            {isAvailable ? (
                              <md-menu-item
                                onClick={() => {
                                  setActiveMenuCode(null);
                                  setPendingHideScale(item);
                                }}
                              >
                                <md-icon slot="start">visibility_off</md-icon>
                                <div slot="headline">隐藏量表</div>
                              </md-menu-item>
                            ) : (
                              <md-menu-item
                                onClick={() => {
                                  setActiveMenuCode(null);
                                  handleToggle(item, true);
                                }}
                              >
                                <md-icon slot="start">visibility</md-icon>
                                <div slot="headline">启用上线</div>
                              </md-menu-item>
                            )}
                          </md-menu>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-[14px] font-bold leading-snug mb-1.5 ${
                          isAvailable ? 'text-[var(--md-sys-color-on-surface)]' : 'text-[var(--md-sys-color-outline)]'
                        }`}
                      >
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p
                        className={`text-xs leading-relaxed flex-1 line-clamp-3 mb-3 ${
                          isAvailable ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-[var(--md-sys-color-outline)]'
                        }`}
                      >
                        {item.description || '暂无量表详细描述'}
                      </p>
                    </div>

                    {/* Actions: View Details (Outlined) + Assign (Outlined) */}
                    <div className="flex items-center gap-1.5 pt-2">
                      <OutlinedButton
                        label="查看详情"
                        onClick={() => setViewingScale(item)}
                        className="flex-1 h-8 !px-1.5 text-xs justify-center"
                        style={{
                          '--md-outlined-button-leading-space': '8px',
                          '--md-outlined-button-trailing-space': '8px',
                        } as React.CSSProperties}
                        noCollapse
                      />
                      <OutlinedButton
                        icon="assignment_add"
                        label="指派测评"
                        onClick={() => handleOpenAssign(item)}
                        disabled={!isAvailable}
                        className="flex-1 h-8 !px-1.5 text-xs justify-center"
                        iconSize="16px"
                        style={{
                          '--md-outlined-button-leading-space': '8px',
                          '--md-outlined-button-trailing-space': '8px',
                        } as React.CSSProperties}
                        noCollapse
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Empty History View */
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-12 text-[var(--md-sys-color-on-surface-variant)]">
          <p className="text-sm">暂无指派历史</p>
        </div>
      )}

      {/* Full-Screen Scale View */}
      <AssessmentScaleDetailsFullScreen
        isOpen={!!viewingScale}
        scale={viewingScale}
        onClose={() => setViewingScale(null)}
      />

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
