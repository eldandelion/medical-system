import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AssessmentHistoryTab from './AssessmentHistoryTab';
import * as assignmentHooks from '../../hooks/useAssessmentAssignments';
import * as authContext from '../../contexts/AuthContext';
import * as snackbarContext from '../../contexts/SnackbarContext';

vi.mock('../../hooks/useAssessmentAssignments');
vi.mock('../../contexts/AuthContext');
vi.mock('../../contexts/SnackbarContext');

describe('AssessmentHistoryTab', () => {
  const mockShowSnackbar = vi.fn();
  const mockRevokeMutateAsync = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    } as any);
    vi.spyOn(snackbarContext, 'useSnackbar').mockReturnValue({
      showSnackbar: mockShowSnackbar
    } as any);
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      session: { token: 'mock-token', role: 'teacher' }
    } as any);
    vi.spyOn(assignmentHooks, 'useRevokeAssignment').mockReturnValue({
      mutateAsync: mockRevokeMutateAsync,
      isPending: false
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders loading and error states properly', () => {
    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    } as any);

    const { rerender } = render(<AssessmentHistoryTab studentId="1" />);
    expect(screen.getByText('正在加载历史记录...')).toBeDefined();

    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true
    } as any);

    rerender(<AssessmentHistoryTab studentId="1" />);
    expect(screen.getByText('加载历史记录失败')).toBeDefined();
  });

  it('renders empty state with rounded container when history is empty', () => {
    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: { content: [], totalPages: 0 },
      isLoading: false,
      isError: false
    } as any);

    render(<AssessmentHistoryTab studentId="1" />);
    const emptyNotice = screen.getByText('暂无档案记录。');
    expect(emptyNotice).toBeDefined();
    expect(emptyNotice.className).toContain('rounded-[20px]');
  });

  it('renders items in a role="list" container and applies adaptive corner radii', () => {
    const mockItems = [
      {
        id: 1,
        batteryCode: 'PHQ-9',
        assignedByName: '李老师',
        assignedById: 10,
        status: 'PENDING',
        assignedAt: '2023-10-01T08:00:00Z'
      },
      {
        id: 2,
        batteryCode: 'GAD-7',
        assignedByName: '王老师',
        assignedById: 11,
        status: 'COMPLETED',
        assignedAt: '2023-10-02T08:00:00Z'
      },
      {
        id: 3,
        batteryCode: 'SCL-90',
        assignedByName: '张老师',
        assignedById: 12,
        status: 'REVOKED',
        assignedAt: '2023-10-03T08:00:00Z'
      }
    ];

    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: { content: mockItems, totalPages: 1 },
      isLoading: false,
      isError: false
    } as any);

    render(<AssessmentHistoryTab studentId="1" />);

    const list = screen.getByRole('list');
    expect(list).toBeDefined();
    expect(list.className).toContain('flex flex-col gap-[2px]');

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(3);

    // Multi-item corner radius assertions:
    expect(items[0].className).toContain('rounded-t-[20px] rounded-b-[4px]');
    expect(items[1].className).toContain('rounded-[4px]');
    expect(items[2].className).toContain('rounded-t-[4px] rounded-b-[20px]');
  });

  it('renders single item with fully rounded [20px] corners', () => {
    const singleItem = [
      {
        id: 1,
        batteryCode: 'PHQ-9',
        assignedByName: '李老师',
        assignedById: 10,
        status: 'PENDING',
        assignedAt: '2023-10-01T08:00:00Z'
      }
    ];

    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: { content: singleItem, totalPages: 1 },
      isLoading: false,
      isError: false
    } as any);

    render(<AssessmentHistoryTab studentId="1" />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(1);
    expect(items[0].className).toContain('rounded-[20px]');
  });

  it('renders leading assignment icon, title, subtitle, and status badges', () => {
    const mockItems = [
      {
        id: 1,
        batteryCode: 'PHQ-9',
        assignedByName: '李老师',
        assignedById: 10,
        status: 'PENDING',
        assignedAt: '2023-10-01T08:00:00Z'
      }
    ];

    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: { content: mockItems, totalPages: 1 },
      isLoading: false,
      isError: false
    } as any);

    render(<AssessmentHistoryTab studentId="1" />);

    // Leading icon
    expect(screen.getByText('assignment')).toBeDefined();

    // Title & subtitle
    expect(screen.getByText(/PHQ-9/)).toBeDefined();
    expect(screen.getByText(/李老师/)).toBeDefined();

    // Status badge (PENDING uses bg-orange-500)
    expect(screen.getByText('待测评')).toBeDefined();
    const badgeContainer = screen.getByText('待测评').parentElement;
    const dot = badgeContainer?.querySelector('span[aria-hidden="true"]');
    expect(dot?.className).toContain('bg-orange-500');
  });

  it('shows undo icon button for PENDING status for teachers and handles revoke click', async () => {
    const mockItems = [
      {
        id: 101,
        batteryCode: 'PHQ-9',
        assignedByName: '李老师',
        assignedById: 10,
        status: 'PENDING',
        assignedAt: '2023-10-01T08:00:00Z'
      }
    ];

    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: { content: mockItems, totalPages: 1 },
      isLoading: false,
      isError: false
    } as any);

    render(<AssessmentHistoryTab studentId="1" />);

    const revokeBtn = screen.getByLabelText('撤销');
    expect(revokeBtn).toBeDefined();
    expect(screen.getByText('undo')).toBeDefined();

    fireEvent.click(revokeBtn);
    expect(mockRevokeMutateAsync).toHaveBeenCalledWith(101);
  });

  it('does not show revoke button when status is COMPLETED or role is student', () => {
    const completedItem = [
      {
        id: 102,
        batteryCode: 'PHQ-9',
        assignedByName: '李老师',
        assignedById: 10,
        status: 'COMPLETED',
        assignedAt: '2023-10-01T08:00:00Z'
      }
    ];

    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: { content: completedItem, totalPages: 1 },
      isLoading: false,
      isError: false
    } as any);

    const { rerender } = render(<AssessmentHistoryTab studentId="1" />);
    expect(screen.queryByLabelText('撤销')).toBeNull();

    // For student role with PENDING status
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      session: { token: 'mock-token', role: 'student' }
    } as any);

    const pendingItem = [
      {
        id: 103,
        batteryCode: 'PHQ-9',
        assignedByName: '李老师',
        assignedById: 10,
        status: 'PENDING',
        assignedAt: '2023-10-01T08:00:00Z'
      }
    ];

    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: { content: pendingItem, totalPages: 1 },
      isLoading: false,
      isError: false
    } as any);

    rerender(<AssessmentHistoryTab studentId="1" />);
    expect(screen.queryByLabelText('撤销')).toBeNull();
  });

  it('renders pagination controls when totalPages > 1 and navigates pages', () => {
    vi.spyOn(assignmentHooks, 'useAssessmentHistory').mockReturnValue({
      data: {
        content: [
          {
            id: 1,
            batteryCode: 'PHQ-9',
            assignedByName: '李老师',
            assignedById: 10,
            status: 'COMPLETED',
            assignedAt: '2023-10-01T08:00:00Z'
          }
        ],
        totalPages: 3
      },
      isLoading: false,
      isError: false
    } as any);

    render(<AssessmentHistoryTab studentId="1" />);

    expect(screen.getAllByText('下一页').length).toBeGreaterThan(0);
    expect(screen.getAllByText('上一页').length).toBeGreaterThan(0);
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });
});
