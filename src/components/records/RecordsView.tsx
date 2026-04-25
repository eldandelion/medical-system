import * as React from 'react';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { RecordHeader } from './RecordHeader';

interface PsychiatricRecord {
  id: string;
  type: string;
  icon: string;
  iconColor: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Closed';
}

interface RecordsViewProps {
  onRecordSelect?: (record: PsychiatricRecord) => void;
  selectedRecordId?: string;
}

export function RecordsView({ onRecordSelect, selectedRecordId }: RecordsViewProps) {
  const records: PsychiatricRecord[] = [
    {
      id: '1',
      type: '初诊转诊',
      icon: 'clinical_notes',
      iconColor: 'var(--md-sys-color-on-surface-variant)',
      reason: '焦虑与惊恐发作评估',
      date: '2026年4月12日',
      status: 'Closed'
    },
    {
      id: '2',
      type: '随访',
      icon: 'forum',
      iconColor: 'var(--md-sys-color-on-surface-variant)',
      reason: '药物管理（SSRI 调整）',
      date: '2026年4月20日',
      status: 'Pending'
    },
    {
      id: '3',
      type: '初诊转诊',
      icon: 'clinical_notes',
      iconColor: 'var(--md-sys-color-on-surface-variant)',
      reason: 'ADHD 评估与诊断访谈',
      date: '2026年5月05日',
      status: 'Pending'
    },
    {
      id: '4',
      type: '随访',
      icon: 'forum',
      iconColor: 'var(--md-sys-color-on-surface-variant)',
      reason: '认知行为疗法（CBT）第 4 次会谈',
      date: '2026年3月15日',
      status: 'Closed'
    },
    {
      id: '5',
      type: '随访',
      icon: 'forum',
      iconColor: 'var(--md-sys-color-on-surface-variant)',
      reason: '睡眠障碍与失眠复查',
      date: '2026年3月01日',
      status: 'Closed'
    }
  ];

  const columns: ColumnDefinition<PsychiatricRecord>[] = [
    {
      key: 'type',
      label: '类型',
      width: 'w-[30%]',
      render: (item, isSelected) => (
        <div className="flex items-center gap-4">
          <span
            className="material-symbols-outlined text-[12px] shrink-0"
            style={{ color: isSelected ? 'inherit' : item.iconColor, fontVariationSettings: "'FILL' 1" }}
          >
            {item.icon}
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
        <DataTable 
          columns={columns} 
          data={records} 
          onRowClick={onRecordSelect} 
          selectedId={selectedRecordId} 
        />
      </div>
    </div>
  );
}
