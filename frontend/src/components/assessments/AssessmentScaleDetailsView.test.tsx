import * as React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AssessmentScaleDetailsView,
  ScaleDetailsTabs,
} from './AssessmentScaleDetailsView';
import { DetailsContext, DetailsHeaderOverride } from '../../contexts/DetailsContext';
import { SnackbarProvider } from '../../contexts/SnackbarContext';
import { AssessmentCatalogItemDto } from '../../types';

const mockToggleAvailability = vi.fn();
const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();

let mockCatalogData: AssessmentCatalogItemDto[] = [];

vi.mock('../../hooks/useAssessmentCatalogManagement', () => ({
  useAssessmentCatalogManagement: () => ({
    catalog: mockCatalogData,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    toggleAvailability: mockToggleAvailability,
    isToggling: false,
  }),
}));

vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation,
  }),
}));

describe('AssessmentScaleDetailsView', () => {
  let queryClient: QueryClient;

  const sampleScale: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ_9',
    title: '情绪状况评估 (PHQ-9)',
    subtitle: '抑郁症筛查量表',
    description: '用于评估过去两周内抑郁情绪的筛查量表。',
    duration: '5 分钟',
    questionCount: 9,
    isEnabled: true,
    sections: [
      {
        id: 'phq9',
        title: '核心抑郁症状',
        subtitle: 'PHQ-9',
        description: '过去两周内受困扰的频率',
        questions: [
          {
            id: 'phq9_1',
            orderNum: 1,
            text: '做事时提不起劲或没有兴趣',
            type: 'single_choice',
            options: [
              { value: 0, label: '完全不会' },
              { value: 1, label: '好几天' },
            ],
          },
        ],
      },
    ],
  };

  const renderWithProviders = (
    ui: React.ReactElement,
    detailsContextValue: Partial<React.ComponentProps<typeof DetailsContext.Provider>['value']> = {}
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <DetailsContext.Provider value={{ isFullScreen: false, ...detailsContextValue }}>
            {ui}
          </DetailsContext.Provider>
        </SnackbarProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockCatalogData = [sampleScale];
    mockToggleAvailability.mockResolvedValue({ ...sampleScale, isEnabled: false });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders overview tab by default and switches to questions tab', async () => {
    const onTabChange = vi.fn();
    const { rerender } = renderWithProviders(
      <AssessmentScaleDetailsView
        scale={sampleScale}
        activeTab={ScaleDetailsTabs.OVERVIEW}
        onTabChange={onTabChange}
      />
    );

    expect(screen.getByText('量表信息')).toBeDefined();
    expect(screen.getByText('量表说明')).toBeDefined();
    expect(screen.queryByText('做事时提不起劲或没有兴趣')).toBeNull();

    const mdTabs = document.querySelector('md-tabs');
    expect(mdTabs).toBeDefined();
    if (mdTabs) {
      (mdTabs as HTMLElement & { activeTabIndex: number }).activeTabIndex = 1;
      fireEvent(mdTabs, new CustomEvent('change', { bubbles: true }));
      expect(onTabChange).toHaveBeenCalledWith(ScaleDetailsTabs.QUESTIONS);
    }

    rerender(
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <DetailsContext.Provider value={{ isFullScreen: false }}>
            <AssessmentScaleDetailsView
              scale={sampleScale}
              activeTab={ScaleDetailsTabs.QUESTIONS}
              onTabChange={onTabChange}
            />
          </DetailsContext.Provider>
        </SnackbarProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('核心抑郁症状')).toBeDefined();
      expect(screen.getByText('做事时提不起劲或没有兴趣')).toBeDefined();
    });
  });

  it('sets DetailsContext headerOverride on mount and clears it on unmount', () => {
    const setHeaderOverride = vi.fn();
    const { unmount } = renderWithProviders(
      <AssessmentScaleDetailsView scale={sampleScale} />,
      { setHeaderOverride }
    );

    expect(setHeaderOverride).toHaveBeenCalled();
    const lastCall = setHeaderOverride.mock.calls[setHeaderOverride.mock.calls.length - 1][0] as DetailsHeaderOverride;
    expect(lastCall.title).toBe('情绪状况评估 (PHQ-9)');
    expect(lastCall.subtitle).toBe('PHQ_9 · 5 分钟 · 9 题');

    unmount();
    expect(setHeaderOverride).toHaveBeenLastCalledWith(null);
  });

  it('hides local SecondaryTabs when isFullScreen is true', () => {
    renderWithProviders(
      <AssessmentScaleDetailsView scale={sampleScale} />,
      { isFullScreen: true }
    );

    expect(document.querySelector('md-tabs')).toBeNull();
  });

  it('syncs live catalog status from useAssessmentCatalogManagement', () => {
    mockCatalogData = [{ ...sampleScale, isEnabled: false }];

    renderWithProviders(<AssessmentScaleDetailsView scale={sampleScale} />);

    expect(screen.getAllByText('已隐藏').length).toBeGreaterThan(0);
    expect(screen.getByText('启用上线')).toBeDefined();
    const assignBtn = screen.getByText('指派测评').closest('md-filled-button');
    expect(assignBtn?.hasAttribute('disabled')).toBe(true);
  });

  it('renders ActionFooter buttons for available scale and handles assign and hide dialog', async () => {
    renderWithProviders(<AssessmentScaleDetailsView scale={sampleScale} />);

    const assignBtn = screen.getByText('指派测评');
    fireEvent.click(assignBtn);
    expect(mockOpenCreation).toHaveBeenCalledWith(
      '指派心理测评',
      expect.anything(),
      expect.objectContaining({
        initialViewState: 'FULLSCREEN',
        allowStandardView: false,
      })
    );

    fireEvent.click(screen.getByText('隐藏量表'));
    expect(screen.getByText('确认隐藏测评量表？')).toBeDefined();

    fireEvent.click(screen.getByText('确认隐藏'));
    await waitFor(() => {
      expect(mockToggleAvailability).toHaveBeenCalledWith({
        batteryCode: 'PHQ_9',
        isAvailable: false,
      });
    });
  });

  it('directly enables a hidden scale when clicking 启用上线 in footer', async () => {
    const hiddenScale = { ...sampleScale, isEnabled: false };
    mockCatalogData = [hiddenScale];

    renderWithProviders(<AssessmentScaleDetailsView scale={hiddenScale} />);

    fireEvent.click(screen.getByText('启用上线'));
    await waitFor(() => {
      expect(mockToggleAvailability).toHaveBeenCalledWith({
        batteryCode: 'PHQ_9',
        isAvailable: true,
      });
    });
  });
});
