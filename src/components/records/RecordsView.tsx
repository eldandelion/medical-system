import * as React from 'react';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { RecordHeader } from './RecordHeader';

export type PsychiatricRecordType = '初诊转诊' | '随访';

export interface PsychiatricRecord {
  id: string;
  type: PsychiatricRecordType;
  reason: string;
  date: string;
  status: 'Pending' | 'Closed';
}

export const getRecordIcon = (type: PsychiatricRecordType): string => {
  switch (type) {
    case '初诊转诊':
      return 'clinical_notes';
    case '随访':
      return 'forum';
  }
};

interface RecordsViewProps {
  onRecordSelect?: (record: PsychiatricRecord) => void;
  selectedRecordId?: string;
}

export function RecordsView({ onRecordSelect, selectedRecordId }: RecordsViewProps) {
  const [records, setRecords] = React.useState<PsychiatricRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch('/api/records')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch records');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setRecords(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load psychiatric records:', err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

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
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
            {/* @ts-ignore */}
            <md-linear-progress indeterminate className="w-full max-w-xs mb-4"></md-linear-progress>
            <span className="text-[14px] opacity-75">正在获取医学记录...</span>
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
