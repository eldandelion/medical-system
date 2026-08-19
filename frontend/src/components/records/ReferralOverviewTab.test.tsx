import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReferralOverviewTab } from './ReferralOverviewTab';
import { Referral, ReferralDetails } from '../../types';
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

describe('ReferralOverviewTab', () => {
  const mockReferral: Referral = {
    id: 'ref-101',
    studentName: '李华',
    studentNumber: 'STU2026001',
    type: 'INITIAL',
    date: '2026-08-14 10:00:00',
    title: '焦虑情绪筛查转诊',
    description: '学生近期持续失眠，情绪低落',
    riskLevel: 'HIGH',
    status: 'AWAITING_TRIAGE',
    referredBy: { name: '张辅导员' }
  };

  const mockDetails: ReferralDetails = {
    baseInfo: mockReferral,
    studentDemographics: {
      age: 20,
      gender: '男',
      studentId: 'STU2026001',
      school: '计算机科学与技术学院',
      grade: '大二',
      phone: '13800000000'
    },
    triageInfo: {
      isFirstVisit: true,
      isMedicated: false,
      priorTherapy: '无',
      scidDiagnosis: '重度抑郁发作',
      fullDescription: '学生近期持续失眠，情绪低落，注意力无法集中'
    },
    riskAssessment: {
      ideation: true,
      attempt: false,
      selfHarm: true,
      notes: '有自伤倾向'
    },
    attachments: [
      { name: '转诊申请表.pdf', size: '1.5 MB', fileId: 201 },
      { name: '既往病历.docx', size: '500 KB', fileId: 202 }
    ]
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

  it('renders initial referral application attachments in Overview tab', () => {
    render(
      <ReferralOverviewTab
        referral={mockReferral}
        referralDetails={mockDetails}
      />
    );

    expect(screen.getByText(/转诊附件/)).toBeDefined();
    expect(screen.getByText('转诊申请表.pdf')).toBeDefined();
    expect(screen.getByText('既往病历.docx')).toBeDefined();
  });

  it('calls getReferralAttachmentDownloadUrl with PREVIEW intent and navigates window on PDF preview', async () => {
    const downloadSpy = vi.spyOn(fileApi, 'getReferralAttachmentDownloadUrl').mockResolvedValue('https://storage.medical.edu/attachments/report.pdf?sig=123');

    render(
      <ReferralOverviewTab
        referral={mockReferral}
        referralDetails={mockDetails}
      />
    );

    const pdfAttachment = screen.getByText('转诊申请表.pdf');
    fireEvent.click(pdfAttachment);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('about:blank', '_blank');
      expect(downloadSpy).toHaveBeenCalledWith('ref-101', 201, 'PREVIEW', 'mock-token');
      expect(mockReplace).toHaveBeenCalledWith('https://storage.medical.edu/attachments/report.pdf?sig=123');
    });
  });

  it('calls getReferralAttachmentDownloadUrl with DOWNLOAD intent on DOCX click', async () => {
    const downloadSpy = vi.spyOn(fileApi, 'getReferralAttachmentDownloadUrl').mockResolvedValue('https://storage.medical.edu/attachments/record.docx?sig=123');

    render(
      <ReferralOverviewTab
        referral={mockReferral}
        referralDetails={mockDetails}
      />
    );

    const docxAttachment = screen.getByText('既往病历.docx');
    fireEvent.click(docxAttachment);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith('ref-101', 202, 'DOWNLOAD', 'mock-token');
    });
  });

  it('renders dynamic workflow stage title in ReferralStatusCard and navigates on click', () => {
    const onNavigateMock = vi.fn();
    render(
      <ReferralOverviewTab
        referral={mockReferral}
        referralDetails={mockDetails}
        onNavigateToTracker={onNavigateMock}
      />
    );

    const statusBanner = screen.getByText('中心分诊中');
    expect(statusBanner).toBeDefined();

    fireEvent.click(statusBanner);
    expect(onNavigateMock).toHaveBeenCalledTimes(1);
  });
});
