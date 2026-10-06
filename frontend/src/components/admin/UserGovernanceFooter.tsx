import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminUserSummaryDto, AccountStatus } from '../../types/admin';
import { roleTranslations } from '../../utils/roleTranslations';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { ActionFooter } from '../common/ActionFooter';
import { OutlinedButton, TertiaryButton } from '../common/Buttons';
import { GenericDialog } from '../common/GenericDialog';

export interface UserGovernanceFooterProps {
  user: AdminUserSummaryDto;
  onStatusUpdated?: (updatedStatus: AccountStatus) => void;
}

export const UserGovernanceFooter: React.FC<UserGovernanceFooterProps> = ({
  user,
  onStatusUpdated
}) => {
  const { updateStatus, deleteUser, isUpdating } = useAdminUsers();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDetailsOpen, setIsApproveDetailsOpen] = useState(false);
  const [isDisableDetailsOpen, setIsDisableDetailsOpen] = useState(false);
  const [isDeleteDetailsOpen, setIsDeleteDetailsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleStatusChange = async (newStatus: AccountStatus) => {
    try {
      if (newStatus === 'DELETED') {
        await deleteUser(user.id);
      } else {
        await updateStatus({ userId: user.id, request: { status: newStatus } });
      }
      onStatusUpdated?.(newStatus);
    } catch (e) {
      // Error notification handled by useAdminUsers snackbar
    }
  };

  if (user.role === 'SYSTEM_ADMIN') {
    return null;
  }

  const roleName = roleTranslations[user.role] || user.role;
  const affiliation = user.hospital || user.departmentOrCollege || '系统全局';
  const idNumber = user.employeeOrStudentId || '未分配';

  return (
    <>
      <ActionFooter>
        {user.status === 'PENDING_APPROVAL' && (
          <>
            <OutlinedButton
              icon="check_circle"
              label="通过审核并启用"
              onClick={() => setIsApproveDialogOpen(true)}
              disabled={isUpdating}
            />
            <OutlinedButton
              icon="cancel"
              label="拒绝 / 注销"
              onClick={() => setIsDeleteDialogOpen(true)}
            />
          </>
        )}

        {user.status === 'ACTIVE' && (
          <>
            <OutlinedButton
              icon="block"
              label="禁用账号"
              onClick={() => setIsDisableDialogOpen(true)}
              disabled={isUpdating}
            />
            <OutlinedButton
              icon="person_remove"
              label="注销账号"
              onClick={() => setIsDeleteDialogOpen(true)}
            />
          </>
        )}

        {user.status === 'DISABLED' && (
          <>
            <OutlinedButton
              icon="lock_open"
              label="恢复账号并启用"
              onClick={() => handleStatusChange('ACTIVE')}
              disabled={isUpdating}
            />
            <OutlinedButton
              icon="person_remove"
              label="注销账号"
              onClick={() => setIsDeleteDialogOpen(true)}
            />
          </>
        )}

        {user.status === 'DELETED' && (
          <OutlinedButton
            icon="restore"
            label="恢复账号并启用"
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={isUpdating}
          />
        )}
      </ActionFooter>

      {/* Confirmation Dialog: 通过审核并启用 (Approve & Enable Account) */}
      <GenericDialog
        open={isApproveDialogOpen}
        onClose={() => {
          setIsApproveDialogOpen(false);
          setIsApproveDetailsOpen(false);
        }}
        maxWidth="500px"
        title={
          <span className="text-[20px] font-semibold text-[var(--md-sys-color-on-surface)]">
            确认通过用户审核并启用？
          </span>
        }
        actions={
          <>
            <TertiaryButton
              label="取消"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setIsApproveDetailsOpen(false);
              }}
              disabled={isUpdating}
            />
            <TertiaryButton
              label="确认通过"
              onClick={async () => {
                setIsApproveDialogOpen(false);
                setIsApproveDetailsOpen(false);
                await handleStatusChange('ACTIVE');
              }}
              disabled={isUpdating}
            />
          </>
        }
      >
        <div className="space-y-3.5 text-sm text-[var(--md-sys-color-on-surface)]">
          {/* User Info Card */}
          <div className="bg-[var(--md-sys-color-surface-container)] p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px]">{user.name}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                {roleName}
              </span>
            </div>
            <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1">
              <div>工号 / 学号：<span className="font-mono text-[var(--md-sys-color-on-surface)]">{idNumber}</span></div>
              <div>归属单位：<span className="text-[var(--md-sys-color-on-surface)]">{affiliation}</span></div>
            </div>
          </div>

          {/* Collapsible Action Consequences */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsApproveDetailsOpen(!isApproveDetailsOpen)}
              className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                  info
                </span>
                <span>查看操作影响与合规说明</span>
              </span>
              <span
                className={`material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ${
                  isApproveDetailsOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {isApproveDetailsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        verified_user
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        账号激活
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        该用户将获得系统正式使用权限，可立即登录并根据角色权限开展转诊协同与日常工作。
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        badge
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        权限开通
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        系统将根据其分配的角色与归属单位初始化相应的数据可见性与业务办理权限。
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        mark_email_read
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        状态生效
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        审核生效后，用户账号状态将立即流转为「正常启用」，并自动记录审核人与操作时间戳。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GenericDialog>

      {/* Confirmation Dialog: 禁用账号 (Disable Account) */}
      <GenericDialog
        open={isDisableDialogOpen}
        onClose={() => {
          setIsDisableDialogOpen(false);
          setIsDisableDetailsOpen(false);
        }}
        maxWidth="500px"
        title={
          <span className="text-[20px] font-semibold text-[var(--md-sys-color-on-surface)]">
            确认禁用用户账号？
          </span>
        }
        actions={
          <>
            <TertiaryButton
              label="取消"
              onClick={() => {
                setIsDisableDialogOpen(false);
                setIsDisableDetailsOpen(false);
              }}
              disabled={isUpdating}
            />
            <TertiaryButton
              label="确认禁用"
              onClick={async () => {
                setIsDisableDialogOpen(false);
                setIsDisableDetailsOpen(false);
                await handleStatusChange('DISABLED');
              }}
              disabled={isUpdating}
            />
          </>
        }
      >
        <div className="space-y-3.5 text-sm text-[var(--md-sys-color-on-surface)]">
          {/* User Info Card */}
          <div className="bg-[var(--md-sys-color-surface-container)] p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px]">{user.name}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                {roleName}
              </span>
            </div>
            <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1">
              <div>工号 / 学号：<span className="font-mono text-[var(--md-sys-color-on-surface)]">{idNumber}</span></div>
              <div>归属单位：<span className="text-[var(--md-sys-color-on-surface)]">{affiliation}</span></div>
            </div>
          </div>

          {/* Collapsible Action Consequences */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsDisableDetailsOpen(!isDisableDetailsOpen)}
              className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                  info
                </span>
                <span>查看操作影响与合规说明</span>
              </span>
              <span
                className={`material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ${
                  isDisableDetailsOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {isDisableDetailsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        do_not_disturb_on
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        权限暂停
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        该用户将立即无法登录系统，无法处理任何新的转诊、门诊及量表评定任务。
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        verified_user
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        数据保留
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        该用户的历史就诊反馈、学生健康档案与历史转诊数据将继续完整保留。
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        replay
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        随时恢复
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        管理员可随时在管理面板中点击「恢复账号并启用」重新激活。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GenericDialog>

      {/* Confirmation Dialog: 注销账号 / 拒绝申请 (Soft Delete / Deregister Account) */}
      <GenericDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setIsDeleteDetailsOpen(false);
        }}
        maxWidth="500px"
        title={
          <span className="text-[20px] font-semibold text-[var(--md-sys-color-on-surface)]">
            {user.status === 'PENDING_APPROVAL' ? '确认拒绝并注销申请？' : '确认注销用户账号？'}
          </span>
        }
        actions={
          <>
            <TertiaryButton
              label="取消"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setIsDeleteDetailsOpen(false);
                setRejectionReason('');
              }}
              disabled={isUpdating}
            />
            <TertiaryButton
              label={user.status === 'PENDING_APPROVAL' ? "确认拒绝" : "确认注销"}
              style={{
                color: 'var(--md-sys-color-error)',
                '--md-text-button-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-hover-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-hover-state-layer-color': 'var(--md-sys-color-error)',
                '--md-text-button-pressed-label-text-color': 'var(--md-sys-color-error)',
                '--md-text-button-pressed-state-layer-color': 'var(--md-sys-color-error)',
                '--md-text-button-focus-label-text-color': 'var(--md-sys-color-error)',
              } as React.CSSProperties}
              onClick={async () => {
                setIsDeleteDialogOpen(false);
                setIsDeleteDetailsOpen(false);
                
                try {
                  if (user.status === 'PENDING_APPROVAL') {
                    await updateStatus({
                      userId: user.id,
                      request: {
                        status: 'DELETED',
                        reason: rejectionReason || undefined
                      }
                    });
                    onStatusUpdated?.('DELETED');
                  } else {
                    await handleStatusChange('DELETED');
                  }
                } finally {
                  setRejectionReason('');
                }
              }}
              disabled={isUpdating || (user.status === 'PENDING_APPROVAL' && !rejectionReason.trim())}
            />
          </>
        }
      >
        <div className="space-y-3.5 text-sm text-[var(--md-sys-color-on-surface)]">
          {/* User Info Card */}
          <div className="bg-[var(--md-sys-color-surface-container)] p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px]">{user.name}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
                {roleName}
              </span>
            </div>
            <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1">
              <div>工号 / 学号：<span className="font-mono text-[var(--md-sys-color-on-surface)]">{idNumber}</span></div>
              <div>归属单位：<span className="text-[var(--md-sys-color-on-surface)]">{affiliation}</span></div>
            </div>
          </div>
          
          {user.status === 'PENDING_APPROVAL' && (
            <div className="mt-4 mb-2">
              <md-outlined-text-field
                label="拒绝原因 (必填)"
                value={rejectionReason}
                maxLength={255}
                className="w-full"
                onInput={(e: React.SyntheticEvent) => {
                  setRejectionReason((e.target as HTMLInputElement).value);
                }}
              />
            </div>
          )}

          {/* Collapsible Action Consequences */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsDeleteDetailsOpen(!isDeleteDetailsOpen)}
              className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium text-[var(--md-sys-color-on-surface)] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                  info
                </span>
                <span>查看操作影响与合规说明</span>
              </span>
              <span
                className={`material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ${
                  isDeleteDetailsOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {isDeleteDetailsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        no_accounts
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        账号终止
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        该账号状态将被标记为「已注销」，用户将永久失去登录权限。
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        policy
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        医疗合规保护
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        系统<strong>不会物理删除</strong>数据库记录，历史门诊病历、转诊记录与处方建议等医疗审计链路均完整保留。
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--md-sys-color-surface-container)] p-3 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-on-surface-variant)]">
                        history_toggle_off
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] leading-4">
                        操作审计
                      </div>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-1">
                        系统将自动记录本次注销时间戳供日后合规备查。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GenericDialog>
    </>
  );
};
