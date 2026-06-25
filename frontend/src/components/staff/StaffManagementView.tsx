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
      name: '张伟医生',
      employeeId: 'EMP-1102',
      department: '医学院',
      activeCaseload: 15,
      status: 'Active'
    },
    {
      id: 'c2',
      name: '李娜',
      employeeId: 'EMP-1105',
      department: '工学院',
      activeCaseload: 8,
      status: 'Active'
    },
    {
      id: 'c3',
      name: '王明',
      employeeId: 'EMP-1109',
      department: '经济学院',
      activeCaseload: 22,
      status: 'Suspended'
    },
    {
      id: 'c4',
      name: '陈佳',
      employeeId: 'EMP-1112',
      department: '艺术学院',
      activeCaseload: 3,
      status: 'Inactive'
    }
  ];

  const columns: ColumnDefinition<Counselor>[] = [
    {
      key: 'name',
      label: '咨询师',
      width: 'w-[35%]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[13px] font-medium shrink-0 uppercase">
            {item.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-medium">{item.name}</span>
            <span className="text-[12px] opacity-70">工号: {item.employeeId}</span>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: '院系',
      width: 'w-[30%]',
      render: (item) => (
        <span className="text-[14px]">{item.department}</span>
      )
    },
    {
      key: 'caseload',
      label: '个案量',
      width: 'flex-1',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-[14px] font-medium">{item.activeCaseload} 个活跃转诊</span>
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
      label: '状态',
      width: 'w-[120px]',
      render: (item) => {
        const isActive = item.status === 'Active';
        return (
          <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${
            isActive 
              ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
              : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
          }`}>
            {item.status === 'Active' ? '活跃' : item.status === 'Inactive' ? '非活跃' : '暂停'}
          </span>
        );
      }
    }
  ];

  return (
    <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
      <div className="px-6 mb-2 shrink-0 z-10 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4">
        <h2 className="text-[22px] font-normal text-[var(--md-sys-color-on-surface)]">咨询师登记表</h2>
        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">管理人员授权与工作负荷分配</p>
      </div>
      <div className="flex-1 overflow-hidden mt-2 flex flex-col min-h-0 relative">
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
