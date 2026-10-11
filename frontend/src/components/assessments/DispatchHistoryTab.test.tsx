import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DispatchHistoryTab } from './DispatchHistoryTab';
import * as dispatchHooks from '../../hooks/useAssessmentDispatchHistory';

vi.mock('../../hooks/useAssessmentDispatchHistory');
vi.mock('../../hooks/useAssessmentCatalogManagement', () => ({
  useAssessmentCatalogManagement: () => ({
    catalog: [
      { batteryCode: 'PHQ-9', title: '情绪状况评估 (PHQ-9)' },
      { batteryCode: 'PHQ_9', title: '情绪状况评估 (PHQ-9)' },
    ],
  }),
}));

describe('DispatchHistoryTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('resolves "latest" to the ID of the first dispatch in the summary list', async () => {
    const mockDispatches = [
      { id: 99, batteryCode: 'PHQ-9', dispatchedAt: '2023-10-01T00:00:00Z' },
      { id: 98, batteryCode: 'GAD-7', dispatchedAt: '2023-09-01T00:00:00Z' },
    ];

    const mockHistoryPage = {
      content: [
        {
          studentId: 10,
          studentNumber: 'STU001',
          studentName: 'Alex',
          status: 'PENDING',
          severity: 'LOW'
        }
      ],
      totalElements: 1,
      totalPages: 1
    };

    // Setup mocks
    const mockUseAssessmentDispatches = vi.spyOn(dispatchHooks, 'useAssessmentDispatches');
    const mockUseAssessmentDispatchHistory = vi.spyOn(dispatchHooks, 'useAssessmentDispatchHistory');

    mockUseAssessmentDispatches.mockReturnValue({
      data: mockDispatches,
      isLoading: false
    } as any);

    mockUseAssessmentDispatchHistory.mockReturnValue({
      data: mockHistoryPage,
      isLoading: false
    } as any);

    render(<DispatchHistoryTab />);

    await waitFor(() => {
      expect(mockUseAssessmentDispatchHistory).toHaveBeenCalledWith(
        expect.objectContaining({ dispatchId: 99 })
      );
    });
  });

  it('renders consolidated "量表名称" column header and omits standalone "分发时间" header', () => {
    vi.spyOn(dispatchHooks, 'useAssessmentDispatches').mockReturnValue({ data: [], isLoading: false } as any);
    vi.spyOn(dispatchHooks, 'useAssessmentDispatchHistory').mockReturnValue({
      data: {
        content: [
          {
            assignmentId: 101,
            studentId: 10,
            studentNumber: 'STU001',
            studentName: '张三',
            status: 'PENDING',
            severity: 'LOW',
            assessmentName: 'PHQ-9 抑郁症筛查量表',
            dispatchedAt: '2023-10-01T08:00:00Z',
          }
        ],
        totalElements: 1,
        totalPages: 1
      },
      isLoading: false
    } as any);

    render(<DispatchHistoryTab />);

    expect(screen.getByText('学生')).toBeDefined();
    expect(screen.getByText('量表名称')).toBeDefined();
    expect(screen.getByText('状态')).toBeDefined();
    expect(screen.queryByText('分发时间')).toBeNull();
  });

  it('renders assessment name as primary title and formatted date as subtitle', () => {
    vi.spyOn(dispatchHooks, 'useAssessmentDispatches').mockReturnValue({ data: [], isLoading: false } as any);
    vi.spyOn(dispatchHooks, 'useAssessmentDispatchHistory').mockReturnValue({
      data: {
        content: [
          {
            assignmentId: 101,
            studentId: 10,
            studentNumber: 'STU001',
            studentName: '李四',
            status: 'COMPLETED',
            severity: 'LOW',
            assessmentName: 'PHQ_9',
            dispatchedAt: '2023-10-01T12:00:00',
          }
        ],
        totalElements: 1,
        totalPages: 1
      },
      isLoading: false
    } as any);

    render(<DispatchHistoryTab />);

    expect(screen.getByText('情绪状况评估 (PHQ-9)')).toBeDefined();
    expect(screen.getByText('2023年10月1日')).toBeDefined();
  });

  it('handles missing assessment name and dispatchedAt gracefully with fallbacks', () => {
    vi.spyOn(dispatchHooks, 'useAssessmentDispatches').mockReturnValue({ data: [], isLoading: false } as any);
    vi.spyOn(dispatchHooks, 'useAssessmentDispatchHistory').mockReturnValue({
      data: {
        content: [
          {
            assignmentId: 102,
            studentId: 11,
            studentNumber: 'STU002',
            studentName: '王五',
            status: 'PENDING',
            severity: 'LOW',
          }
        ],
        totalElements: 1,
        totalPages: 1
      },
      isLoading: false
    } as any);

    render(<DispatchHistoryTab />);

    expect(screen.getByText('未知')).toBeDefined();
    expect(screen.getByText('-')).toBeDefined();
  });
});
