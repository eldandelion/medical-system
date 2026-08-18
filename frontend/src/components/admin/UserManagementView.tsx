import React, { useState, useMemo } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { AdminUserSummaryDto, AccountStatus, UserRoleType } from '../../types/admin';
import { roleTranslations } from '../../utils/roleTranslations';

interface UserManagementViewProps {
  onSelectUser?: (user: AdminUserSummaryDto) => void;
  selectedUserId?: number | null;
}

type TabType = 'ALL' | 'PENDING' | 'TEACHER' | 'HEAD_COUNSELLOR' | 'TRIAL_ADMIN' | 'DOCTOR' | 'STUDENT';

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  onSelectUser,
  selectedUserId
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [actionConfirmTarget, setActionConfirmTarget] = useState<{
    user: AdminUserSummaryDto;
    action: 'APPROVE' | 'DISABLE' | 'ENABLE' | 'DELETE';
  } | null>(null);

  const { users, isLoading, isError, refetch, updateStatus, deleteUser, isUpdating } = useAdminUsers();

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

  const handleConfirmAction = async () => {
    if (!actionConfirmTarget) return;
    const { user, action } = actionConfirmTarget;

    try {
      if (action === 'APPROVE' || action === 'ENABLE') {
        await updateStatus({ userId: user.id, request: { status: 'ACTIVE' } });
      } else if (action === 'DISABLE') {
        await updateStatus({ userId: user.id, request: { status: 'DISABLED' } });
      } else if (action === 'DELETE') {
        await deleteUser(user.id);
      }
    } finally {
      setActionConfirmTarget(null);
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)]"></span>
            已启用
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-tertiary)]"></span>
            待审核
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-outline)]"></span>
            已禁用
          </span>
        );
      case 'DELETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-error)]"></span>
            已注销
          </span>
        );
    }
  };

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
    <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
      {/* Top Filter Chips and Search Bar (Positioned directly under title) */}
      <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4 px-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
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
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
            search
          </span>
          <input
            type="text"
            placeholder="搜索姓名、工号/学号、院系..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full h-9 pl-9 pr-8 rounded-full text-xs bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-outline)] border border-transparent focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface)] focus:outline-none transition-all"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] p-0.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] block">close</span>
            </button>
          )}
        </div>
      </div>

      {/* User Table Content */}
      <div className="flex-1 min-h-0 flex flex-col px-6 pb-6 mt-2 relative overflow-y-auto">
        <div className="bg-[var(--md-sys-color-surface)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
            正在加载用户列表...
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[var(--md-sys-color-error)] mb-3">加载用户列表失败</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 text-xs font-medium rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            >
              重试
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
            未找到符合条件的用户
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)]">
                  <th className="py-3.5 px-4 font-semibold">用户</th>
                  <th className="py-3.5 px-4 font-semibold">角色</th>
                  <th className="py-3.5 px-4 font-semibold">工号/学号</th>
                  <th className="py-3.5 px-4 font-semibold">所属院系/医院</th>
                  <th className="py-3.5 px-4 font-semibold">账号状态</th>
                  <th className="py-3.5 px-4 font-semibold text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  return (
                    <tr
                      key={user.id}
                      onClick={() => onSelectUser?.(user)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--md-sys-color-primary-container)]/30'
                          : 'hover:bg-[var(--md-sys-color-surface-container-highest)]/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold flex items-center justify-center text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--md-sys-color-on-surface)]">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-lg text-[11px] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                          {roleTranslations[user.role] || user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--md-sys-color-on-surface-variant)] font-mono">
                        {user.employeeOrStudentId || '-'}
                      </td>
                      <td className="py-3 px-4 text-[var(--md-sys-color-on-surface-variant)]">
                        {user.hospital || user.departmentOrCollege || '-'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="inline-flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {user.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() =>
                                setActionConfirmTarget({ user, action: 'APPROVE' })
                              }
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition-opacity"
                            >
                              通过
                            </button>
                          )}
                          {user.status === 'ACTIVE' && user.role !== 'SYSTEM_ADMIN' && (
                            <button
                              onClick={() =>
                                setActionConfirmTarget({ user, action: 'DISABLE' })
                              }
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
                            >
                              禁用
                            </button>
                          )}
                          {user.status === 'DISABLED' && (
                            <button
                              onClick={() =>
                                setActionConfirmTarget({ user, action: 'ENABLE' })
                              }
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:opacity-90 transition-opacity"
                            >
                              启用
                            </button>
                          )}
                          {user.status !== 'DELETED' && user.role !== 'SYSTEM_ADMIN' && (
                            <button
                              onClick={() =>
                                setActionConfirmTarget({ user, action: 'DELETE' })
                              }
                              disabled={isUpdating}
                              className="p-1 rounded-lg text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] transition-colors"
                              title="注销/删除账号"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-[var(--md-sys-color-surface-container-high)] p-6 rounded-3xl max-w-sm w-full mx-4 shadow-xl border border-[var(--md-sys-color-outline-variant)]">
            <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] mb-2">
              {actionConfirmTarget.action === 'APPROVE' && '确认审核通过'}
              {actionConfirmTarget.action === 'DISABLE' && '确认禁用账号'}
              {actionConfirmTarget.action === 'ENABLE' && '确认重新启用账号'}
              {actionConfirmTarget.action === 'DELETE' && '确认注销账号'}
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-6 leading-relaxed">
              {actionConfirmTarget.action === 'APPROVE' &&
                `确定批准用户 ${actionConfirmTarget.user.name}（${actionConfirmTarget.user.email}）的注册申请？账号通过后将立即具备登录权限。`}
              {actionConfirmTarget.action === 'DISABLE' &&
                `确定禁用用户 ${actionConfirmTarget.user.name} 的账号？禁用后该用户将无法登录系统，但既往历史数据完整保留。`}
              {actionConfirmTarget.action === 'ENABLE' &&
                `确定重新启用用户 ${actionConfirmTarget.user.name} 的账号？启用后将恢复其登录和操作权限。`}
              {actionConfirmTarget.action === 'DELETE' &&
                `确定注销用户 ${actionConfirmTarget.user.name} 的账号？注销为软删除操作，历史医疗与转诊档案将永久保留供审计使用。`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActionConfirmTarget(null)}
                disabled={isUpdating}
                className="px-4 py-2 text-xs font-medium rounded-xl text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isUpdating}
                className={`px-4 py-2 text-xs font-medium rounded-xl text-white transition-opacity ${
                  actionConfirmTarget.action === 'DELETE'
                    ? 'bg-[var(--md-sys-color-error)]'
                    : 'bg-[var(--md-sys-color-primary)]'
                }`}
              >
                {isUpdating ? '正在处理...' : '确认执行'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
