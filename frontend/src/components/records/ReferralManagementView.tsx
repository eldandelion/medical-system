import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';
import { useAuth } from '../../contexts/AuthContext';
import { enrichReferralStatus } from '../../utils/referralUtils';
import { formatDateToChinese } from '../../utils/dateUtils';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS, RISK_LEVEL_DOT_STYLES, STATUS_STYLES, STATUS_LABELS, STATUS_DOT_STYLES, REFERRAL_TYPE_LABELS } from '../../config/styleConstants';
import { StatusBadge } from '../common/StatusBadge';
import { AvatarBadge } from '../common/AvatarBadge';

import { Referral } from '../../types';

// Declare custom elements to avoid @ts-ignore
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-circular-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { indeterminate?: boolean };
    }
  }
}

interface ReferralManagementViewProps {
  onReferralSelect?: (referral: Referral) => void;
  selectedReferralId?: string;
  header?: (loading: boolean) => React.ReactNode;
  userRole?: 'student' | 'teacher' | 'head-councillor' | 'trial-admin' | 'doctor';
  resetToken?: number;
}

const columns: ColumnDefinition<Referral>[] = [
  {
    key: 'studentName',
    label: '学生',
    width: 'w-[25%]',
    overflowVisible: true,
    render: (item, isSelected) => (
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <AvatarBadge name={item.studentName} isSelected={isSelected} size="sm" />
          {item.status === 'AWAITING_REVIEW' && (
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-error)] shadow-[0_0_8px_rgba(179,38,30,0.4)]" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-medium">{item.studentName}</span>
          <span className="text-[12px] opacity-70">学号: {item.studentNumber}</span>
        </div>
      </div>
    )
  },
  {
    key: 'details',
    label: '详情',
    width: 'flex-1',
    render: (item, isSelected) => (
      <div className="flex flex-col justify-center">
        <span className={`text-[14px] truncate max-w-[400px] text-[var(--md-sys-color-on-surface)]`}>
          {item.title}
        </span>
        <div className={`text-[12px] mt-0.5 flex items-center gap-2 ${isSelected ? 'opacity-90' : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'}`}>
          <span className="shrink-0">{formatDateToChinese(item.date)} • {REFERRAL_TYPE_LABELS[item.type] || item.type}</span>
          <div className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container)] shrink-0">
            <div className="w-4 h-4 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center text-[9px] font-bold">
              {item.referredBy?.name?.charAt(0) || '?'}
            </div>
            <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] truncate max-w-[80px] leading-none">
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
    render: (item, isSelected) => (
      <div className="flex items-center">
        <StatusBadge
          dotColorClass={RISK_LEVEL_DOT_STYLES[item.riskLevel] || RISK_LEVEL_DOT_STYLES.LOW}
          label={RISK_LEVEL_LABELS[item.riskLevel] || item.riskLevel}
          isSelected={isSelected}
        />
      </div>
    )
  },
  {
    key: 'status',
    label: '状态',
    width: 'w-[15%]',
    render: (item, isSelected) => {
      const displayStatus = item.displayStatus || item.status;

      return (
        <StatusBadge
          dotColorClass={STATUS_DOT_STYLES[displayStatus] || STATUS_DOT_STYLES.default}
          label={STATUS_LABELS[displayStatus] || displayStatus}
          isSelected={isSelected}
        />
      );
    }
  }
];

export function ReferralManagementView({ onReferralSelect, selectedReferralId, header, userRole, resetToken }: ReferralManagementViewProps) {
  const { session } = useAuth();

  const { data: referralsData, isLoading: loading, isError } = useQuery<Referral[]>({
    queryKey: ['/api/referrals', session.token],
    queryFn: async () => {
      const apiUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/referrals`;
      const res = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch referrals');
      const rawData: Referral[] = await res.json();
      
      return rawData.map((r: any) => enrichReferralStatus(r));
    }
  });
  
  const referrals = referralsData || [];

  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({
    '时间': '从新到旧'
  });

  React.useEffect(() => {
    if (resetToken) {
      setActiveFilters({
        '时间': '从新到旧'
      });
    }
  }, [resetToken]);

  const processedReferrals = React.useMemo(() => {
    let filtered = referrals.filter(r => {
      if (activeFilters['状态'] && activeFilters['状态'] !== '全部') {
        const displayStatus = r.displayStatus || r.status;
        const statusLabel = STATUS_LABELS[displayStatus] || displayStatus;
        if (statusLabel !== activeFilters['状态']) return false;
      }
      if (activeFilters['类型'] && activeFilters['类型'] !== '全部') {
        if (r.type !== activeFilters['类型']) return false;
      }
      if (activeFilters['优先级'] && activeFilters['优先级'] !== '全部') {
        const riskLabel = RISK_LEVEL_LABELS[r.riskLevel] || r.riskLevel;
        if (riskLabel !== activeFilters['优先级']) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (activeFilters['时间'] === '从旧到新') {
        return -diff;
      }
      return diff; // '从新到旧' (default)
    });

    return filtered;
  }, [referrals, activeFilters]);

  return (
    <>
      {header && header(loading)}
      <div className="w-full h-full flex flex-col pt-5 overflow-hidden relative">
        <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-5 pt-5 px-6 mb-6 flex items-center gap-4">
          <FilterChipSet
            className="flex flex-wrap items-center gap-2 relative z-20"
            initialFilters={activeFilters}
            onFilterChange={setActiveFilters}
            chips={[
              { label: '状态', options: ['全部', '进行中', '已批准', '已拒绝', '待审批'] },
              { label: '类型', options: ['全部', 'INITIAL', '随访'] },
              { label: '优先级', options: ['全部', '高', '中', '低'] },
              { label: '时间', options: ['从新到旧', '从旧到新'] }
            ]}
          />
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col relative">
        {isError ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-error)]">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p>加载转诊记录失败，请检查网络或稍后重试。</p>
          </div>
        ) : loading && referrals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            <md-circular-progress indeterminate></md-circular-progress>
          </div>
        ) : (
          <DataTable columns={columns} data={processedReferrals} onRowClick={onReferralSelect} selectedId={selectedReferralId} />
        )}
        </div>
      </div>
    </>
  );
}
