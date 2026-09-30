import React, { useState, useMemo } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { AdminUserSummaryDto, AccountStatus } from '../../types/admin';
import { roleTranslations } from '../../utils/roleTranslations';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { ExpandableSearchBar } from '../common/ExpandableSearchBar';
import { StatusBadge } from '../common/StatusBadge';

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
          <StatusBadge
            dotColorClass="bg-[var(--md-sys-color-secondary-container)]"
            label="已启用"
          />
        );
      case 'PENDING_APPROVAL':
        return (
          <StatusBadge
            dotColorClass="bg-[var(--md-sys-color-tertiary-container)]"
            label="待审核"
          />
        );
      case 'DISABLED':
        return (
          <StatusBadge
            dotColorClass="bg-[var(--md-sys-color-surface-container-high)]"
            label="已禁用"
          />
        );
      case 'DELETED':
        return (
          <StatusBadge
            dotColorClass="bg-[var(--md-sys-color-error-container)]"
            label="已注销"
          />
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

  const chipSetRef = React.useRef<HTMLElement>(null);

  const handleTabClick = (tabId: TabType, e: React.MouseEvent<HTMLElement>) => {
    if (tabId === 'ALL') {
      if (activeTab === 'ALL') {
        // Nothing should happen when clicking 全部用户 if already selected
        e.preventDefault();
        (e.currentTarget as any).selected = true;
        return;
      }
      setActiveTab('ALL');
    } else if (activeTab === tabId) {
      // Deselecting a specific filter falls back to 全部用户
      setActiveTab('ALL');
    } else {
      // Selecting another filter
      setActiveTab(tabId);
    }
  };

  React.useEffect(() => {
    if (!chipSetRef.current) return;
    const chips = chipSetRef.current.querySelectorAll('md-filter-chip');
    chips.forEach((chip: any) => {
      const tabId = chip.dataset.tabId as TabType;
      const shouldBeSelected = activeTab === tabId;
      if (chip.selected !== shouldBeSelected) {
        chip.selected = shouldBeSelected;
      }
    });
  }, [activeTab, users.length, pendingCount]);

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
        <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4 px-6 mb-6 flex items-center">
          {/* Material Design 3 Filter Chips and Search Bar with Horizontal Scroll */}
          <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden no-scrollbar py-1 flex items-center gap-2">
            <md-chip-set ref={chipSetRef} aria-label="用户角色与状态筛选" className="flex flex-nowrap shrink-0 items-center" style={{ display: 'inline-flex', flexWrap: 'nowrap', alignItems: 'center' }}>
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
                    data-tab-id={tab.id}
                    label={labelWithCount}
                    selected={isSelected}
                    onClick={(e: React.MouseEvent<HTMLElement>) => handleTabClick(tab.id, e)}
                    className="shrink-0"
                    has-icon
                  >
                    <md-icon slot="icon">{tab.icon}</md-icon>
                  </md-filter-chip>
                );
              })}
            </md-chip-set>

            {/* Search Box */}
            <ExpandableSearchBar
              value={searchKeyword}
              onChange={setSearchKeyword}
              placeholder="搜索姓名、工号/学号、院系..."
            />
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
