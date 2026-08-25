import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StudentBulkImportDialog } from './StudentBulkImportDialog';
import { StudentImportPreview, StudentImportResult } from '../../types/studentImport';

const mockDownloadTemplate = vi.fn();
const mockPreviewCsv = vi.fn();
const mockCommitImport = vi.fn();
const mockResetPreview = vi.fn();
const mockResetCommit = vi.fn();

let mockPreviewData: StudentImportPreview | null = null;
let mockCommitData: StudentImportResult | null = null;
let mockIsPreviewLoading = false;
let mockIsCommitLoading = false;

vi.mock('../../hooks/useStudentBulkImport', () => ({
  useStudentBulkImport: () => ({
    downloadTemplate: mockDownloadTemplate,
    previewCsv: mockPreviewCsv,
    commitImport: mockCommitImport,
    isPreviewLoading: mockIsPreviewLoading,
    isCommitLoading: mockIsCommitLoading,
    previewData: mockPreviewData,
    commitData: mockCommitData,
    resetPreview: mockResetPreview,
    resetCommit: mockResetCommit
  })
}));

describe('StudentBulkImportDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPreviewData = null;
    mockCommitData = null;
    mockIsPreviewLoading = false;
    mockIsCommitLoading = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Step 1 (Upload) when open=true with template download and drag-and-drop', () => {
    const onClose = vi.fn();
    render(<StudentBulkImportDialog open={true} onClose={onClose} />);

    expect(screen.getByText('全校学生档案批量导入')).toBeDefined();
    expect(screen.getByText('下载 CSV 模板')).toBeDefined();
    expect(screen.getByText(/点击选择或将 CSV 文件拖拽至此处/)).toBeDefined();
    expect(screen.getByText(/导入规范与注意事项/)).toBeDefined();

    // Trigger download template
    fireEvent.click(screen.getByText('下载 CSV 模板'));
    expect(mockDownloadTemplate).toHaveBeenCalledTimes(1);
  });

  it('handles CSV file upload and calls previewCsv', async () => {
    const onClose = vi.fn();
    render(<StudentBulkImportDialog open={true} onClose={onClose} />);

    const file = new File(['学号,姓名\nS001,张三'], 'students.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDefined();

    mockPreviewCsv.mockResolvedValueOnce({
      totalRows: 1,
      readyCount: 1,
      duplicateCount: 0,
      invalidCount: 0,
      rows: []
    });

    fireEvent.change(input, { target: { files: [file] } });
    expect(mockPreviewCsv).toHaveBeenCalledWith(file);
  });

  it('renders Step 2 (Preview) with KPI metrics, filter chips, duplicate checkbox and table', async () => {
    mockPreviewData = {
      totalRows: 3,
      readyCount: 1,
      duplicateCount: 1,
      invalidCount: 1,
      rows: [
        {
          rowNumber: 2,
          studentNumber: 'S2026001',
          name: '陈志远',
          major: '计算机科学',
          enrollmentDate: '2026-09-01',
          idCardNumber: '110101200801011234',
          gender: 'MALE',
          ethnicity: '汉族',
          contactNumber: '13800138000',
          email: 'chenzy@univ.edu.cn',
          teacherEmployeeNumber: 'EMP-00001',
          status: 'READY',
          errors: []
        },
        {
          rowNumber: 3,
          studentNumber: '2021001',
          name: '张伟',
          major: '计算机科学',
          enrollmentDate: '2021-09-01',
          idCardNumber: '110101200301011234',
          gender: 'MALE',
          ethnicity: '汉族',
          contactNumber: '13800138001',
          email: 'zhangwei@univ.edu.cn',
          teacherEmployeeNumber: 'EMP-00001',
          status: 'DUPLICATE',
          errors: [
            {
              field: 'studentNumber',
              code: 'DUPLICATE_IN_DATABASE',
              invalidValue: '2021001'
            }
          ]
        },
        {
          rowNumber: 4,
          studentNumber: 'S2026002',
          name: '王某',
          major: '不存在的专业',
          enrollmentDate: '2026-09-01',
          idCardNumber: '123',
          gender: 'MALE',
          ethnicity: '汉族',
          contactNumber: '12345',
          email: 'invalid-email',
          teacherEmployeeNumber: null,
          status: 'INVALID',
          errors: [
            {
              field: 'major',
              code: 'MAJOR_NOT_FOUND',
              invalidValue: '不存在的专业'
            }
          ]
        }
      ]
    };

    const onClose = vi.fn();
    render(<StudentBulkImportDialog open={true} onClose={onClose} />);

    // Simulate stepping to PREVIEW
    const file = new File(['csv'], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    mockPreviewCsv.mockResolvedValueOnce(mockPreviewData);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('导入数据预览与核验')).toBeDefined();
    });

    // Check KPI cards
    expect(screen.getByText('总读取记录')).toBeDefined();
    expect(screen.getByText('待导入 (就绪)')).toBeDefined();
    expect(screen.getAllByText('已存在 (重复)')[0]).toBeDefined();
    expect(screen.getByText('格式异常 (不可导入)')).toBeDefined();

    // Check Filter Chips
    expect(screen.getByText('全部 (3)')).toBeDefined();
    expect(screen.getByText('待导入 (1)')).toBeDefined();
    expect(screen.getByText('已存在 (1)')).toBeDefined();
    expect(screen.getByText('异常 (1)')).toBeDefined();

    // Filter by READY
    fireEvent.click(screen.getByText('待导入 (1)'));
    expect(screen.getByText('陈志远')).toBeDefined();

    // Check Overwrite Checkbox
    const checkbox = screen.getByLabelText('更新已存在学生档案');
    expect(checkbox).toBeDefined();
    expect(checkbox.hasAttribute('checked')).toBe(false);

    // Toggle Checkbox
    fireEvent.click(checkbox);
    expect(checkbox.hasAttribute('checked')).toBe(true);

    // Commit import
    mockCommitImport.mockResolvedValueOnce({
      totalProcessed: 2,
      importedCount: 1,
      updatedCount: 1,
      skippedCount: 0,
      failedRows: []
    });

    const commitBtn = screen.getByText('确认导入 (2 条)');
    fireEvent.click(commitBtn);

    expect(mockCommitImport).toHaveBeenCalledWith({
      rows: mockPreviewData.rows,
      overwriteDuplicates: true
    });
  });

  it('renders Step 3 (Result) upon completion with summary statistics and finish action', async () => {
    mockPreviewData = {
      totalRows: 2,
      readyCount: 2,
      duplicateCount: 0,
      invalidCount: 0,
      rows: []
    };

    mockCommitData = {
      totalProcessed: 2,
      importedCount: 2,
      updatedCount: 0,
      skippedCount: 0,
      failedRows: []
    };

    const onClose = vi.fn();
    render(<StudentBulkImportDialog open={true} onClose={onClose} />);

    // Step to Preview
    const file = new File(['csv'], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    mockPreviewCsv.mockResolvedValueOnce(mockPreviewData);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('导入数据预览与核验')).toBeDefined();
    });

    // Step to Result
    mockCommitImport.mockResolvedValueOnce(mockCommitData);
    const commitBtn = screen.getByText('确认导入 (2 条)');
    fireEvent.click(commitBtn);

    await waitFor(() => {
      expect(screen.getByText('批量导入完成')).toBeDefined();
    });

    expect(screen.getByText('学生档案批量导入完成')).toBeDefined();
    expect(screen.getByText('成功导入 (新增)')).toBeDefined();
    expect(screen.getByText('成功更新 (覆盖)')).toBeDefined();

    // Click finish
    const finishBtn = screen.getByText('完成');
    fireEvent.click(finishBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders close cross button on upload step and closes directly', () => {
    const onClose = vi.fn();
    render(<StudentBulkImportDialog open={true} onClose={onClose} />);

    const closeBtn = screen.getByLabelText('关闭');
    expect(closeBtn).toBeDefined();

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close cross button on preview step and prompts confirmation on cancel/clicking away', async () => {
    mockPreviewData = {
      totalRows: 1,
      readyCount: 1,
      duplicateCount: 0,
      invalidCount: 0,
      rows: [
        {
          rowNumber: 2,
          studentNumber: 'S2026001',
          name: '陈志远',
          major: '计算机科学',
          enrollmentDate: '2026-09-01',
          idCardNumber: '110101200801011234',
          gender: 'MALE',
          ethnicity: '汉族',
          contactNumber: '13800138000',
          email: 'chenzy@univ.edu.cn',
          teacherEmployeeNumber: null,
          status: 'READY',
          errors: []
        }
      ]
    };

    const onClose = vi.fn();
    render(<StudentBulkImportDialog open={true} onClose={onClose} />);

    // Upload CSV to advance to Preview
    const file = new File(['csv'], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    mockPreviewCsv.mockResolvedValueOnce(mockPreviewData);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('导入数据预览与核验')).toBeDefined();
    });

    // Close button should not be present in header on preview step
    expect(screen.queryByLabelText('关闭')).toBeNull();

    // Click cancel in preview step footer
    const cancelBtn = screen.getByText('取消');
    fireEvent.click(cancelBtn);

    // Confirmation dialog should appear
    expect(screen.getByText('确认放弃当前导入？')).toBeDefined();
    expect(screen.getByText(/您当前已有解析就绪的导入数据/)).toBeDefined();

    // Click "继续导入" to dismiss warning
    const keepBtn = screen.getByText('继续导入');
    fireEvent.click(keepBtn);
    await waitFor(() => {
      expect(screen.queryByText('确认放弃当前导入？')).toBeNull();
    });
    expect(onClose).not.toHaveBeenCalled();

    // Click cancel again and confirm discard
    fireEvent.click(screen.getByText('取消'));
    const confirmDiscardBtn = screen.getByText('确认放弃');
    fireEvent.click(confirmDiscardBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

