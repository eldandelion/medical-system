import * as React from 'react';
import { DataTable, ColumnDefinition } from '../common/DataTable';

interface Counselor {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  activeCaseload: number;
  status: 'Active' | 'Inactive' | 'Suspended';
}

interface StaffManagementViewProps {
  onStaffSelect?: (staff: Counselor) => void;
  selectedStaffId?: string;
}

export function StaffManagementView({ onStaffSelect, selectedStaffId }: StaffManagementViewProps) {
  const counselors: Counselor[] = [
    {
      id: 'c1',
      name: 'Dr. Zhang Wei',
      employeeId: 'EMP-1102',
      department: 'School of Medicine',
      activeCaseload: 15,
      status: 'Active'
    },
    {
      id: 'c2',
      name: 'Li Na',
      employeeId: 'EMP-1105',
      department: 'School of Engineering',
      activeCaseload: 8,
      status: 'Active'
    },
    {
      id: 'c3',
      name: 'Wang Ming',
      employeeId: 'EMP-1109',
      department: 'School of Economics',
      activeCaseload: 22,
      status: 'Suspended'
    },
    {
      id: 'c4',
      name: 'Chen Jia',
      employeeId: 'EMP-1112',
      department: 'School of Arts',
      activeCaseload: 3,
      status: 'Inactive'
    }
  ];

  const columns: ColumnDefinition<Counselor>[] = [
    {
      key: 'name',
      label: 'Counselor',
      width: 'w-[35%]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[13px] font-medium shrink-0 uppercase">
            {item.name.replace('Dr. ', '').charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-medium">{item.name}</span>
            <span className="text-[12px] opacity-70">ID: {item.employeeId}</span>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      width: 'w-[30%]',
      render: (item) => (
        <span className="text-[14px]">{item.department}</span>
      )
    },
    {
      key: 'caseload',
      label: 'Caseload',
      width: 'flex-1',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-[14px] font-medium">{item.activeCaseload} Active Referrals</span>
          <div className="w-24 h-1.5 bg-[var(--md-sys-color-surface-container-highest)] rounded-full mt-1.5 overflow-hidden">
             <div 
               className="h-full bg-[var(--md-sys-color-primary)] opacity-60" 
               style={{ width: `${Math.min(100, (item.activeCaseload / 25) * 100)}%` }}
             ></div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[120px]',
      render: (item) => {
        const isActive = item.status === 'Active';
        return (
          <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${
            isActive 
              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
              : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
          }`}>
            {item.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="w-full h-full flex flex-col pt-4 overflow-hidden">
      <div className="px-6 mb-2">
        <h2 className="text-[22px] font-normal text-[var(--md-sys-color-on-surface)]">Counselor Registry</h2>
        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">Manage staff authorization and workload distribution</p>
      </div>
      <div className="flex-1 overflow-hidden mt-4">
        <DataTable 
          columns={columns} 
          data={counselors} 
          onRowClick={onStaffSelect} 
          selectedId={selectedStaffId} 
        />
      </div>
    </div>
  );
}
