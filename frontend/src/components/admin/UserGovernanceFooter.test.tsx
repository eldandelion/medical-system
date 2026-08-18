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

  it('renders disabled/delete actions when user status is ACTIVE', async () => {
    const onStatusUpdated = vi.fn();
    render(<UserGovernanceFooter user={baseUser} onStatusUpdated={onStatusUpdated} />);

    const disableBtn = screen.getByText('禁用账号');
    const deleteBtn = screen.getByText('注销账号');
    expect(disableBtn).toBeDefined();
    expect(deleteBtn).toBeDefined();

    fireEvent.click(disableBtn);
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      userId: 101,
      request: { status: 'DISABLED' },
    });

    fireEvent.click(deleteBtn);
    expect(mockDeleteUser).toHaveBeenCalledWith(101);
  });

  it('renders approve/reject actions when user status is PENDING_APPROVAL', async () => {
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

    fireEvent.click(rejectBtn);
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
