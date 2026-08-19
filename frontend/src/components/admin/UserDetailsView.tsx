import React from 'react';
import { AdminUserSummaryDto, AccountStatus } from '../../types/admin';
import { roleTranslations } from '../../utils/roleTranslations';
import { SecondaryTabs } from '../common/Tabs';
import { useDetails } from '../../contexts/DetailsContext';
import { ScrollableDetailsLayout } from '../common/DetailsPanel';
import { UserGovernanceFooter } from './UserGovernanceFooter';

export const USER_DETAILS_TABS = [
  { id: 'overview', label: '基本信息', icon: 'account_circle' },
  { id: 'security', label: '状态与权限', icon: 'admin_panel_settings' },
];

interface UserDetailsViewProps {
  user: AdminUserSummaryDto;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  footer?: React.ReactNode;
  onStatusUpdated?: (status: AccountStatus) => void;
}

export const UserDetailsView: React.FC<UserDetailsViewProps> = ({
  user,
  activeTab = 'overview',
  onTabChange,
  footer,
  onStatusUpdated
}) => {
  const { isFullScreen } = useDetails();

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
    <ScrollableDetailsLayout
      title={user.name}
      header={
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-xl font-bold flex items-center justify-center shadow-xs shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)] truncate">{user.name}</h2>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] shrink-0">
                {roleTranslations[user.role] || user.role}
              </span>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono truncate">{user.email}</p>
            <div className="mt-2.5">{getStatusBadge(user.status)}</div>
          </div>
        </div>
      }
      tabs={
        !isFullScreen && onTabChange ? (
          <SecondaryTabs
            tabs={USER_DETAILS_TABS}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        ) : undefined
      }
      footer={
        footer !== undefined ? (
          footer
        ) : user.role !== 'SYSTEM_ADMIN' ? (
          <UserGovernanceFooter user={user} onStatusUpdated={onStatusUpdated} />
        ) : null
      }
    >
      <div className="space-y-6">
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
                账号状态与权限治理
              </h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                管理员可根据机构审核政策对用户账号进行状态变更与权限管理。相关治理操作可在底部操作栏直接执行并即时生效。
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[var(--md-sys-color-outline)] block mb-0.5">当前状态</span>
                  <div>{getStatusBadge(user.status)}</div>
                </div>
                <div>
                  <span className="text-[var(--md-sys-color-outline)] block mb-0.5">治理权限</span>
                  <span className="text-[var(--md-sys-color-on-surface)] font-medium">
                    {user.role === 'SYSTEM_ADMIN' ? '系统管理员（受保护）' : '可由管理员调度'}
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
      </div>
    </ScrollableDetailsLayout>
  );
};
