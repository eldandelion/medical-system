import * as React from 'react';
import { DetailsSection } from '../common/DetailsPanel';
import {
  GroupedInfoList,
  GroupedInfoItemProps,
  getGroupedItemCornerRadius,
} from '../common/GroupedInfoList';
import { AssessmentCatalogItemDto } from '../../types';

export interface AssessmentScaleOverviewTabProps {
  scale: AssessmentCatalogItemDto;
  onSelectSection?: () => void;
}

/**
 * Overview tab for an assessment scale inside DetailsPanel.
 * Displays core metadata, availability status, scale description, and a section breakdown.
 */
export function AssessmentScaleOverviewTab({
  scale,
  onSelectSection,
}: AssessmentScaleOverviewTabProps) {
  const isAvailable = scale.isEnabled !== false;
  const sections = scale.sections ?? [];

  const metadataItems: GroupedInfoItemProps[] = [
    {
      id: 'batteryCode',
      icon: 'qr_code_2',
      label: '量表编码',
      value: scale.batteryCode,
      copyable: Boolean(scale.batteryCode),
    },
    {
      id: 'subtitle',
      icon: 'category',
      label: '量表类别',
      value: scale.subtitle || undefined,
    },
    {
      id: 'questionCount',
      icon: 'quiz',
      label: '题目总数',
      value: `${scale.questionCount} 题`,
    },
    {
      id: 'duration',
      icon: 'schedule',
      label: '预估用时',
      value: scale.duration || undefined,
    },
    {
      id: 'sectionCount',
      icon: 'view_agenda',
      label: '分部数量',
      value: `${sections.length} 个分部`,
    },
    {
      id: 'status',
      icon: isAvailable ? 'check_circle' : 'visibility_off',
      label: '当前状态',
      value: (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md ${
            isAvailable
              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isAvailable ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'
            }`}
          />
          {isAvailable ? '正常可用' : '已隐藏'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      <DetailsSection title="量表信息" className="border-t-0">
        <GroupedInfoList items={metadataItems} fallbackText="暂无" layout="horizontal" />
      </DetailsSection>

      <DetailsSection title="量表说明" className="border-t-0">
        <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          {scale.description?.trim() ? scale.description : '暂无详细量表描述'}
        </div>
      </DetailsSection>

      <DetailsSection title="分部概览" className="border-t-0">
        {sections.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] text-sm text-[var(--md-sys-color-on-surface-variant)] text-center">
            暂无分部结构信息
          </div>
        ) : (
          <div className="flex flex-col gap-[2px]">
            {sections.map((section, index) => {
              const cornerRadius = getGroupedItemCornerRadius(index, sections.length);
              const questionCount = section.questions?.length ?? 0;

              return (
                <div
                  key={section.id || `section-${index}`}
                  onClick={onSelectSection}
                  role={onSelectSection ? 'button' : undefined}
                  tabIndex={onSelectSection ? 0 : undefined}
                  onKeyDown={
                    onSelectSection
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectSection();
                          }
                        }
                      : undefined
                  }
                  className={`px-4 py-3 bg-[var(--md-sys-color-surface-container-low)] flex items-start justify-between gap-3 ${cornerRadius} ${
                    onSelectSection
                      ? 'cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)] transition-colors'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                        {section.title}
                      </div>
                      {section.subtitle && (
                        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                          {section.subtitle}
                        </div>
                      )}
                      {section.description && (
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-85 leading-relaxed mt-1 line-clamp-2">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] shrink-0 tabular-nums">
                    {questionCount} 题
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </DetailsSection>
    </div>
  );
}
