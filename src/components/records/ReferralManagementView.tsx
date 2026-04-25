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
  status: 'Draft' | 'Closed' | 'Pending' | 'Approved';
}

interface ReferralManagementViewProps {
  onReferralSelect?: (referral: Referral) => void;
  selectedReferralId?: string;
}

export function ReferralManagementView({ onReferralSelect, selectedReferralId }: ReferralManagementViewProps) {
  const referrals: Referral[] = [
    { 
      id: '1', 
      studentName: 'Daniil Petrov', 
      type: 'Initial Referral', 
      date: 'Apr 12, 2026', 
      reason: 'Acute panic attacks and sleep deprivation after midterms',
      riskLevel: 'High',
      status: 'Approved' 
    },
    { 
      id: '2', 
      studentName: 'Alice Smith', 
      type: 'Follow-up', 
      date: 'Apr 20, 2026', 
      reason: 'Weekly therapy session follow-up; persistent low mood',
      riskLevel: 'Medium',
      status: 'Pending' 
    },
    { 
      id: '3', 
      studentName: 'Bob Johnson', 
      type: 'Initial Referral', 
      date: 'May 05, 2026', 
      reason: 'Self-referred for focus issues and academic pressure',
      riskLevel: 'Low',
      status: 'Draft' 
    },
    { 
      id: '4', 
      studentName: 'Elena Gilbert', 
      type: 'Emergency', 
      date: 'Apr 18, 2026', 
      reason: 'Incident report from dorm; suicidal ideation mentioned',
      riskLevel: 'High',
      status: 'Approved' 
    },
    { 
      id: '5', 
      studentName: 'Chris Evans', 
      type: 'Follow-up', 
      date: 'Apr 15, 2026', 
      reason: 'Medication review; reporting improved concentration',
      riskLevel: 'Low',
      status: 'Closed' 
    },
    { 
      id: '6', 
      studentName: 'Sarah Connor', 
      type: 'Initial Referral', 
      date: 'Apr 22, 2026', 
      reason: 'Persistent fatigue and withdrawal from social activities',
      riskLevel: 'Medium',
      status: 'Pending' 
    },
    { 
      id: '7', 
      studentName: 'James Bond', 
      type: 'Referral', 
      date: 'Apr 10, 2026', 
      reason: 'Work-related stress and post-traumatic symptoms',
      riskLevel: 'High',
      status: 'Closed' 
    },
  ];

  const columns: ColumnDefinition<Referral>[] = [
    {
      key: 'studentName',
      label: 'Student',
      width: 'w-[25%]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-medium shrink-0">
            {item.studentName.charAt(0)}
          </div>
          <span className="text-[14px] font-normal">{item.studentName}</span>
        </div>
      )
    },
    {
      key: 'details',
      label: 'Details',
      width: 'flex-1',
      render: (item, isSelected) => (
        <div className="flex flex-col justify-center">
          <span className={`text-[14px] font-medium truncate max-w-[400px] ${isSelected ? '' : 'text-[var(--md-sys-color-on-surface)]'}`}>
            {item.reason}
          </span>
          <span className={`text-[12px] mt-0.5 ${isSelected ? 'opacity-90' : 'text-[var(--md-sys-color-on-surface-variant)] opacity-70'}`}>
            {item.date} • {item.type}
          </span>
        </div>
      )
    },
    {
      key: 'riskLevel',
      label: 'Risk Level',
      width: 'w-[15%]',
      render: (item) => (
        <div className="flex items-center">
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
            item.riskLevel === 'High' 
              ? 'bg-[#fee2e2] text-[#991b1b]' // Red for High
              : item.riskLevel === 'Medium'
              ? 'bg-[#fef9c3] text-[#854d0e]' // Yellow for Medium
              : 'bg-[#f0fdf4] text-[#166534]' // Green for Low
          }`}>
            {item.riskLevel}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[15%]',
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${
          item.status === 'Approved' 
            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
            : item.status === 'Pending'
            ? 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]'
            : item.status === 'Closed'
            ? 'bg-[#f0fdf4] text-[#166534]' // Green for Closed
            : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
        }`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col pt-4">
      <FilterChipSet 
        chips={[
          { label: 'Status', options: ['Pending', 'Approved', 'Rejected', 'Under Review'] },
          { label: 'Type', options: ['Initial Referral', 'Follow-up', 'Emergency', 'Graduation'] },
          { label: 'Priority', options: ['High', 'Medium', 'Low'] },
          { label: 'Assigned To', options: ['Faculty Staff', 'Department Head', 'Advisors'] }
        ]} 
      />
      <DataTable columns={columns} data={referrals} onRowClick={onReferralSelect} selectedId={selectedReferralId} />
    </div>
  );
}
