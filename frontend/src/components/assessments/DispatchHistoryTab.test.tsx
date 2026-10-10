import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DispatchHistoryTab } from './DispatchHistoryTab';
import * as dispatchHooks from '../../hooks/useAssessmentDispatchHistory';

vi.mock('../../hooks/useAssessmentDispatchHistory');

describe('DispatchHistoryTab', () => {
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

    // After render, the useEffect should have fired and updated the selectedDispatch to 99
    // Which means useAssessmentDispatchHistory should be called with dispatchId: 99
    
    await waitFor(() => {
      expect(mockUseAssessmentDispatchHistory).toHaveBeenCalledWith(
        expect.objectContaining({ dispatchId: 99 })
      );
    });
  });
});
