import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssessmentCatalogManagementView } from './AssessmentCatalogManagementView';
import { AssessmentCatalogItemDto } from '../../types';

const mockToggleAvailability = vi.fn();
const mockRefetch = vi.fn();

let mockCatalog: AssessmentCatalogItemDto[] = [];
let mockIsLoading = false;
let mockIsError = false;
let mockIsToggling = false;

vi.mock('../../hooks/useAssessmentCatalogManagement', () => ({
  useAssessmentCatalogManagement: () => ({
    catalog: mockCatalog,
    isLoading: mockIsLoading,
    isError: mockIsError,
    refetch: mockRefetch,
    toggleAvailability: mockToggleAvailability,
    isToggling: mockIsToggling,
  }),
}));

describe('AssessmentCatalogManagementView', () => {
  const sampleScaleAvailable: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ-9' as any,
    title: '抑郁症筛查量表 (PHQ-9)',
    subtitle: '情绪与抑郁测评',
    description: '用于评估过去两周内抑郁情绪与兴趣减退情况的标准自评工具。',
    duration: '3-5 分钟',
    questionCount: 9,
    sections: [],
    isEnabled: true,
  };

  const sampleScaleHidden: AssessmentCatalogItemDto = {
    batteryCode: 'GAD-7' as any,
    title: '广泛性焦虑量表 (GAD-7)',
    subtitle: '焦虑与应激测评',
    description: '评估过去两周内广泛性焦虑与紧张不安的临床筛查量表。',
    duration: '2-4 分钟',
    questionCount: 7,
    sections: [],
    isEnabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalog = [sampleScaleAvailable, sampleScaleHidden];
    mockIsLoading = false;
    mockIsError = false;
    mockIsToggling = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders scale catalog items and counts', () => {
    render(<AssessmentCatalogManagementView />);

    expect(screen.getByText('心理测评量表目录与分发控制')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined(); // Catalog count
    expect(screen.getByText('抑郁症筛查量表 (PHQ-9)')).toBeDefined();
    expect(screen.getByText('广泛性焦虑量表 (GAD-7)')).toBeDefined();
    expect(screen.getByText('隐藏量表')).toBeDefined();
    expect(screen.getByText('启用上线')).toBeDefined();
  });

  it('opens confirmation dialog when clicking 隐藏量表 on available scale, expands details, and handles cancellation', () => {
    render(<AssessmentCatalogManagementView />);

    const hideBtn = screen.getByText('隐藏量表');
    fireEvent.click(hideBtn);

    // Dialog is opened
    expect(screen.getByText('确认隐藏测评量表？')).toBeDefined();
    expect(screen.getAllByText('PHQ-9').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/9 题/).length).toBeGreaterThan(0);
    expect(screen.getByText('查看操作影响与合规说明')).toBeDefined();

    // Expand compliance details
    fireEvent.click(screen.getByText('查看操作影响与合规说明'));
    expect(screen.getByText('目录隐藏与分发暂停')).toBeDefined();
    expect(screen.getByText('在途问卷有效完成')).toBeDefined();
    expect(screen.getByText('历史档案完整保留')).toBeDefined();
    expect(screen.getByText('随时恢复上线')).toBeDefined();

    // Cancel hiding
    const cancelBtn = screen.getByText('取消');
    fireEvent.click(cancelBtn);
    expect(mockToggleAvailability).not.toHaveBeenCalled();
  });

  it('executes hide scale action when confirmed in dialog', async () => {
    render(<AssessmentCatalogManagementView />);

    const hideBtn = screen.getByText('隐藏量表');
    fireEvent.click(hideBtn);

    const confirmBtn = screen.getByText('确认隐藏');
    fireEvent.click(confirmBtn);

    expect(mockToggleAvailability).toHaveBeenCalledWith({
      batteryCode: 'PHQ-9',
      isAvailable: false,
    });
  });

  it('directly enables scale without confirmation dialog when clicking 启用上线', () => {
    render(<AssessmentCatalogManagementView />);

    const enableBtn = screen.getByText('启用上线');
    fireEvent.click(enableBtn);

    // Confirmation dialog should NOT be shown
    expect(screen.queryByText('确认隐藏测评量表？')).toBeNull();
    expect(mockToggleAvailability).toHaveBeenCalledWith({
      batteryCode: 'GAD-7',
      isAvailable: true,
    });
  });

  it('renders loading and error fallback states', () => {
    mockIsLoading = true;
    const { rerender } = render(<AssessmentCatalogManagementView />);
    expect(screen.getByText('正在加载量表目录...')).toBeDefined();

    mockIsLoading = false;
    mockIsError = true;
    rerender(<AssessmentCatalogManagementView />);
    expect(screen.getByText('加载量表目录失败')).toBeDefined();

    const retryBtn = screen.getByText('重试');
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
