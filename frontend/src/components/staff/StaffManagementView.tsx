import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeachers, TeacherSummaryDto } from '../../api/teachers';
import { AccountStatus } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { AvatarBadge } from '../common/AvatarBadge';
import { FilterChipSet } from '../common/FilterChip';
import { SecondaryButton } from '../common/Buttons';

interface StaffManagementViewProps {
  onStaffSelect?: (staff: TeacherSummaryDto) => void;
  selectedStaffId?: string | number;
  resetToken?: number;
}

const STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: '已启用',
  PENDING_APPROVAL: '待审核',
  DISABLED: '已禁用',
  DELETED: '已注销',
};

const STATUS_DOTS: Record<AccountStatus, string> = {
  ACTIVE: 'bg-[var(--md-sys-color-primary-container)]',
  PENDING_APPROVAL: 'bg-[var(--md-sys-color-tertiary-container)]',
  DISABLED: 'bg-[var(--md-sys-color-surface-container-highest)]',
  DELETED: 'bg-[var(--md-sys-color-error-container)]',
};

export function StaffManagementView({
  onStaffSelect,
  selectedStaffId,
  resetToken,
}: StaffManagementViewProps) {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (resetToken) {
      setSearchQuery('');
      setActiveFilters({});
    }
  }, [resetToken]);

  const {
    data: teachers = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<TeacherSummaryDto[]>({
    queryKey: ['/api/teachers', session?.token],
    queryFn: () => fetchTeachers(session?.token),
  });

  const filteredTeachers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const statusFilter = activeFilters['状态'];
    return teachers.filter((teacher) => {
      if (statusFilter && STATUS_LABELS[teacher.status] !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        teacher.name.toLowerCase().includes(q) ||
        teacher.employeeNumber.toLowerCase().includes(q) ||
        teacher.collegeName.toLowerCase().includes(q)
      );
    });
  }, [teachers, searchQuery, activeFilters]);

  const columns: ColumnDefinition<TeacherSummaryDto>[] = [
    {
      key: 'name',
      label: '教师姓名',
      width: 'w-[34%]',
      overflowVisible: true,
      render: (item, isSelected) => (
        <div className="flex items-center gap-3">
          <AvatarBadge name={item.name} isSelected={isSelected} size="sm" className="uppercase" />
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-medium truncate">{item.name}</span>
            <span className="text-[12px] opacity-70 truncate">工号: {item.employeeNumber}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'collegeName',
      label: '所属学院',
      width: 'w-[28%]',
      render: (item) => <span className="text-[14px] truncate">{item.collegeName}</span>,
    },
    {
      key: 'assignedStudentCount',
      label: '负责学生',
      width: 'flex-1',
      render: (item) => (
        <span className="text-[14px] font-medium">{item.assignedStudentCount} 名负责学生</span>
      ),
    },
    {
      key: 'status',
      label: '账号状态',
      width: 'w-[120px]',
      render: (item, isSelected) => (
        <StatusBadge
          dotColorClass={STATUS_DOTS[item.status] || STATUS_DOTS.DISABLED}
          label={STATUS_LABELS[item.status] || item.status}
          isSelected={isSelected}
        />
      ),
    },
  ];

  return (
    <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
      <div className="px-6 mb-2 shrink-0 z-10 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4 flex flex-col gap-3">
        <div>
          <h2 className="text-[22px] font-normal text-[var(--md-sys-color-on-surface)]">教师与导师名录</h2>
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
            查看教师详情并分配或调整负责学生
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <FilterChipSet
            className="flex flex-wrap items-center gap-2 relative z-20"
            chips={[{ label: '状态', options: ['已启用', '待审核', '已禁用'] }]}
            initialFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <div className="w-full sm:w-72">
            {/* @ts-ignore */}
            <md-outlined-text-field
              class="w-full"
              label="搜索教师"
              placeholder="输入姓名、工号或学院"
              value={searchQuery}
              onInput={(e: React.FormEvent<HTMLElement>) => {
                setSearchQuery((e.target as HTMLInputElement).value ?? '');
              }}
            >
              {/* @ts-ignore */}
              <md-icon slot="leading-icon">search</md-icon>
              {/* @ts-ignore */}
            </md-outlined-text-field>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-1 flex flex-col min-h-0 relative">
        {isLoading && teachers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            {/* @ts-ignore */}
            <md-circular-progress indeterminate></md-circular-progress>
          </div>
        ) : isError && teachers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="material-symbols-outlined text-[40px] text-[var(--md-sys-color-error)]">
              error_outline
            </span>
            <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              无法加载教师列表，请检查网络或权限后重试
            </p>
            <SecondaryButton label="重试" icon="refresh" noCollapse onClick={() => refetch()} />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center text-[var(--md-sys-color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[40px] opacity-60">engineering</span>
            <p className="text-[14px]">暂无符合条件的教师记录</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredTeachers}
            onRowClick={onStaffSelect}
            selectedId={selectedStaffId}
          />
        )}
      </div>
    </div>
  );
}
