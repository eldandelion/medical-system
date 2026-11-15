import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HideScaleConfirmationDialog } from './HideScaleConfirmationDialog';
import { AssessmentCatalogItemDto } from '../../types';

describe('HideScaleConfirmationDialog', () => {
  const sampleScale: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ-9',
    title: '抑郁症筛查量表 (PHQ-9)',
    subtitle: '情绪与抑郁测评',
    description: '用于评估过去两周内抑郁情绪与兴趣减退情况的标准自评工具。',
    duration: '3-5 分钟',
    questionCount: 9,
    sections: [],
    isEnabled: true,
  };

  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('does not render dialog contents when closed', () => {
    render(
      <HideScaleConfirmationDialog
        scale={null}
        isOpen={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('确认隐藏测评量表？')).toBeNull();
  });

  it('renders scale summary details when open', () => {
    render(
      <HideScaleConfirmationDialog
        scale={sampleScale}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('确认隐藏测评量表？')).toBeDefined();
    expect(screen.getByText('抑郁症筛查量表 (PHQ-9)')).toBeDefined();
    expect(screen.getByText('PHQ-9')).toBeDefined();
    expect(screen.getByText('9 题')).toBeDefined();
    expect(screen.getByText('3-5 分钟')).toBeDefined();
    expect(screen.getByText('情绪与抑郁测评')).toBeDefined();
  });

  it('expands compliance consequences when clicking 查看操作影响与合规说明', () => {
    render(
      <HideScaleConfirmationDialog
        scale={sampleScale}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('目录隐藏与分发暂停')).toBeNull();
    const toggleBtn = screen.getByRole('button', { name: /查看操作影响与合规说明/ });
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggleBtn);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

    expect(screen.getByText('目录隐藏与分发暂停')).toBeDefined();
    expect(screen.getByText('在途问卷有效完成')).toBeDefined();
    expect(screen.getByText('历史档案完整保留')).toBeDefined();
    expect(screen.getByText('随时恢复上线')).toBeDefined();
  });

  it('fires onCancel and onConfirm callbacks', () => {
    render(
      <HideScaleConfirmationDialog
        scale={sampleScale}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('取消'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('确认隐藏'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables action buttons when isSubmitting is true', () => {
    render(
      <HideScaleConfirmationDialog
        scale={sampleScale}
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const cancelBtn = screen.getByText('取消').closest('md-text-button');
    const confirmBtn = screen.getByText('确认隐藏').closest('md-text-button');
    expect(cancelBtn?.hasAttribute('disabled')).toBe(true);
    expect(confirmBtn?.hasAttribute('disabled')).toBe(true);
  });
});
