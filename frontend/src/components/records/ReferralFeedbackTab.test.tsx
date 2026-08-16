import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReferralFeedbackTab } from './ReferralFeedbackTab';
import { ReferralDetails } from '../../types';
import * as fileApi from '../../api/files';

const mockShowSnackbar = vi.fn();
vi.mock('../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar
  })
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { token: 'mock-token' }
  })
}));

vi.mock('../../contexts/DetailsContext', () => ({
  useDetails: () => ({
    isFullScreen: false,
    selectedRecord: null,
    closeDetails: vi.fn(),
    setSelectedRecord: vi.fn(),
    openDetails: vi.fn()
  })
}));

describe('ReferralFeedbackTab', () => {
  const mockDetailsWithFeedback: ReferralDetails = {
    baseInfo: {
      id: 'ref-101',
      studentId: 2,
      studentName: '张伟',
      studentNumber: '2022001',
      type: 'INITIAL',
      date: '2026-04-12T00:00:00Z',
      title: '急性焦虑',
      description: '考试后急性焦虑',
      riskLevel: 'HIGH',
      status: 'AWAITING_FEEDBACK_APPROVAL',
      referredBy: { name: '艾米丽·沃森' }
    },
    studentDemographics: {
      age: 20,
      gender: '男',
      studentId: '2022001',
      school: '计算机科学与技术学院',
      grade: '大二',
      phone: '13800000000'
    },
    triageInfo: {
      isFirstVisit: true,
      isMedicated: false,
      priorTherapy: '无',
      scidDiagnosis: 'F41.1 广泛性焦虑障碍',
      fullDescription: '考试后急性焦虑'
    },
    riskAssessment: {
      ideation: true,
      attempt: false,
      selfHarm: false,
      notes: ''
    },
    feedback: {
      summary: '经过临床评估，诊断为广泛性焦虑障碍，建议结合认知行为疗法。',
      followUp: '两周后门诊复查，持续随访。',
      attachments: [
        { name: '诊疗评估报告.pdf', size: '1.2 MB', fileId: 301 },
        { name: '处方明细.docx', size: '300 KB', fileId: 302 }
      ]
    }
  };

  const mockDetailsWithoutFeedback: ReferralDetails = {
    ...mockDetailsWithFeedback,
    feedback: undefined
  };

  const mockReplace = vi.fn();
  const mockWindow = {
    opener: null,
    document: {
      write: vi.fn(),
      body: { innerHTML: '' }
    },
    location: {
      replace: mockReplace
    },
    close: vi.fn()
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'open').mockImplementation(() => mockWindow);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders fallback when feedback is missing', () => {
    render(<ReferralFeedbackTab referralDetails={mockDetailsWithoutFeedback} />);

    expect(screen.getByText('暂无反馈数据')).toBeDefined();
    expect(screen.getByText('暂无随访计划')).toBeDefined();
  });

  it('renders feedback summary, followUp, and attachments list', () => {
    render(<ReferralFeedbackTab referralDetails={mockDetailsWithFeedback} />);

    expect(screen.getByText(/经过临床评估，诊断为广泛性焦虑障碍/)).toBeDefined();
    expect(screen.getByText(/两周后门诊复查/)).toBeDefined();
    expect(screen.getByText('诊疗评估报告.pdf')).toBeDefined();
    expect(screen.getByText('处方明细.docx')).toBeDefined();
  });

  it('triggers inline preview when clicking PDF feedback attachment', async () => {
    const downloadSpy = vi.spyOn(fileApi, 'getReferralAttachmentDownloadUrl').mockResolvedValue('https://storage.medical.edu/feedback/report.pdf?sig=456');

    render(<ReferralFeedbackTab referralDetails={mockDetailsWithFeedback} />);

    const pdfAttachment = screen.getByText('诊疗评估报告.pdf');
    fireEvent.click(pdfAttachment);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('about:blank', '_blank');
      expect(downloadSpy).toHaveBeenCalledWith('ref-101', 301, 'PREVIEW', 'mock-token');
      expect(mockReplace).toHaveBeenCalledWith('https://storage.medical.edu/feedback/report.pdf?sig=456');
    });
  });

  it('triggers download when clicking DOCX feedback attachment', async () => {
    const downloadSpy = vi.spyOn(fileApi, 'getReferralAttachmentDownloadUrl').mockResolvedValue('https://storage.medical.edu/feedback/prescription.docx?sig=456');

    render(<ReferralFeedbackTab referralDetails={mockDetailsWithFeedback} />);

    const docxAttachment = screen.getByText('处方明细.docx');
    fireEvent.click(docxAttachment);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith('ref-101', 302, 'DOWNLOAD', 'mock-token');
    });
  });
});
