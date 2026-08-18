import React, { useState, useMemo } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { AdminUserSummaryDto, AccountStatus } from '../../types/admin';
import { roleTranslations } from '../../utils/roleTranslations';
import { DataTable, ColumnDefinition } from '../common/DataTable';

interface UserManagementViewProps {
  onSelectUser?: (user: AdminUserSummaryDto) => void;
  selectedUserId?: number | null;
  header?: (loading: boolean) => React.ReactNode;
}

type TabType = 'ALL' | 'PENDING' | 'TEACHER' | 'HEAD_COUNSELLOR' | 'TRIAL_ADMIN' | 'DOCTOR' | 'STUDENT';

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  onSelectUser,
  selectedUserId,
  header
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { users, isLoading, isError, refetch } = useAdminUsers();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filtering
      if (activeTab === 'PENDING' && u.status !== 'PENDING_APPROVAL') return false;
      if (activeTab === 'TEACHER' && u.role !== 'TEACHER') return false;
      if (activeTab === 'HEAD_COUNSELLOR' && u.role !== 'HEAD_COUNSELLOR') return false;
      if (activeTab === 'TRIAL_ADMIN' && u.role !== 'TRIAL_ADMIN') return false;
      if (activeTab === 'DOCTOR' && u.role !== 'DOCTOR') return false;
      if (activeTab === 'STUDENT' && u.role !== 'STUDENT') return false;

      // Search keyword filtering
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(kw);
        const matchesEmail = u.email.toLowerCase().includes(kw);
        const matchesId = u.employeeOrStudentId?.toLowerCase().includes(kw) ?? false;
        const matchesDept = u.departmentOrCollege?.toLowerCase().includes(kw) ?? false;
        const matchesHospital = u.hospital?.toLowerCase().includes(kw) ?? false;
        return matchesName || matchesEmail || matchesId || matchesDept || matchesHospital;
      }
      return true;
    });
  }, [users, activeTab, searchKeyword]);

  const pendingCount = useMemo(() => {
    return users.filter((u) => u.status === 'PENDING_APPROVAL').length;
  }, [users]);

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-3 py-1 rounded-full text-[12px] font-bold tracking-[0.5px] bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
            已启用
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="px-3 py-1 rounded-full text-[12px] font-bold tracking-[0.5px] bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
            待审核
          </span>
        );
      case 'DISABLED':
        return (
          <span className="px-3 py-1 rounded-full text-[12px] font-bold tracking-[0.5px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
            已禁用
          </span>
        );
      case 'DELETED':
        return (
          <span className="px-3 py-1 rounded-full text-[12px] font-bold tracking-[0.5px] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
            已注销
          </span>
        );
    }
  };

  const columns: ColumnDefinition<AdminUserSummaryDto>[] = [
    {
      key: 'name',
      label: '用户',
      width: 'w-[32%]',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[13px] font-medium shrink-0 uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-medium truncate">{user.name}</span>
            <span className="text-[12px] opacity-70 truncate">{user.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: '角色',
      width: 'w-[16%]',
      render: (user) => (
        <span className="text-[14px]">{roleTranslations[user.role] || user.role}</span>
      )
    },
    {
      key: 'employeeOrStudentId',
      label: '工号 / 学号',
      width: 'w-[18%]',
      render: (user) => (
        <span className="text-[14px] opacity-80">{user.employeeOrStudentId || '-'}</span>
      )
    },
    {
      key: 'departmentOrCollege',
      label: '院系 / 附属医院',
      width: 'w-[20%]',
      render: (user) => (
        <span className="text-[14px] truncate">{user.hospital || user.departmentOrCollege || '-'}</span>
      )
    },
    {
      key: 'status',
      label: '状态',
      width: 'w-[14%]',
      render: (user) => getStatusBadge(user.status)
    }
  ];

  const TABS: { id: TabType; label: string; icon: string; count?: number }[] = [
    { id: 'ALL', label: '全部用户', icon: 'apps', count: users.length },
    { id: 'PENDING', label: '待审核', icon: 'pending_actions', count: pendingCount },
    { id: 'TEACHER', label: '教研教师', icon: 'school' },
    { id: 'HEAD_COUNSELLOR', label: '主任辅导员', icon: 'psychology' },
    { id: 'TRIAL_ADMIN', label: '医院初审', icon: 'admin_panel_settings' },
    { id: 'DOCTOR', label: '专科医生', icon: 'medical_services' },
    { id: 'STUDENT', label: '学生', icon: 'person' },
  ];

  return (
    <>
      {header && header(isLoading)}
      <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
        {/* Top Filter Chips and Search Bar (Positioned directly under title) */}
        <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4 px-6 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          {/* Material Design 3 Filter Chips */}
          <md-chip-set aria-label="用户角色与状态筛选">
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              const labelWithCount =
                tab.id === 'PENDING' && pendingCount > 0
                  ? `${tab.label} (${pendingCount})`
                  : tab.id === 'ALL' && users.length > 0
                  ? `${tab.label} (${users.length})`
                  : tab.label;

              return (
                <md-filter-chip
                  key={tab.id}
                  label={labelWithCount}
                  selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  has-icon
                >
                  <md-icon slot="icon">{tab.icon}</md-icon>
                </md-filter-chip>
              );
            })}
          </md-chip-set>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <span
              className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none"
              style={{ fontSize: '18px', width: '18px', height: '18px', lineHeight: '18px' }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="搜索姓名、工号/学号、院系..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full h-9 pl-10 pr-8 rounded-full text-xs bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-outline)] border border-transparent focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface)] focus:outline-none transition-all"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] p-0.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors flex items-center justify-center"
              >
                <span
                  className="material-symbols-outlined block"
                  style={{ fontSize: '16px', width: '16px', height: '16px', lineHeight: '16px' }}
                >
                  close
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 flex flex-col relative mt-2">
          {isLoading && users.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
              {/* @ts-ignore */}
              <md-circular-progress indeterminate></md-circular-progress>
            </div>
          ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-[var(--md-sys-color-error)]">
              <span className="material-symbols-outlined text-4xl mb-2">error</span>
              <p className="text-sm mb-3">加载用户列表失败，请检查网络或稍后重试。</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-1.5 text-xs font-medium rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
              >
                重试
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredUsers}
              onRowClick={onSelectUser}
              selectedId={selectedUserId ?? undefined}
            />
          )}
        </div>
      </div>
    </>
  );
};
