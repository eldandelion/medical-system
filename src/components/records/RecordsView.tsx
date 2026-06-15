import * as React from 'react';
import { useDataFetch } from '../../hooks/useDataFetch';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { RecordHeader } from './RecordHeader';

export type PsychiatricRecordType = '初诊转诊' | '随访';

export interface PsychiatricRecord {
  id: string;
  type: PsychiatricRecordType;
  reason: string;
  date: string;
  status: 'Pending' | 'Closed';
  detailedReason?: string;
  hospitalSummary?: string;
  followUpArrangement?: string;
  attachments?: { name: string; size: string; type: string }[];
  privacyVisitInitial?: string;
}

export const getRecordIcon = (type: PsychiatricRecordType): string => {
  switch (type) {
    case '初诊转诊':
      return 'clinical_notes';
    case '随访':
      return 'forum';
    default:
      return 'description';
  }
};

interface RecordsViewProps {
  onRecordSelect?: (record: PsychiatricRecord) => void;
  selectedRecordId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function RecordsView({ onRecordSelect, selectedRecordId, onLoadingChange }: RecordsViewProps) {
  const { data: recordsData, loading } = useDataFetch<PsychiatricRecord[]>('/api/records');
  const records = recordsData || [];

  React.useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const columns: ColumnDefinition<PsychiatricRecord>[] = [
    {
      key: 'type',
      label: '类型',
      width: 'w-[30%]',
      render: (item, isSelected) => (
        <div className="flex items-center gap-4">
          <span
            className="material-symbols-outlined text-[18px] shrink-0"
            style={{ 
              color: isSelected ? 'inherit' : 'var(--md-sys-color-on-surface-variant)', 
              fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" 
            }}
          >
            {getRecordIcon(item.type)}
          </span>
          <span className="text-[14px] font-normal truncate">{item.type}</span>
        </div>
      )
    },
    {
      key: 'details',
      label: '详情',
      width: 'flex-1',
      render: (item, isSelected) => (
        <div className="flex flex-col justify-center">
          <span className="text-[14px] truncate">{item.reason}</span>
          <span className={`text-[12px] ${isSelected ? 'opacity-90' : 'opacity-70'} mt-0.5`}>
            {item.date}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: '状态',
      width: 'w-[20%]',
      render: (item, isSelected) => {
        const isPending = item.status === 'Pending';
        return (
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${isPending
                ? 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
                : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
              }`}>
              {item.status === 'Pending' ? '处理中' : '已结案'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: '',
      width: 'w-[40px]',
      render: () => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <md-icon-button className="scale-75">
            <md-icon>more_vert</md-icon>
          </md-icon-button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col pt-4">
      <div className="px-6">
        <RecordHeader title="精神医学记录" />
      </div>
      
      <div className="mt-2">
        {loading && records.length === 0 ? (
          onLoadingChange ? (
            <div className="py-12 flex flex-col items-center justify-center min-h-[200px]">
              {/* Loading state handled by parent */}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center min-h-[200px]">
              {/* @ts-ignore */}
              <md-circular-progress indeterminate></md-circular-progress>
              <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] mt-4">正在加载记录...</span>
            </div>
          )
        ) : records.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[48px] opacity-50">description</span>
            <span className="text-[14px] mt-4">暂无记录</span>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={records} 
            onRowClick={onRecordSelect} 
            selectedId={selectedRecordId} 
          />
        )}
      </div>
    </div>
  );
}
