import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ReferralDetailsFullScreen } from './ReferralDetailsFullScreen';
import { intakeApi, ReferralDetailsDto, ReferralTrackingDto } from '../../api/intakeApi';

describe('ReferralDetailsFullScreen', () => {
  const mockDetails: ReferralDetailsDto = {
    baseInfo: {
      id: 'ref-1',
      studentId: 1,
      studentName: '张同学',
      studentNumber: '20230001',
      type: 'INITIAL',
      date: '2026-10-31T09:00:00',
      title: '急性焦虑综合征',
      description: '考试前严重心悸',
      riskLevel: 'HIGH',
      status: 'WAITING_FOR_APPOINTMENT',
      referredBy: { name: '赵辅导员' },
      availableActions: [],
    },
    studentDemographics: {
      studentId: '20230001',
      school: '计算机学院',
      grade: '大二',
      phone: '13800138000',
    },
    triageInfo: {
      isFirstVisit: true,
      isMedicated: false,
      priorTherapy: '认知行为疗法',
      fullDescription: '连续四周出现强迫思维与失眠',
    },
    riskAssessment: {
      ideation: true,
      attempt: false,
      selfHarm: false,
    },
    feedback: {
      summary: '焦虑症伴轻度抑郁状态，建议定期随访',
      followUp: '两周后复诊，每日监测情绪日记',
      attachments: [{ name: '门诊处方单.pdf', size: '256 KB' }],
    },
    attachments: [{ name: '初审评估表.pdf', size: '120 KB' }],
  };

  const mockTracking: ReferralTrackingDto = {
    destination: {
      hospital: '湘雅附二医院',
      department: '临床心理科',
      doctor: '陈主任',
      admin: '李管理员',
      transferDate: '2026-10-31',
      appointmentTime: '2026-11-05 09:30',
    },
    steps: [
      { id: '1', type: 'INITIATION', time: '2026-10-31 09:00', status: 'COMPLETED' },
      { id: '2', type: 'REVIEW', time: '2026-10-31 10:00', status: 'COMPLETED' },
      { id: '3', type: 'TRIAGE', time: '2026-10-31 11:00', status: 'COMPLETED' },
      { id: '4', type: 'SCHEDULING', time: '2026-10-31 14:00', status: 'COMPLETED' },
      { id: '5', type: 'EVALUATION', time: '2026-11-05 09:30', status: 'ACTIVE' },
      { id: '6', type: 'FEEDBACK', time: '', status: 'PENDING' },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders top bar with back button, referral title, clickable status badge, and risk pill', async () => {
    vi.spyOn(intakeApi, 'getReferralDetails').mockResolvedValueOnce(mockDetails);
    vi.spyOn(intakeApi, 'getReferralTracking').mockResolvedValueOnce(mockTracking);

    const onClose = vi.fn();
    render(<ReferralDetailsFullScreen referralId="ref-1" onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('急性焦虑综合征')).toBeDefined();
    });

    expect(screen.getByText('待就诊')).toBeDefined();
    expect(screen.getByText('高风险')).toBeDefined();

    const backBtn = screen.getByRole('button', { name: /返回/i });
    fireEvent.click(backBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switching secondary tabs renders Overview, Tracker, and Feedback content', async () => {
    vi.spyOn(intakeApi, 'getReferralDetails').mockResolvedValueOnce(mockDetails);
    vi.spyOn(intakeApi, 'getReferralTracking').mockResolvedValueOnce(mockTracking);

    render(<ReferralDetailsFullScreen referralId="ref-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('急性焦虑综合征')).toBeDefined();
    });

    // Default tab is Overview
    expect(screen.getByText('分诊基本信息')).toBeDefined();
    expect(screen.getByText('是否初诊')).toBeDefined();
    expect(screen.getByText('认知行为疗法')).toBeDefined();

    // Switch to Tracker tab
    const trackerTab = screen.getByRole('tab', { name: /转诊进度/i });
    fireEvent.click(trackerTab);
    expect(screen.getByText('转诊全流程进展')).toBeDefined();
    expect(screen.getByText('湘雅附二医院')).toBeDefined();

    // Switch to Feedback tab
    const feedbackTab = screen.getByRole('tab', { name: /诊疗反馈/i });
    fireEvent.click(feedbackTab);
    expect(screen.getByText('医院诊断结果')).toBeDefined();
    expect(screen.getByText(/焦虑症伴轻度抑郁状态/)).toBeDefined();
    expect(screen.getByText('两周后复诊，每日监测情绪日记')).toBeDefined();
  });

  it('clicking header status badge routes to target tab', async () => {
    const detailsWithoutFeedback = {
      ...mockDetails,
      feedback: null,
    };
    vi.spyOn(intakeApi, 'getReferralDetails').mockResolvedValueOnce(detailsWithoutFeedback);
    vi.spyOn(intakeApi, 'getReferralTracking').mockResolvedValueOnce(mockTracking);

    render(
      <ReferralDetailsFullScreen
        referralId="ref-1"
        initialTab="overview"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('急性焦虑综合征')).toBeDefined();
    });

    // In WAITING_FOR_APPOINTMENT without feedback, clicking status pill routes to 'tracker'
    const statusPill = screen.getByTestId('details-status-badge');
    fireEvent.click(statusPill);

    expect(screen.getByText('转诊全流程进展')).toBeDefined();
  });

  it('ReferralOverviewTab renders 3 triage metrics, 3 severe risk indicators, and quote block', async () => {
    vi.spyOn(intakeApi, 'getReferralDetails').mockResolvedValueOnce(mockDetails);
    vi.spyOn(intakeApi, 'getReferralTracking').mockResolvedValueOnce(mockTracking);

    render(<ReferralDetailsFullScreen referralId="ref-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('急性焦虑综合征')).toBeDefined();
    });

    expect(screen.getByText('是否初诊')).toBeDefined();
    expect(screen.getByText('是否服药')).toBeDefined();
    expect(screen.getByText('心理治疗')).toBeDefined();

    expect(screen.getByText('自杀意念')).toBeDefined();
    expect(screen.getByText('自杀企图')).toBeDefined();
    expect(screen.getByText('自残行为')).toBeDefined();

    expect(screen.getByText(/连续四周出现强迫思维与失眠/)).toBeDefined();
  });

  it('ReferralTrackerTab renders 6 timeline steps, destination card, and appointment card', async () => {
    vi.spyOn(intakeApi, 'getReferralDetails').mockResolvedValueOnce(mockDetails);
    vi.spyOn(intakeApi, 'getReferralTracking').mockResolvedValueOnce(mockTracking);

    render(
      <ReferralDetailsFullScreen
        referralId="ref-1"
        initialTab="tracker"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('转诊全流程进展')).toBeDefined();
    });

    expect(screen.getByText('转诊发起')).toBeDefined();
    expect(screen.getByText('初审评估')).toBeDefined();
    expect(screen.getByText('中心分诊')).toBeDefined();
    expect(screen.getByText('医院排诊')).toBeDefined();
    expect(screen.getByText('就医问诊')).toBeDefined();
    expect(screen.getAllByText('诊疗反馈').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('接收医院')).toBeDefined();
    expect(screen.getByText('湘雅附二医院')).toBeDefined();
    expect(screen.getByText('接诊医生')).toBeDefined();
    expect(screen.getByText('陈主任')).toBeDefined();

    expect(screen.getByText('就诊预约')).toBeDefined();
    expect(screen.getAllByText('2026-11-05 09:30').length).toBeGreaterThanOrEqual(1);
  });

  it('ReferralFeedbackTab renders doctor consultation summary and follow-up plan', async () => {
    vi.spyOn(intakeApi, 'getReferralDetails').mockResolvedValueOnce(mockDetails);
    vi.spyOn(intakeApi, 'getReferralTracking').mockResolvedValueOnce(mockTracking);

    render(
      <ReferralDetailsFullScreen
        referralId="ref-1"
        initialTab="feedback"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('医院诊断结果')).toBeDefined();
    });

    expect(screen.getByText(/焦虑症伴轻度抑郁状态/)).toBeDefined();
    expect(screen.getByText('两周后复诊，每日监测情绪日记')).toBeDefined();
    expect(screen.getByText('门诊处方单.pdf')).toBeDefined();
  });
});
