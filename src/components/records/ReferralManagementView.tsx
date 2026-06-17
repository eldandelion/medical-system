import * as React from 'react';
import { useDataFetch } from '../../hooks/useDataFetch';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';
import { useAuth } from '../../contexts/AuthContext';
import { enrichReferralStatus } from '../../utils/referralUtils';
import { formatDateToChinese } from '../../utils/dateUtils';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS, STATUS_STYLES, STATUS_LABELS } from '../../config/styleConstants';

import { Referral } from '../../types';

interface ReferralManagementViewProps {
  onReferralSelect?: (referral: Referral) => void;
  selectedReferralId?: string;
  header?: (loading: boolean) => React.ReactNode;
  userRole?: 'student' | 'teacher' | 'head-councillor' | 'trial-admin' | 'doctor';
}

const columns: ColumnDefinition<Referral>[] = [
  {
    key: 'studentName',
    label: '学生',
    width: 'w-[25%]',
    render: (item) => (
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-medium">
            {item.studentName.charAt(0)}
          </div>
          {item.status === 'AwaitingApproval' && (
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-error)] shadow-[0_0_8px_rgba(179,38,30,0.4)]" />
          )}
        </div>
        <span className="text-[14px] font-normal">{item.studentName}</span>
      </div>
    )
  },
  {
    key: 'details',
    label: '详情',
    width: 'flex-1',
    render: (item, isSelected) => (
      <div className="flex flex-col justify-center">
        <span className={`text-[14px] font-medium truncate max-w-[400px] ${isSelected ? '' : 'text-[var(--md-sys-color-on-surface)]'}`}>
          {item.title}
        </span>
        <div className={`text-[12px] mt-0.5 flex items-center gap-2 ${isSelected ? 'opacity-90' : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'}`}>
          <span className="shrink-0">{formatDateToChinese(item.date)} • {item.type}</span>
          <div className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] border-opacity-20 shrink-0">
            <div className="w-4 h-4 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center text-[9px] font-bold">
              {item.referredBy?.name?.charAt(0) || '?'}
            </div>
            <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface)] truncate max-w-[80px] leading-none">
              {item.referredBy?.name || '未知'}
            </span>
          </div>
        </div>
      </div>
    )
  },
  {
    key: 'riskLevel',
    label: '风险等级',
    width: 'w-[15%]',
    render: (item) => (
      <div className="flex items-center">
        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${RISK_LEVEL_STYLES[item.riskLevel]}`}>
          {RISK_LEVEL_LABELS[item.riskLevel] || item.riskLevel}
        </span>
      </div>
    )
  },
  {
    key: 'status',
    label: '状态',
    width: 'w-[15%]',
    render: (item) => {
      const displayStatus = item.displayStatus || item.status;

      return (
        <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${STATUS_STYLES[displayStatus] || STATUS_STYLES.default}`}>
          {STATUS_LABELS[displayStatus] || displayStatus}
        </span>
      );
    }
  }
];

export function ReferralManagementView({ onReferralSelect, selectedReferralId, header, userRole }: ReferralManagementViewProps) {
  const { session } = useAuth();
  
  const processReferrals = React.useCallback((data: any) => {
    const enrichedData = (data as Referral[]).map(enrichReferralStatus);
    return enrichedData.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, []);

  const { data: referralsData, loading } = useDataFetch<Referral[]>(
    '/api/referrals', 
    processReferrals, 
    { headers: { 'Authorization': `Bearer ${session.token}` } }
  );
  
  const referrals = referralsData || [];

  return (
    <>
      {header && header(loading)}
      <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
        <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4">
          <FilterChipSet
            chips={[
              { label: '状态', options: ['进行中', '已批准', '已拒绝', '审核中'] },
              { label: '类型', options: ['初次转诊', '随访', '紧急', '结业'] },
              { label: '优先级', options: ['高', '中', '低'] },
              { label: '指派至', options: ['教职工', '部门负责人', '顾问'] }
            ]}
          />
        </div>
        
        {loading && referrals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            {/* @ts-ignore */}
            <md-circular-progress indeterminate></md-circular-progress>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col relative">
            <DataTable columns={columns} data={referrals} onRowClick={onReferralSelect} selectedId={selectedReferralId} />
          </div>
        )}
      </div>
    </>
  );
}
