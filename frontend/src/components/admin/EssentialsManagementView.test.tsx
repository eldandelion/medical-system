import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EssentialsManagementView } from './EssentialsManagementView';
import { CollegeDto } from '../../types/references';

const mockUseReferencesList = vi.fn();
const mockReactivateReference = vi.fn();
const mockSaveReference = vi.fn();
const mockDeprecateReference = vi.fn();
const mockDeleteReference = vi.fn();
const mockDependencyCheck = vi.fn();

vi.mock('../../hooks/useReferenceData', () => ({
  useReferencesList: (category: string, options: any) => mockUseReferencesList(category, options),
  useReactivateReference: () => ({ mutateAsync: mockReactivateReference }),
  useSaveReference: () => ({ mutateAsync: mockSaveReference, isPending: false }),
  useDeprecateReference: () => ({ mutateAsync: mockDeprecateReference, isPending: false }),
  useDeleteReference: () => ({ mutateAsync: mockDeleteReference, isPending: false }),
  useReferenceDependencyCheck: () => ({ mutateAsync: mockDependencyCheck, isPending: false }),
}));

vi.mock('../../hooks/useReferenceBulkImport', () => ({
  useReferenceBulkImport: () => ({
    downloadTemplate: vi.fn(),
    previewCsv: vi.fn(),
    commitImport: vi.fn(),
    isPreviewLoading: false,
    isCommitLoading: false,
    isDownloadingTemplate: false,
    previewData: null,
    commitData: null,
    resetPreview: vi.fn(),
    resetCommit: vi.fn(),
  }),
}));

