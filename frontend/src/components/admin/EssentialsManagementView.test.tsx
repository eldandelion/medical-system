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
    mockUseReferencesList.mockReturnValue({
      data: sampleColleges,
      isLoading: false,
      isFetching: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all 7 category filter chips', () => {
    const { container } = render(<EssentialsManagementView />);

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

    const majorChip = container.querySelector('md-filter-chip[data-category-key="MAJOR"]');
    expect(majorChip).toBeTruthy();
    if (majorChip) {
      fireEvent.click(majorChip);
    }
    expect(mockUseReferencesList).toHaveBeenCalledWith('MAJOR', expect.anything());
  });

  it('opens create modal when clicking 新增 button', () => {
    render(<EssentialsManagementView />);

    fireEvent.click(screen.getByText('新增学院'));
    expect(screen.getAllByText(/学院名称/).length).toBeGreaterThan(0);
  });

  it('opens bulk import modal when clicking 批量导入 button', () => {
    render(<EssentialsManagementView />);

    fireEvent.click(screen.getByText('批量导入'));
    expect(screen.getByText(/基础数据批量导入/)).toBeDefined();
  });
});
