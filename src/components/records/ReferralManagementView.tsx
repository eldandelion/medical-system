import * as React from 'react';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';

import { Referral } from '../../types';

interface ReferralManagementViewProps {
  onReferralSelect?: (referral: Referral) => void;
  selectedReferralId?: string;
}

export function ReferralManagementView({ onReferralSelect, selectedReferralId }: ReferralManagementViewProps) {
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    fetch('/api/referrals')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch referrals');
        return res.json();
      })
      .then((data) => {
        if (active) {
          const sorted = (data as Referral[]).sort((a, b) => {
            if (a.status === 'AwaitingApproval' && b.status !== 'AwaitingApproval') return -1;
            if (a.status !== 'AwaitingApproval' && b.status === 'AwaitingApproval') return 1;
            return 0;
          });
          setReferrals(sorted);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load referrals:', err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

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
            {item.reason}
          </span>
          <div className={`text-[12px] mt-0.5 flex items-center gap-2 ${isSelected ? 'opacity-90' : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'}`}>
            <span className="shrink-0">{item.date} • {item.type}</span>
            <div className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] border-opacity-20 shrink-0">
              <div className="w-4 h-4 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center text-[9px] font-bold">
                {item.referredBy.name.charAt(0)}
              </div>
              <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface)] truncate max-w-[80px] leading-none">
                {item.referredBy.name}
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
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${item.riskLevel === 'High'
            ? 'bg-[#fee2e2] text-[#991b1b]' // Red for High
            : item.riskLevel === 'Medium'
              ? 'bg-[#fef9c3] text-[#854d0e]' // Yellow for Medium
              : 'bg-[#f0fdf4] text-[#166534]' // Green for Low
            }`}>
            {item.riskLevel === 'High' ? '高' : item.riskLevel === 'Medium' ? '中' : '低'}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: '状态',
      width: 'w-[15%]',
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${item.status === 'Approved'
          ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
          : item.status === 'AwaitingApproval'
            ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
            : item.status === 'Pending'
              ? 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
              : item.status === 'Closed'
                ? 'bg-[#f0fdf4] text-[#166534]' // Green for Closed
                : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
          }`}>
          {item.status === 'Approved' ? '已批准' :
            item.status === 'AwaitingApproval' ? '待审批' :
              item.status === 'Pending' ? '进行中' :
                item.status === 'Closed' ? '已结案' :
                  item.status === 'Draft' ? '草案' :
                    item.status}
        </span>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col pt-4">
      <FilterChipSet
        chips={[
          { label: '状态', options: ['进行中', '已批准', '已拒绝', '审核中'] },
          { label: '类型', options: ['初次转诊', '随访', '紧急', '结业'] },
          { label: '优先级', options: ['高', '中', '低'] },
          { label: '指派至', options: ['教职工', '部门负责人', '顾问'] }
        ]}
      />
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
          {/* @ts-ignore */}
          <md-linear-progress indeterminate className="w-full max-w-xs mb-4"></md-linear-progress>
          <span className="text-[14px] opacity-75">正在获取转诊记录...</span>
        </div>
      ) : (
        <DataTable columns={columns} data={referrals} onRowClick={onReferralSelect} selectedId={selectedReferralId} />
      )}
    </div>
  );
}
