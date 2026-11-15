import React, { useState } from 'react';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';
import { useScaleLifecycleActions } from '../../hooks/useScaleLifecycleActions';
import { AssessmentCatalogItemDto, Student } from '../../types';
import { PrimaryButton, SegmentedButton } from '../common/Buttons';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { DispatchHistoryTab } from '../assessments/DispatchHistoryTab';
import { HideScaleConfirmationDialog } from '../assessments/HideScaleConfirmationDialog';

export const CATALOG_VIEW_SEGMENTS = [
  { label: '量表列表', value: 'catalog' },
  { label: '指派历史', value: 'history' },
];

export interface AssessmentCatalogManagementViewProps {
  onScaleSelect?: (scale: AssessmentCatalogItemDto | null) => void;
  selectedScaleCode?: string;
  onStudentSelect?: (student: Student | null) => void;
  selectedStudentId?: string;
}

export const AssessmentCatalogManagementView: React.FC<AssessmentCatalogManagementViewProps> = ({
  onScaleSelect,
  selectedScaleCode,
  onStudentSelect,
  selectedStudentId,
}) => {
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [selectedRecordId, setSelectedRecordId] = useState<number | string | null>(null);

  React.useEffect(() => {
    if (!selectedStudentId) {
      setSelectedRecordId(null);
    }
  }, [selectedStudentId]);

  const { catalog, isLoading, isError, refetch } = useAssessmentCatalogManagement();
  const {
    handleOpenAssign,
    requestToggleAvailability,
    pendingHideScale,
    confirmHideScale,
    cancelHideScale,
    isToggling,
  } = useScaleLifecycleActions();

  const handleSubTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedRecordId(null);
    onScaleSelect?.(null);
    onStudentSelect?.(null);
  };

  type TableItem = AssessmentCatalogItemDto & { id: string };
  const columns: ColumnDefinition<TableItem>[] = [
    {
      key: 'title',
      label: '量表名称',
      width: 'w-[40%]',
      render: (item) => (
        <div className="flex flex-col py-1">
          <span className="font-semibold text-[14px] text-[var(--md-sys-color-on-surface)]">
            {item.title}
          </span>
          {item.subtitle && (
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] opacity-80 mt-0.5">
              {item.subtitle}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'questionCount',
      label: '题目数量',
      width: 'w-[15%]',
      render: (item) => (
        <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
          {item.questionCount} 题
        </span>
      ),
    },
    {
      key: 'duration',
      label: '预估用时',
      width: 'w-[15%]',
      render: (item) => (
        <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
          {item.duration}
        </span>
      ),
    },
    {
      key: 'status',
      label: '状态',
      width: 'w-[15%]',
      render: (item) => {
        const isAvailable = item.isEnabled !== false;
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
              isAvailable
                ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isAvailable
                  ? 'bg-[var(--md-sys-color-primary)]'
                  : 'bg-[var(--md-sys-color-outline)]'
              }`}
            />
            {isAvailable ? '正常可用' : '已隐藏'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      width: 'w-[15%]',
      overflowVisible: true,
      render: (item) => {
        const isAvailable = item.isEnabled !== false;
        return (
          <div
            className="flex items-center justify-end gap-1 pr-2"
            onClick={(e) => e.stopPropagation()}
          >
            <md-icon-button
              aria-label="指派测评"
              title="指派测评"
              disabled={!isAvailable}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleOpenAssign(item);
              }}
            >
              <md-icon>assignment_add</md-icon>
            </md-icon-button>
            {isAvailable ? (
              <md-icon-button
                aria-label="隐藏量表"
                title="隐藏量表"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  requestToggleAvailability(item, false);
                }}
              >
                <md-icon>visibility_off</md-icon>
              </md-icon-button>
            ) : (
              <md-icon-button
                aria-label="启用上线"
                title="启用上线"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  requestToggleAvailability(item, true);
                }}
              >
                <md-icon>visibility</md-icon>
              </md-icon-button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full flex flex-col pt-5 overflow-hidden relative bg-[var(--md-sys-color-surface)]">
      <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-5 pt-5 px-6 mb-6 flex items-center justify-start">
        <SegmentedButton
          items={CATALOG_VIEW_SEGMENTS}
          selectedValue={activeTab}
          onChange={handleSubTabChange}
        />
      </div>

      {activeTab === 'catalog' ? (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 min-h-0 flex items-center justify-center p-12 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              正在加载量表目录...
            </div>
          ) : isError ? (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-12">
              <p className="text-sm text-[var(--md-sys-color-error)] mb-3">
                加载量表目录失败
              </p>
              <PrimaryButton
                label="重试"
                onClick={() => refetch()}
                className="h-8"
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={catalog.map((c) => ({ ...c, id: c.batteryCode }))}
              selectedId={selectedScaleCode}
              onRowClick={(item) => {
                const matched =
                  catalog.find((c) => c.batteryCode === item.batteryCode) || item;
                onScaleSelect?.(matched);
              }}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <DispatchHistoryTab
            onSelect={(student, record) => {
              setSelectedRecordId(record.assignmentId);
              onStudentSelect?.(student);
            }}
            selectedRecordId={selectedRecordId || undefined}
          />
        </div>
      )}

      <HideScaleConfirmationDialog
        scale={pendingHideScale}
        isOpen={!!pendingHideScale}
        onConfirm={confirmHideScale}
        onCancel={cancelHideScale}
        isSubmitting={isToggling}
      />
    </div>
  );
};
