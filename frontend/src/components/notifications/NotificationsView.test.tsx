import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationsView } from './NotificationsView';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { role: 'head-councillor', token: 'mock_hc_token' },
  }),
}));

const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();
const mockExpandToFullscreen = vi.fn();

vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation,
    expandToFullscreen: mockExpandToFullscreen,
  }),
}));

const mockNotifications = [
  {
    id: 1,
    userId: 100,
    messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_HC',
    actionType: 'VIEW_STUDENT',
    actionTargetId: 42,
    payload: {
      studentId: 42,
      studentNumber: '20240001',
      studentName: '陈明',
      crisisFlags: '自杀意念',
      riskFlags: ['SUICIDAL_IDEATION'],
      riskStatus: 'HIGH',
    },
    isRead: false,
    createdAt: '2026-10-25T09:00:00Z',
    isActionAvailable: true,
    canCreateReferral: true,
  },
  {
    id: 2,
    userId: 101,
    messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER',
    actionType: 'VIEW_STUDENT',
    actionTargetId: 43,
    payload: {
      studentId: 43,
      studentNumber: '20240002',
      studentName: '李华',
      crisisFlags: '自残行为',
      riskFlags: ['SELF_HARM'],
      riskStatus: 'HIGH',
    },
    isRead: false,
    createdAt: '2026-10-25T09:05:00Z',
    isActionAvailable: true,
    canCreateReferral: false, // Already has an open referral
  },
  {
    id: 3,
    userId: 102,
    messageCode: 'ASSESSMENT_ASSIGNED_STUDENT',
    actionType: 'VIEW_RECORDS',
    actionTargetId: 10,
    payload: {},
    isRead: false,
    createdAt: '2026-10-25T09:10:00Z',
    isActionAvailable: true,
  },
  {
    id: 4,
    userId: 103,
    messageCode: 'ASSESSMENT_COMPLETED_TEACHER',
    actionType: 'VIEW_RECORDS',
    actionTargetId: 42,
    payload: {
      studentId: 42,
      studentName: '陈明',
    },
    isRead: false,
    createdAt: '2026-10-25T09:20:00Z',
    isActionAvailable: true,
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

  afterEach(() => {
    cleanup();
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

    expect(screen.getAllByText('高危心理测评预警').length).toBe(2);
    expect(screen.getAllByText((_, el) => el?.textContent?.includes('学生 陈明 的心理测评结果触发高危预警（自杀意念）') ?? false).length).toBeGreaterThan(0);
    expect(screen.getAllByText((_, el) => el?.textContent?.includes('学生 李华 的心理测评结果触发高危预警（自残行为）') ?? false).length).toBeGreaterThan(0);

    expect(screen.getByText('新测评任务提醒')).toBeDefined();
    expect(screen.getByText(/您收到了一项新的心理健康测评任务/)).toBeDefined();

    expect(screen.getByText('学生已完成测评')).toBeDefined();
    expect(screen.getByText(/已完成心理健康测评/)).toBeDefined();

    const viewStudentBtns = screen.getAllByText('查看学生');
    fireEvent.click(viewStudentBtns[0]);
    expect(onViewStudentMock).toHaveBeenCalledWith('42');
  });

  it('renders 发起转诊 when canCreateReferral is true and triggers pre-filled referral creation overlay', () => {
    render(<NotificationsView />);

    const createReferralBtns = screen.getAllByText('发起转诊');
    // Only notification id 1 has canCreateReferral = true; notification id 2 has canCreateReferral = false
    expect(createReferralBtns.length).toBe(1);

    fireEvent.click(createReferralBtns[0]);
    expect(mockOpenCreation).toHaveBeenCalled();
    const [title, formElement] = mockOpenCreation.mock.calls[0];
    expect(title).toBe('发起转诊 - 陈明');
    expect(formElement.props.initialData).toEqual({
      studentId: '42',
      title: '高风险筛查转诊 - 陈明 (20240001)',
      riskLevel: 'HIGH',
      severeRiskFactors: ['SUICIDAL_IDEATION'],
    });
  });

  it('does NOT render 发起转诊 when canCreateReferral is false', () => {
    render(<NotificationsView />);

    // Check that李华 notification only has 查看学生 and not 发起转诊
    const createReferralBtns = screen.queryAllByText('发起转诊');
    expect(createReferralBtns.length).toBe(1); // Only for 陈明
  });
});
