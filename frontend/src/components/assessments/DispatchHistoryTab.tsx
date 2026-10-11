import React, { useState } from 'react';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { useAssessmentDispatches, useAssessmentDispatchHistory } from '../../hooks/useAssessmentDispatchHistory';
import { ParticipationRecordDto, Student } from '../../types';
import { FilterChip } from '../common/FilterChip';
import { ExpandableSearchBar } from '../common/ExpandableSearchBar';
import { AvatarBadge } from '../common/AvatarBadge';
import { formatDateToChinese } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';
import { getAssessmentName } from '../../constants/assessmentDictionary';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';

export interface DispatchHistoryTabProps {
  onSelect?: (student: Student, record: ParticipationRecordDto) => void;
  selectedRecordId?: number | string;
}

export const DispatchHistoryTab: React.FC<DispatchHistoryTabProps> = ({ onSelect, selectedRecordId }) => {
  const [selectedDispatch, setSelectedDispatch] = useState<number | 'latest' | 'ALL'>('latest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [openChip, setOpenChip] = useState<string | null>(null);

  const { data: dispatches } = useAssessmentDispatches();
  const { data: historyPage, isLoading } = useAssessmentDispatchHistory({
    dispatchId: selectedDispatch,
    search: searchQuery,
    severity: selectedSeverity
  });

  React.useEffect(() => {
    if (selectedDispatch === 'latest' && dispatches && dispatches.length > 0) {
      setSelectedDispatch(dispatches[0].id);
    }
  }, [selectedDispatch, dispatches]);

  const { catalog } = useAssessmentCatalogManagement();

  const getDisplayName = (code?: string) => {
    if (!code) return '未知';
    const catalogTitle = catalog?.find(c => c.batteryCode === code)?.title;
    return getAssessmentName(code, catalogTitle);
  };

  const severityOptions = [
    { label: '全部等级', value: 'ALL' },
    { label: '低风险', value: 'LOW' },
    { label: '中风险', value: 'MODERATE' },
    { label: '高风险', value: 'HIGH' },
    { label: '未完成 (Pending)', value: 'PENDING' },
  ];

  const dispatchOptions = [
    { label: '最新指派', value: 'latest' },
    { label: '全部指派', value: 'ALL' },
    ...(dispatches?.map(d => ({ label: `${d.batteryCode} (${new Date(d.dispatchedAt).toLocaleDateString()})`, value: d.id })) || [])
  ];

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待完成',
      'COMPLETED': '已完成',
      'EXPIRED': '已过期',
      'REVOKED': '已撤回'
    };
    return statusMap[status] || status;
  };

  const columns: ColumnDefinition<ParticipationRecordDto>[] = [
    {
      key: 'studentName',
      label: '学生',
      width: 'w-[30%]',
      overflowVisible: true,
      render: (item, isSelected) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <AvatarBadge name={item.studentName} isSelected={isSelected} size="sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-medium">{item.studentName}</span>
            <span className="text-[12px] opacity-70">学号: {item.studentNumber}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'assessmentName', 
      label: '量表名称', 
      width: 'w-[45%]',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">
            {getDisplayName(item.assessmentName)}
          </span>
          <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
            {item.dispatchedAt ? formatDateToChinese(item.dispatchedAt) : '-'}
          </span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: '状态', 
      width: 'w-[20%]',
      render: (item, isSelected) => (
        <StatusBadge
          dotColorClass={item.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}
          label={translateStatus(item.status)}
          isSelected={isSelected}
        />
      )
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4 px-6 shrink-0 z-20">
        <ExpandableSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索学号 / 姓名"
        />
        <FilterChip
          label="指派批次"
          options={dispatchOptions.map(o => o.label)}
          selectedValue={dispatchOptions.find(o => o.value === selectedDispatch)?.label}
          onOptionSelect={(label) => {
            const opt = dispatchOptions.find(o => o.label === label);
            if (opt) {
              setSelectedDispatch(opt.value === 'ALL' || opt.value === 'latest' ? opt.value : Number(opt.value));
            }
          }}
          isOpen={openChip === 'dispatch'}
          onToggle={() => setOpenChip(openChip === 'dispatch' ? null : 'dispatch')}
        />
        <FilterChip
          label="预警等级"
          options={severityOptions.map(o => o.label)}
          selectedValue={severityOptions.find(o => o.value === selectedSeverity)?.label}
          onOptionSelect={(label) => {
            const opt = severityOptions.find(o => o.label === label);
            if (opt) {
              setSelectedSeverity(opt.value);
            }
          }}
          isOpen={openChip === 'severity'}
          onToggle={() => setOpenChip(openChip === 'severity' ? null : 'severity')}
        />
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] shadow-sm rounded-full px-4 py-1.5 z-10 text-sm text-[var(--md-sys-color-on-surface)]">
            <span className="material-symbols-outlined animate-spin mr-2 text-[16px]">sync</span>
            加载中...
          </div>
        )}
        <DataTable
          columns={columns}
          data={historyPage?.content || []}
          selectedId={selectedRecordId}
          getRowId={(row) => row.assignmentId}
          onRowClick={(row) => onSelect?.({
            id: String(row.studentId || row.studentNumber),
            studentNumber: row.studentNumber,
            name: row.studentName,
            major: '',
            status: 'Active'
          }, row)}
        />
      </div>
    </div>
  );
};
