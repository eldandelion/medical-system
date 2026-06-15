import * as React from 'react';
import { useDataFetch } from '../../hooks/useDataFetch';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';
import { useAuth } from '../../contexts/AuthContext';

import { Referral } from '../../types';

interface ReferralManagementViewProps {
  onReferralSelect?: (referral: Referral) => void;
  selectedReferralId?: string;
  onLoadingChange?: (loading: boolean) => void;
  userRole?: 'student' | 'teacher' | 'head-councillor' | 'trial-admin';
}

export function ReferralManagementView({ onReferralSelect, selectedReferralId, onLoadingChange, userRole }: ReferralManagementViewProps) {
  const { session } = useAuth();
  
  const processReferrals = React.useCallback((data: any) => {
    return (data as Referral[]).sort((a, b) => {
      if (a.status === 'AwaitingApproval' && b.status !== 'AwaitingApproval') return -1;
      if (a.status !== 'AwaitingApproval' && b.status === 'AwaitingApproval') return 1;
      
      const parseDate = (dStr: string) => {
        const match = dStr.match(/(\d+)年(\d+)月(\d+)日/);
        if (match) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])).getTime();
        }
        return 0;
      };
      
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB - dateA;
    });
  }, []);

  const { data: referralsData, loading } = useDataFetch<Referral[]>(
    '/api/referrals', 
    processReferrals, 
    { headers: { 'Authorization': `Bearer ${session.token}` } }
  );
  
  const referrals = referralsData || [];

  React.useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

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
      render: (item) => {
        let displayStatus = item.status;
        const steps = item.extendedData?.steps;
        if (steps) {
          if (steps.some(s => s.status === 'issue') && item.status !== 'Rejected') {
            displayStatus = 'Error';
          } else if (item.status !== 'Rejected') {
            const activeStep = steps.find(s => s.status === 'active');
            if (activeStep) {
              if (activeStep.type === 'triage') {
                displayStatus = 'AwaitingTriage';
              } else if (activeStep.type === 'evaluation') {
                displayStatus = 'Pending';
              } else if (activeStep.type === 'feedback') {
                displayStatus = 'AwaitingFeedbackApproval';
              }
            }
          }
        }

        return (
          <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${displayStatus === 'Approved'
            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
            : displayStatus === 'AwaitingApproval'
              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              : displayStatus === 'AwaitingTriage'
                ? 'bg-[#f3e8ff] text-[#6b21a8]' // Purple for Awaiting Assignment
              : displayStatus === 'Pending'
                ? 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
                : displayStatus === 'Closed'
                  ? 'bg-[#f0fdf4] text-[#166534]' // Green for Closed
                  : displayStatus === 'Recalled'
                    ? 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                    : displayStatus === 'Error' || displayStatus === 'Rejected'
                      ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                      : displayStatus === 'AwaitingFeedbackApproval'
                        ? 'bg-[#fef9c3] text-[#854d0e]' // Yellowish for awaiting feedback
                        : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
            }`}>
            {displayStatus === 'Approved' ? '已批准' :
              displayStatus === 'AwaitingApproval' ? '待审批' :
                displayStatus === 'AwaitingTriage' ? '待分配' :
                displayStatus === 'Pending' ? '进行中' :
                  displayStatus === 'Closed' ? '已结案' :
                    displayStatus === 'Draft' ? '草案' :
                      displayStatus === 'Recalled' ? '已撤回' :
                        displayStatus === 'Error' ? '异常' :
                          displayStatus === 'Rejected' ? '被拒绝' :
                            displayStatus === 'AwaitingFeedbackApproval' ? '待反馈审批' :
                              displayStatus}
          </span>
        );
      }
    }
  ];

  return (
    <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
      <div className="shrink-0 z-10 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4">
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
          {/* Loading state is handled by parent CanvasHeader */}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col relative">
          <DataTable columns={columns} data={referrals} onRowClick={onReferralSelect} selectedId={selectedReferralId} />
        </div>
      )}
    </div>
  );
}
