import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserGovernanceFooter } from './UserGovernanceFooter';
import { AdminUserSummaryDto } from '../../types/admin';

const mockUpdateStatus = vi.fn();
const mockDeleteUser = vi.fn();

let mockIsUpdating = false;

vi.mock('../../hooks/useAdminUsers', () => ({
  useAdminUsers: () => ({
    updateStatus: mockUpdateStatus,
    deleteUser: mockDeleteUser,
    isUpdating: mockIsUpdating,
  }),
}));

describe('UserGovernanceFooter', () => {
  const baseUser: AdminUserSummaryDto = {
    id: 101,
    name: '张三 (测试学生)',
    email: 'zhangsan@university.edu.cn',
    role: 'STUDENT',
    status: 'ACTIVE',
    employeeOrStudentId: 'STU1001',
    departmentOrCollege: '计算机科学学院',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsUpdating = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders disabled/delete actions when user status is ACTIVE and handles confirmation dialogs with collapsible details', async () => {
    const onStatusUpdated = vi.fn();
    render(<UserGovernanceFooter user={baseUser} onStatusUpdated={onStatusUpdated} />);

    const disableBtn = screen.getByText('禁用账号');
    const deleteBtn = screen.getByText('注销账号');
    expect(disableBtn).toBeDefined();
    expect(deleteBtn).toBeDefined();

    // 1. Test Disable Confirmation Dialog & Expandable Details
    fireEvent.click(disableBtn);
    expect(screen.getByText('确认禁用用户账号？')).toBeDefined();
    expect(screen.getAllByText('查看操作影响与合规说明')[0]).toBeDefined();

    // Expand details
    fireEvent.click(screen.getAllByText('查看操作影响与合规说明')[0]);
    expect(screen.getByText(/权限暂停/)).toBeDefined();
    expect(mockUpdateStatus).not.toHaveBeenCalled();

    const cancelDisableBtn = screen.getAllByText('取消')[0];
    fireEvent.click(cancelDisableBtn);
    expect(mockUpdateStatus).not.toHaveBeenCalled();

    // 2. Test Disable Confirmation Execution
    fireEvent.click(disableBtn);
    const confirmDisableBtn = screen.getByText('确认禁用');
    fireEvent.click(confirmDisableBtn);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      userId: 101,
      request: { status: 'DISABLED' },
    });

    // 3. Test Delete Confirmation Dialog & Execution
    fireEvent.click(deleteBtn);
    expect(screen.getByText('确认注销用户账号？')).toBeDefined();

    // Expand details
    const deleteExpander = screen.getAllByText('查看操作影响与合规说明').at(-1)!;
    fireEvent.click(deleteExpander);
    expect(screen.getByText(/医疗合规保护/)).toBeDefined();
    expect(mockDeleteUser).not.toHaveBeenCalled();

    const confirmDeleteBtn = screen.getByText('确认注销');
    fireEvent.click(confirmDeleteBtn);
    expect(mockDeleteUser).toHaveBeenCalledWith(101);
  });

  it('renders approve/reject actions when user status is PENDING_APPROVAL and handles reject confirmation', async () => {
    const pendingUser: AdminUserSummaryDto = {
      ...baseUser,
      status: 'PENDING_APPROVAL',
    };
    render(<UserGovernanceFooter user={pendingUser} />);

    const approveBtn = screen.getByText('通过审核并启用');
    const rejectBtn = screen.getByText('拒绝 / 注销');
    expect(approveBtn).toBeDefined();
    expect(rejectBtn).toBeDefined();

    fireEvent.click(approveBtn);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      userId: 101,
      request: { status: 'ACTIVE' },
    });

    // Reject opens confirmation dialog
    fireEvent.click(rejectBtn);
    expect(screen.getByText('确认拒绝并注销申请？')).toBeDefined();
    const confirmRejectBtn = screen.getByText('确认拒绝');
    fireEvent.click(confirmRejectBtn);
    expect(mockDeleteUser).toHaveBeenCalledWith(101);
  });

  it('renders enable/delete actions when user status is DISABLED', async () => {
    const disabledUser: AdminUserSummaryDto = {
      ...baseUser,
      status: 'DISABLED',
    };
    render(<UserGovernanceFooter user={disabledUser} />);

    const enableBtn = screen.getByText('恢复账号并启用');
    const deleteBtn = screen.getByText('注销账号');
    expect(enableBtn).toBeDefined();
    expect(deleteBtn).toBeDefined();

    fireEvent.click(enableBtn);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      userId: 101,
      request: { status: 'ACTIVE' },
    });

    fireEvent.click(deleteBtn);
    expect(screen.getByText('确认注销用户账号？')).toBeDefined();
    const confirmDeleteBtn = screen.getByText('确认注销');
    fireEvent.click(confirmDeleteBtn);
    expect(mockDeleteUser).toHaveBeenCalledWith(101);
  });

  it('renders restore action when user status is DELETED', async () => {
    const deletedUser: AdminUserSummaryDto = {
      ...baseUser,
      status: 'DELETED',
    };
    render(<UserGovernanceFooter user={deletedUser} />);

    const restoreBtn = screen.getByText('恢复账号并启用');
    expect(restoreBtn).toBeDefined();

    fireEvent.click(restoreBtn);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      userId: 101,
      request: { status: 'ACTIVE' },
    });
  });

  it('renders nothing if user role is SYSTEM_ADMIN', () => {
    const adminUser: AdminUserSummaryDto = {
      ...baseUser,
      role: 'SYSTEM_ADMIN',
    };
    const { container } = render(<UserGovernanceFooter user={adminUser} />);
    expect(container.firstChild).toBeNull();
  });
});
