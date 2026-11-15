import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useScaleLifecycleActions } from './useScaleLifecycleActions';
import { AssessmentCatalogItemDto } from '../types';

const mockToggleAvailability = vi.fn();
const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();

vi.mock('./useAssessmentCatalogManagement', () => ({
  useAssessmentCatalogManagement: () => ({
    catalog: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    toggleAvailability: mockToggleAvailability,
    isToggling: false,
  }),
}));

vi.mock('../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation,
  }),
}));

describe('useScaleLifecycleActions', () => {
  const availableScale: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ_9',
    title: '情绪状况评估 (PHQ-9)',
    subtitle: '抑郁症筛查量表',
    description: '用于评估过去两周抑郁症状。',
    duration: '5 分钟',
    questionCount: 9,
    sections: [],
    isEnabled: true,
  };

  const hiddenScale: AssessmentCatalogItemDto = {
    batteryCode: 'GAD_7',
    title: '焦虑状况评估 (GAD-7)',
    subtitle: '广泛性焦虑量表',
    description: '用于评估过去两周焦虑症状。',
    duration: '5 分钟',
    questionCount: 7,
    sections: [],
    isEnabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToggleAvailability.mockResolvedValue(availableScale);
  });

  it('opens AssessmentAssignmentCreationForm in fullscreen creation overlay on handleOpenAssign', () => {
    const { result } = renderHook(() => useScaleLifecycleActions());

    act(() => {
      result.current.handleOpenAssign(availableScale);
    });

    expect(mockOpenCreation).toHaveBeenCalledWith(
      '指派心理测评',
      expect.anything(),
      expect.objectContaining({
        initialViewState: 'FULLSCREEN',
        allowStandardView: false,
      })
    );
  });

  it('sets pendingHideScale instead of immediately toggling when requesting hide on an enabled scale', async () => {
    const { result } = renderHook(() => useScaleLifecycleActions());

    await act(async () => {
      await result.current.requestToggleAvailability(availableScale);
    });

    expect(result.current.pendingHideScale).toEqual(availableScale);
    expect(mockToggleAvailability).not.toHaveBeenCalled();
  });

  it('directly invokes toggleAvailability when enabling a hidden scale', async () => {
    const { result } = renderHook(() => useScaleLifecycleActions());

    await act(async () => {
      await result.current.requestToggleAvailability(hiddenScale);
    });

    expect(result.current.pendingHideScale).toBeNull();
    expect(mockToggleAvailability).toHaveBeenCalledWith({
      batteryCode: 'GAD_7',
      isAvailable: true,
    });
  });

  it('invokes toggleAvailability with isAvailable: false and clears pendingHideScale on confirmHideScale', async () => {
    const { result } = renderHook(() => useScaleLifecycleActions());

    await act(async () => {
      await result.current.requestToggleAvailability(availableScale);
    });
    expect(result.current.pendingHideScale).toEqual(availableScale);

    await act(async () => {
      await result.current.confirmHideScale();
    });

    expect(mockToggleAvailability).toHaveBeenCalledWith({
      batteryCode: 'PHQ_9',
      isAvailable: false,
    });
    expect(result.current.pendingHideScale).toBeNull();
  });

  it('clears pendingHideScale without calling toggleAvailability on cancelHideScale', async () => {
    const { result } = renderHook(() => useScaleLifecycleActions());

    await act(async () => {
      await result.current.requestToggleAvailability(availableScale);
    });

    act(() => {
      result.current.cancelHideScale();
    });

    expect(result.current.pendingHideScale).toBeNull();
    expect(mockToggleAvailability).not.toHaveBeenCalled();
  });

  it('swallows toggleAvailability rejections gracefully and resets togglingCode', async () => {
    mockToggleAvailability.mockRejectedValueOnce(new Error('Forbidden'));
    const { result } = renderHook(() => useScaleLifecycleActions());

    await act(async () => {
      await result.current.requestToggleAvailability(hiddenScale);
    });

    expect(mockToggleAvailability).toHaveBeenCalledWith({
      batteryCode: 'GAD_7',
      isAvailable: true,
    });
    expect(result.current.togglingCode).toBeNull();
  });
});
