import * as React from 'react';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';

interface Referral {
  id: string;
  studentName: string;
  type: string;
  date: string;
  reason: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Closed' | 'Pending' | 'Approved' | 'AwaitingApproval';
  referredBy: {
    name: string;
    avatar?: string;
  };
}

interface ReferralManagementViewProps {
  onReferralSelect?: (referral: Referral) => void;
  selectedReferralId?: string;
}

export function ReferralManagementView({ onReferralSelect, selectedReferralId }: ReferralManagementViewProps) {
  const referrals: Referral[] = ([
    {
      id: '1',
      studentName: 'Daniil Petrov',
      type: '初次转诊',
      date: '2026年4月12日',
      reason: '期中考试后出现急性恐慌发作和睡眠剥夺',
      riskLevel: 'High',
      status: 'Approved',
      referredBy: { name: '张教授' }
    },
    {
      id: '2',
      studentName: 'Alice Smith',
      type: '随访',
      date: '2026年4月20日',
      reason: '每周治疗随访；情绪持续低落',
      riskLevel: 'Medium',
      status: 'Pending',
      referredBy: { name: '李医生' }
    },
    {
      id: '3',
      studentName: 'Bob Johnson',
      type: '初次转诊',
      date: '2026年5月5日',
      reason: '因注意力问题和学业压力自愿转诊',
      riskLevel: 'Low',
      status: 'Draft',
      referredBy: { name: '王老师' }
    },
    {
      id: '4',
      studentName: 'Elena Gilbert',
      type: '紧急',
      date: '2026年4月18日',
      reason: '宿舍事故报告；提到自杀意念',
      riskLevel: 'High',
      status: 'Approved',
      referredBy: { name: '宿舍管理员' }
    },
    {
      id: '5',
      studentName: 'Chris Evans',
      type: '随访',
      date: '2026年4月15日',
      reason: '药物复核；报告注意力集中情况有所改善',
      riskLevel: 'Low',
      status: 'Closed',
      referredBy: { name: '李医生' }
    },
    {
      id: '6',
      studentName: 'Sarah Connor',
      type: '初次转诊',
      date: '2026年4月22日',
      reason: '持续疲劳并退出社交活动',
      riskLevel: 'Medium',
      status: 'Pending',
      referredBy: { name: '张教授' }
    },
    {
      id: '7',
      studentName: 'James Bond',
      type: '转诊',
      date: '2026年4月10日',
      reason: '与工作相关的压力和创伤后症状',
      riskLevel: 'High',
      status: 'Closed',
      referredBy: { name: '心理咨询中心' }
    },
    {
      id: '8',
      studentName: '王小明',
      type: '初次转诊',
      date: '2026年4月28日',
      reason: '由于学业压力导致严重的睡眠障碍和情绪波动',
      riskLevel: 'Medium',
      status: 'AwaitingApproval',
      referredBy: { name: '陈老师' }
    },
  ] as Referral[]).sort((a, b) => {
    if (a.status === 'AwaitingApproval' && b.status !== 'AwaitingApproval') return -1;
    if (a.status !== 'AwaitingApproval' && b.status === 'AwaitingApproval') return 1;
    return 0;
  });

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
      <DataTable columns={columns} data={referrals} onRowClick={onReferralSelect} selectedId={selectedReferralId} />
    </div>
  );
}