describe('EssentialsManagementView', () => {
  const sampleColleges: CollegeDto[] = [
    { id: 1, name: '计算机与通信工程学院', status: 'ACTIVE', majorCount: 4, teacherCount: 18 },
    { id: 2, name: '经济与管理学院', status: 'ACTIVE', majorCount: 5, teacherCount: 22 },
    { id: 3, name: '历史与文化学院 (已停用)', status: 'DEPRECATED', majorCount: 1, teacherCount: 0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseReferencesList.mockImplementation((_category, options) => {
      let filtered = sampleColleges;
      if (options?.query) {
        filtered = filtered.filter((item) => item.name.includes(options.query));
      }
      return {
        data: filtered,
        isLoading: false,
        isFetching: false,
      };
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all 8 category filter chips', () => {
    const { container } = render(<EssentialsManagementView />);

    expect(container.querySelector('md-filter-chip[data-category-key="SCHOOL"]')).toBeDefined();
    expect(container.querySelector('md-filter-chip[data-category-key="COLLEGE"]')).toBeDefined();
    expect(container.querySelector('md-filter-chip[data-category-key="MAJOR"]')).toBeDefined();
    expect(container.querySelector('md-filter-chip[data-category-key="SCHOOL_DEPARTMENT"]')).toBeDefined();
    expect(container.querySelector('md-filter-chip[data-category-key="HOSPITAL"]')).toBeDefined();
    expect(container.querySelector('md-filter-chip[data-category-key="HOSPITAL_DEPARTMENT"]')).toBeDefined();
    expect(container.querySelector('md-filter-chip[data-category-key="ETHNICITY"]')).toBeDefined();
    expect(container.querySelector('md-filter-chip[data-category-key="DEGREE_LEVEL"]')).toBeDefined();
  });

  it('renders list of colleges and action buttons', () => {
    render(<EssentialsManagementView />);

    expect(screen.getByText('计算机与通信工程学院')).toBeDefined();
    expect(screen.getByText('经济与管理学院')).toBeDefined();
    expect(screen.getByText('历史与文化学院 (已停用)')).toBeDefined();
    expect(screen.getAllByText('正常可用').length).toBe(2);
    expect(screen.getByText('已停用')).toBeDefined();
  });

  it('switches category when clicking on another filter chip', () => {
    const { container } = render(<EssentialsManagementView />);

    const schoolChip = container.querySelector('md-filter-chip[data-category-key="SCHOOL"]');
    expect(schoolChip).toBeTruthy();
    if (schoolChip) {
      fireEvent.click(schoolChip);
    }
    expect(mockUseReferencesList).toHaveBeenCalledWith('SCHOOL', expect.anything());
  });

  it('opens create modal when clicking 新增 button', () => {
    render(<EssentialsManagementView />);

    fireEvent.click(screen.getByText('新增学校'));
    expect(screen.getAllByText(/学校名称/).length).toBeGreaterThan(0);
  });

  it('opens bulk import modal when clicking 批量导入 in split button menu', () => {
    render(<EssentialsManagementView />);

    const menuTrigger = screen.getByLabelText('更多操作');
    fireEvent.click(menuTrigger);

    const importOption = screen.getByText('批量导入');
    fireEvent.click(importOption);

    expect(screen.getByText(/基础数据批量导入/)).toBeDefined();
  });

  it('filters reference items using ExpandableSearchBar', () => {
    render(<EssentialsManagementView />);

    // Initially all 3 items are present
    expect(screen.getByText('计算机与通信工程学院')).toBeDefined();
    expect(screen.getByText('经济与管理学院')).toBeDefined();

    // Expand search bar
    const searchButton = screen.getByRole('button', { name: '展开搜索' });
    fireEvent.click(searchButton);

    const searchInput = screen.getByPlaceholderText(/搜索.*名称\.\.\./);
    fireEvent.change(searchInput, { target: { value: '计算机' } });

    // Should filter to only matching item
    expect(screen.getByText('计算机与通信工程学院')).toBeDefined();
    expect(screen.queryByText('经济与管理学院')).toBeNull();

    // Clear search
    const clearButton = screen.getByRole('button', { name: '清除搜索' });
    fireEvent.click(clearButton);

    // Restores items
    expect(screen.getByText('计算机与通信工程学院')).toBeDefined();
    expect(screen.getByText('经济与管理学院')).toBeDefined();
  });

  it('filters reference items using status FilterChip (all, only active, only stopped)', () => {
    render(<EssentialsManagementView />);

    // Status filter chip is positioned in front of the search bar, defaulted to 全部
    const statusChipButton = screen.getByText('状态: 全部');
    expect(statusChipButton).toBeDefined();

    // Verify initially all items (active and deprecated) are visible
    expect(screen.getByText('计算机与通信工程学院')).toBeDefined();
    expect(screen.getByText('经济与管理学院')).toBeDefined();
    expect(screen.getByText('历史与文化学院 (已停用)')).toBeDefined();

    // Open status filter dropdown
    fireEvent.click(statusChipButton);

    // Select 仅正常 (only active)
    const onlyActiveOption = screen.getByText('仅正常').closest('md-menu-item');
    expect(onlyActiveOption).toBeTruthy();
    if (onlyActiveOption) {
      fireEvent.click(onlyActiveOption);
    }

    // Now chip displays 状态: 仅正常
    expect(screen.getByText('状态: 仅正常')).toBeDefined();
    // Only active items should be rendered
    expect(screen.getByText('计算机与通信工程学院')).toBeDefined();
    expect(screen.getByText('经济与管理学院')).toBeDefined();
    expect(screen.queryByText('历史与文化学院 (已停用)')).toBeNull();

    // Open dropdown again and select 仅已停用 (only stopped)
    fireEvent.click(screen.getByText('状态: 仅正常'));
    const onlyStoppedOption = screen.getByText('仅已停用').closest('md-menu-item');
    expect(onlyStoppedOption).toBeTruthy();
    if (onlyStoppedOption) {
      fireEvent.click(onlyStoppedOption);
    }

    // Now chip displays 状态: 仅已停用
    expect(screen.getByText('状态: 仅已停用')).toBeDefined();
    // Only deprecated items should be rendered
    expect(screen.queryByText('计算机与通信工程学院')).toBeNull();
    expect(screen.queryByText('经济与管理学院')).toBeNull();
    expect(screen.getByText('历史与文化学院 (已停用)')).toBeDefined();

    // Switch back to 全部
    fireEvent.click(screen.getByText('状态: 仅已停用'));
    const allOption = screen.getByText('全部').closest('md-menu-item');
    expect(allOption).toBeTruthy();
    if (allOption) {
      fireEvent.click(allOption);
    }

    expect(screen.getByText('状态: 全部')).toBeDefined();
    expect(screen.getByText('计算机与通信工程学院')).toBeDefined();
    expect(screen.getByText('经济与管理学院')).toBeDefined();
    expect(screen.getByText('历史与文化学院 (已停用)')).toBeDefined();
  });
});
