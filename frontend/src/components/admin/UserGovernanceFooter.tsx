import React from 'react';
import { AdminUserSummaryDto, AccountStatus } from '../../types/admin';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { ActionFooter } from '../common/ActionFooter';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { DestructiveButton } from '../common/DestructiveButton';

export interface UserGovernanceFooterProps {
  user: AdminUserSummaryDto;
  onStatusUpdated?: (updatedStatus: AccountStatus) => void;
}

export const UserGovernanceFooter: React.FC<UserGovernanceFooterProps> = ({
  user,
  onStatusUpdated
}) => {
  const { updateStatus, deleteUser, isUpdating } = useAdminUsers();

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

  return (
    <ActionFooter>
      {user.status === 'PENDING_APPROVAL' && (
        <>
          <PrimaryButton
            icon="check_circle"
            label="通过审核并启用"
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={isUpdating}
          />
          <DestructiveButton
            icon="cancel"
            label="拒绝 / 注销"
            onClick={() => handleStatusChange('DELETED')}
          />
        </>
      )}

      {user.status === 'ACTIVE' && (
        <>
          <SecondaryButton
            icon="block"
            label="禁用账号"
            onClick={() => handleStatusChange('DISABLED')}
            disabled={isUpdating}
          />
          <DestructiveButton
            icon="person_remove"
            label="注销账号"
            onClick={() => handleStatusChange('DELETED')}
          />
        </>
      )}

      {user.status === 'DISABLED' && (
        <>
          <PrimaryButton
            icon="lock_open"
            label="恢复账号并启用"
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={isUpdating}
          />
          <DestructiveButton
            icon="person_remove"
            label="注销账号"
            onClick={() => handleStatusChange('DELETED')}
          />
        </>
      )}

      {user.status === 'DELETED' && (
        <PrimaryButton
          icon="restore"
          label="恢复账号并启用"
          onClick={() => handleStatusChange('ACTIVE')}
          disabled={isUpdating}
        />
      )}
    </ActionFooter>
  );
};
