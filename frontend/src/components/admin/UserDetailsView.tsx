import React from 'react';
import { AdminUserSummaryDto, AccountStatus } from '../../types/admin';
import { roleTranslations } from '../../utils/roleTranslations';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { PrimaryTabs } from '../common/Tabs';
import { useDetails } from '../../contexts/DetailsContext';

export const USER_DETAILS_TABS = [
  { id: 'overview', label: '基本信息', icon: 'account_circle' },
  { id: 'security', label: '状态与权限', icon: 'admin_panel_settings' },
];

interface UserDetailsViewProps {
  user: AdminUserSummaryDto;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const UserDetailsView: React.FC<UserDetailsViewProps> = ({ user, activeTab = 'overview', onTabChange }) => {
  const { updateStatus, deleteUser, isUpdating } = useAdminUsers();
  const { isFullScreen } = useDetails();

  const handleStatusChange = async (newStatus: AccountStatus) => {
    if (newStatus === 'DELETED') {
      await deleteUser(user.id);
    } else {
      await updateStatus({ userId: user.id, request: { status: newStatus } });
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)]"></span>
            已启用 (ACTIVE)
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-tertiary)]"></span>
            待审核 (PENDING)
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-outline)]"></span>
            已禁用 (DISABLED)
          </span>
        );
      case 'DELETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-error)]"></span>
            已注销 (DELETED)
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)]">
      {/* Profile Header */}
      <div className="p-6 border-b border-[var(--md-sys-color-outline-variant)] flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xl font-bold flex items-center justify-center shadow-xs">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)]">{user.name}</h2>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
              {roleTranslations[user.role] || user.role}
            </span>
          </div>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">{user.email}</p>
          <div className="mt-2.5">{getStatusBadge(user.status)}</div>
        </div>
      </div>

      {/* Primary Tabs */}
      {!isFullScreen && onTabChange && (
        <PrimaryTabs
          tabs={USER_DETAILS_TABS}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-[var(--md-sys-color-surface-container)] p-4 rounded-2xl border border-[var(--md-sys-color-outline-variant)] space-y-3">
              <h3 className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                身份归属信息
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[var(--md-sys-color-outline)] block mb-0.5">用户标识 ID</span>
                  <span className="font-mono text-[var(--md-sys-color-on-surface)] font-medium">#{user.id}</span>
                </div>
                <div>
                  <span className="text-[var(--md-sys-color-outline)] block mb-0.5">学号 / 工号</span>
                  <span className="font-mono text-[var(--md-sys-color-on-surface)] font-medium">
                    {user.employeeOrStudentId || '未分配'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--md-sys-color-outline)] block mb-0.5">学院 / 附属医院 / 科室</span>
                  <span className="text-[var(--md-sys-color-on-surface)] font-medium">
                    {user.hospital || user.departmentOrCollege || '系统全局'}
                  </span>
                </div>
              </div>
            </div>

            {user.deletedAt && (
              <div className="bg-[var(--md-sys-color-error-container)]/50 p-4 rounded-2xl border border-[var(--md-sys-color-error)]/30 text-xs text-[var(--md-sys-color-on-error-container)]">
                <span className="font-semibold block mb-1">账号已于以下时间注销软删除：</span>
                <span className="font-mono">{new Date(user.deletedAt).toLocaleString('zh-CN')}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-[var(--md-sys-color-surface-container)] p-4 rounded-2xl border border-[var(--md-sys-color-outline-variant)] space-y-3">
              <h3 className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                账号状态生命周期管理
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                管理员可根据机构审核政策对用户账号进行状态变更。修改立即生效。
              </p>

              <div className="flex flex-col gap-2 pt-2">
                {user.status === 'PENDING_APPROVAL' && (
                  <button
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={isUpdating}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 transition-opacity"
                  >
                    通过注册审核并启用
                  </button>
                )}
                {user.status === 'ACTIVE' && user.role !== 'SYSTEM_ADMIN' && (
                  <button
                    onClick={() => handleStatusChange('DISABLED')}
                    disabled={isUpdating}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
                  >
                    禁用该账号（暂停系统权限）
                  </button>
                )}
                {user.status === 'DISABLED' && (
                  <button
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={isUpdating}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:opacity-90 transition-opacity"
                  >
                    解除禁用并恢复账号
                  </button>
                )}
                {user.status !== 'DELETED' && user.role !== 'SYSTEM_ADMIN' && (
                  <button
                    onClick={() => handleStatusChange('DELETED')}
                    disabled={isUpdating}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:opacity-90 transition-opacity"
                  >
                    注销账号（软删除）
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
