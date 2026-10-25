import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsView } from './NotificationsView';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'head-councillor', token: 'mock_hc_token' },
  }),
}));

const mockNotifications = [
  {
    id: 1,
    recipientId: 100,
    messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_HC',
    actionType: 'VIEW_STUDENT',
    actionTargetId: 42,
    payload: {
      studentId: 42,
      studentName: '陈明',
      crisisFlags: 'PHQ-9 重度抑郁',
    },
    isRead: false,
    createdAt: '2026-10-25T09:00:00Z',
  },
  {
    id: 2,
    recipientId: 101,
    messageCode: 'ASSESSMENT_ASSIGNED_STUDENT',
    actionType: 'VIEW_RECORDS',
    actionTargetId: 10,
    payload: {},
    isRead: false,
    createdAt: '2026-10-25T09:10:00Z',
  },
  {
    id: 3,
    recipientId: 102,
    messageCode: 'ASSESSMENT_COMPLETED_TEACHER',
    actionType: 'VIEW_RECORDS',
    actionTargetId: 42,
    payload: {
      studentId: 42,
      studentName: '陈明',
    },
    isRead: false,
    createdAt: '2026-10-25T09:20:00Z',
  },
];

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: mockNotifications,
    markAsRead: vi.fn(),
    isLoading: false,
  }),
}));

describe('NotificationsView Assessment Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Chinese titles and descriptions for assessment notifications and handles VIEW_STUDENT action', () => {
    const onViewStudentMock = vi.fn();
    const onViewRecordsMock = vi.fn();

    render(
      <NotificationsView
        onViewStudent={onViewStudentMock}
        onViewRecords={onViewRecordsMock}
      />
    );

    expect(screen.getByText('高危心理测评预警')).toBeDefined();
    expect(screen.getByText(/的心理测评结果触发高危预警（PHQ-9 重度抑郁）/)).toBeDefined();

    expect(screen.getByText('新测评任务提醒')).toBeDefined();
    expect(screen.getByText(/您收到了一项新的心理健康测评任务/)).toBeDefined();

    expect(screen.getByText('学生已完成测评')).toBeDefined();
    expect(screen.getByText(/已完成心理健康测评/)).toBeDefined();

    const viewStudentBtn = screen.getByText('查看学生');
    fireEvent.click(viewStudentBtn);
    expect(onViewStudentMock).toHaveBeenCalledWith('42');
  });
});
