import * as React from 'react';
import { FullScreenView } from '../common/FullScreenView';
import { AssessmentCatalogItemDto } from '../../types';
import { PrimaryButton } from '../common/Buttons';
import { getAssessmentIcon } from '../../constants/assessmentDictionary';

export interface AssessmentScaleDetailsFullScreenProps {
  isOpen: boolean;
  onClose: () => void;
  scale: AssessmentCatalogItemDto | null;
}

export function AssessmentScaleDetailsFullScreen({
  isOpen,
  onClose,
  scale,
}: AssessmentScaleDetailsFullScreenProps) {
  if (!scale && !isOpen) return null;

  const isAvailable = scale?.isEnabled !== false;

  return (
    <FullScreenView
      isOpen={isOpen}
      onClose={onClose}
      title={scale?.title || '量表详情'}
      subtitle={scale ? `${scale.batteryCode} · ${scale.duration} · ${scale.questionCount} 题` : undefined}
      avatar={
        <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-medium">
          <span className="material-symbols-outlined text-[20px]">
            {getAssessmentIcon(scale?.batteryCode)}
          </span>
        </div>
      }
      actions={
        <PrimaryButton
          label="完成"
          onClick={onClose}
          className="h-9 px-4"
        />
      }
    >
      <div className="p-6 md:p-10 space-y-6">
        {/* Scale Metadata Banner */}
        <div className="p-6 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] border-opacity-40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                {scale?.batteryCode}
              </span>
              {scale?.subtitle && (
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                  {scale.subtitle}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">
              {scale?.title}
            </h2>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed max-w-2xl">
              {scale?.description || '暂无详细量表描述'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium tabular-nums shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'
                }`}
              />
              <span>{isAvailable ? '正常可用' : '已下线'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]">
              {scale?.questionCount} 题
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]">
              {scale?.duration}
            </div>
          </div>
        </div>

        {/* Empty Placeholder View */}
        <div className="p-12 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] border-opacity-30 flex flex-col items-center justify-center text-center space-y-4 min-h-[320px]">
          <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[32px]">
              pending
            </span>
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
              量表题目明细与临床常模配置
            </h3>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              该量表的题目编辑、常模分级基准与临床因子权重配置正在开发中。当前可通过分发功能向学生或群体发起测试。
            </p>
          </div>
        </div>
      </div>
    </FullScreenView>
  );
}
