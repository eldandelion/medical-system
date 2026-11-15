import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { AssessmentScaleQuestionsTab } from './AssessmentScaleQuestionsTab';
import { AssessmentCatalogItemDto } from '../../types';

describe('AssessmentScaleQuestionsTab', () => {
  const sampleScale: AssessmentCatalogItemDto = {
    batteryCode: 'MIXED_SCALE',
    title: '综合测试量表',
    subtitle: '多题型示例',
    description: '包含单选、多选、滑块、数值、文本与日期题型。',
    duration: '10 分钟',
    questionCount: 4,
    isEnabled: true,
    sections: [
      {
        id: 'sec_1',
        title: '第一部分：情绪与行为',
        subtitle: 'Section 1',
        description: '请根据最近两周情况作答',
        questions: [
          {
            id: 'q1',
            orderNum: 1,
            text: '感到心情低落或绝望',
            type: 'single_choice',
            options: [
              { value: 0, label: '完全不会' },
              { value: 1, label: '好几天' },
            ],
          },
          {
            id: 'q2',
            orderNum: 2,
            text: '过去一周睡眠质量评分',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            unit: '分',
            minLabel: '极差',
            maxLabel: '极佳',
          },
        ],
      },
      {
        id: 'sec_2',
        title: '第二部分：补充背景',
        subtitle: 'Section 2',
        description: '',
        questions: [
          {
            id: 'q3',
            orderNum: 1,
            text: '您的出生日期',
            type: 'date',
            placeholder: 'YYYY-MM-DD',
          },
          {
            id: 'q4',
            orderNum: 2,
            text: '最近关注的压力事件',
            type: 'multiple_choice',
            options: [
              { value: 'study', label: '学业压力' },
              { value: 'other', label: '其他', hasTextInput: true, textInputPlaceholder: '请说明' },
            ],
          },
        ],
      },
    ],
  };

  afterEach(() => {
    cleanup();
  });

  it('expands only the first section by default and keeps subsequent sections collapsed', () => {
    render(<AssessmentScaleQuestionsTab scale={sampleScale} />);

    expect(screen.getByText('第一部分：情绪与行为')).toBeDefined();
    expect(screen.getByText('第二部分：补充背景')).toBeDefined();

    // First section questions are visible
    expect(screen.getByText('感到心情低落或绝望')).toBeDefined();
    expect(screen.getByText('过去一周睡眠质量评分')).toBeDefined();

    // Second section questions are collapsed and not mounted
    expect(screen.queryByText('您的出生日期')).toBeNull();
    expect(screen.queryByText('最近关注的压力事件')).toBeNull();
  });

  it('toggles a section when its header is clicked', () => {
    render(<AssessmentScaleQuestionsTab scale={sampleScale} />);

    // Expand second section
    fireEvent.click(screen.getByText('第二部分：补充背景'));
    expect(screen.getByText('您的出生日期')).toBeDefined();
    expect(screen.getByText('最近关注的压力事件')).toBeDefined();

    // Collapse first section
    fireEvent.click(screen.getByText('第一部分：情绪与行为'));
    expect(screen.queryByText('感到心情低落或绝望')).toBeNull();
  });

  it('supports expand-all and collapse-all actions', () => {
    render(<AssessmentScaleQuestionsTab scale={sampleScale} />);

    fireEvent.click(screen.getByText('全部展开'));
    expect(screen.getByText('感到心情低落或绝望')).toBeDefined();
    expect(screen.getByText('您的出生日期')).toBeDefined();

    fireEvent.click(screen.getByText('全部收起'));
    expect(screen.queryByText('感到心情低落或绝望')).toBeNull();
    expect(screen.queryByText('您的出生日期')).toBeNull();
  });

  it('renders question type badges, options, range/units, and placeholder previews', () => {
    render(<AssessmentScaleQuestionsTab scale={sampleScale} />);
    fireEvent.click(screen.getByText('全部展开'));

    expect(screen.getByText('单选题')).toBeDefined();
    expect(screen.getByText('滑块评分')).toBeDefined();
    expect(screen.getByText('日期选择')).toBeDefined();
    expect(screen.getByText('多选题')).toBeDefined();

    expect(screen.getByText(/完全不会/)).toBeDefined();
    expect(screen.getByText(/好几天/)).toBeDefined();
    expect(screen.getByText(/0 ~ 10 分/)).toBeDefined();
    expect(screen.getByText(/YYYY-MM-DD/)).toBeDefined();
    expect(screen.getByText(/学业压力/)).toBeDefined();
  });

  it('handles empty or missing sections and options gracefully', () => {
    const emptyScale: AssessmentCatalogItemDto = {
      ...sampleScale,
      questionCount: 0,
      sections: [],
    };
    render(<AssessmentScaleQuestionsTab scale={emptyScale} />);
    expect(screen.getByText('暂无量表题目明细')).toBeDefined();
  });

  it('resets expanded section state when scale batteryCode changes', () => {
    const { rerender } = render(<AssessmentScaleQuestionsTab scale={sampleScale} />);
    fireEvent.click(screen.getByText('全部展开'));
    expect(screen.getByText('您的出生日期')).toBeDefined();

    const anotherScale: AssessmentCatalogItemDto = {
      ...sampleScale,
      batteryCode: 'ANOTHER_SCALE',
      sections: [
        {
          id: 'other_1',
          title: '新量表分部一',
          subtitle: '',
          description: '',
          questions: [{ id: 'oq1', text: '新量表第一题', type: 'text' }],
        },
        {
          id: 'other_2',
          title: '新量表分部二',
          subtitle: '',
          description: '',
          questions: [{ id: 'oq2', text: '新量表第二题', type: 'text' }],
        },
      ],
    };

    rerender(<AssessmentScaleQuestionsTab scale={anotherScale} />);
    expect(screen.getByText('新量表第一题')).toBeDefined();
    expect(screen.queryByText('新量表第二题')).toBeNull();
  });
});
