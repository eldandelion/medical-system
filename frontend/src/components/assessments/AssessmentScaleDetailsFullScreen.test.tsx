import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AssessmentScaleDetailsFullScreen } from './AssessmentScaleDetailsFullScreen';
import { AssessmentCatalogItemDto } from '../../types';

afterEach(() => {
  cleanup();
});

describe('AssessmentScaleDetailsFullScreen Component', () => {
  const sampleScale: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ-9' as any,
    title: '抑郁症筛查量表 (PHQ-9)',
    subtitle: '情绪与抑郁测评',
    description: '用于评估过去两周内抑郁情绪的标准量表。',
    duration: '3-5 分钟',
    questionCount: 9,
    sections: [],
    isEnabled: true,
  };

  it('does not render when isOpen is false and scale is null', () => {
    const { container } = render(
      <AssessmentScaleDetailsFullScreen isOpen={false} onClose={() => {}} scale={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders scale metadata and empty placeholder when open', () => {
    render(
      <AssessmentScaleDetailsFullScreen
        isOpen={true}
        onClose={() => {}}
        scale={sampleScale}
      />
    );

    expect(screen.getAllByText('抑郁症筛查量表 (PHQ-9)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('情绪与抑郁测评').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PHQ-9').length).toBeGreaterThan(0);
    expect(screen.getByText('用于评估过去两周内抑郁情绪的标准量表。')).toBeDefined();
    expect(screen.getByText('量表题目明细与临床常模配置')).toBeDefined();
    expect(screen.getByText('正常可用')).toBeDefined();
    expect(screen.getByText('9 题')).toBeDefined();
    expect(screen.getByText('3-5 分钟')).toBeDefined();
  });

  it('triggers onClose when back button or action button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <AssessmentScaleDetailsFullScreen
        isOpen={true}
        onClose={onCloseMock}
        scale={sampleScale}
      />
    );

    // Back button
    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    }

    // Action button
    const actionBtn = screen.getByText('完成并返回');
    fireEvent.click(actionBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
