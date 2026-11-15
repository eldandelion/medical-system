import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AssessmentScaleOverviewTab } from './AssessmentScaleOverviewTab';
import { AssessmentCatalogItemDto } from '../../types';

describe('AssessmentScaleOverviewTab', () => {
  const sampleScale: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ_9',
    title: '情绪状况评估 (PHQ-9)',
    subtitle: '抑郁症筛查量表',
    description: '用于评估过去两周内抑郁情绪与兴趣减退情况的标准自评工具。',
    duration: '5 分钟',
    questionCount: 9,
    isEnabled: true,
    sections: [
      {
        id: 'phq9',
        title: '核心抑郁症状',
        subtitle: 'PHQ-9 Section',
        description: '评估过去两周的核心情绪症状。',
        questions: [
          { id: 'phq9_1', text: '做事时提不起劲或没有兴趣', type: 'single_choice' },
          { id: 'phq9_2', text: '感到心情低落、沮丧或绝望', type: 'single_choice' },
        ],
      },
      {
        id: 'phq9_impact',
        title: '功能影响评估',
        subtitle: 'Functional Impairment',
        description: '',
        questions: [
          { id: 'phq9_impact_1', text: '这些问题对您工作或学习造成多大困难？', type: 'single_choice' },
        ],
      },
    ],
  };

  afterEach(() => {
    cleanup();
  });

  it('renders scale metadata attributes and available status', () => {
    render(<AssessmentScaleOverviewTab scale={sampleScale} />);

    expect(screen.getByText('量表信息')).toBeDefined();
    expect(screen.getByText('PHQ_9')).toBeDefined();
    expect(screen.getByText('抑郁症筛查量表')).toBeDefined();
    expect(screen.getByText('9 题')).toBeDefined();
    expect(screen.getByText('5 分钟')).toBeDefined();
    expect(screen.getByText('2 个分部')).toBeDefined();
    expect(screen.getAllByText('正常可用').length).toBeGreaterThan(0);
  });

  it('renders hidden status when isEnabled is false', () => {
    render(
      <AssessmentScaleOverviewTab
        scale={{ ...sampleScale, isEnabled: false }}
      />
    );

    expect(screen.getAllByText('已隐藏').length).toBeGreaterThan(0);
  });

  it('renders scale description and empty fallback when description is missing', () => {
    const { rerender } = render(<AssessmentScaleOverviewTab scale={sampleScale} />);

    expect(screen.getByText('量表说明')).toBeDefined();
    expect(screen.getByText('用于评估过去两周内抑郁情绪与兴趣减退情况的标准自评工具。')).toBeDefined();

    rerender(<AssessmentScaleOverviewTab scale={{ ...sampleScale, description: '' }} />);
    expect(screen.getByText('暂无详细量表描述')).toBeDefined();
  });

  it('renders section summary list and empty state when no sections exist', () => {
    const { rerender } = render(<AssessmentScaleOverviewTab scale={sampleScale} />);

    expect(screen.getByText('分部概览')).toBeDefined();
    expect(screen.getByText('核心抑郁症状')).toBeDefined();
    expect(screen.getByText('PHQ-9 Section')).toBeDefined();
    expect(screen.getByText('2 题')).toBeDefined();
    expect(screen.getByText('功能影响评估')).toBeDefined();
    expect(screen.getByText('1 题')).toBeDefined();

    rerender(<AssessmentScaleOverviewTab scale={{ ...sampleScale, sections: [] }} />);
    expect(screen.getByText('暂无分部结构信息')).toBeDefined();
  });

  it('supports keyboard activation on section summary cards when onSelectSection is provided', () => {
    const onSelectSection = vi.fn();
    render(
      <AssessmentScaleOverviewTab
        scale={sampleScale}
        onSelectSection={onSelectSection}
      />
    );

    const firstSectionBtn = screen.getByText('核心抑郁症状').closest('[role="button"]');
    expect(firstSectionBtn).not.toBeNull();

    fireEvent.keyDown(firstSectionBtn!, { key: 'Enter' });
    fireEvent.keyDown(firstSectionBtn!, { key: ' ' });
    expect(onSelectSection).toHaveBeenCalledTimes(2);
  });
});
