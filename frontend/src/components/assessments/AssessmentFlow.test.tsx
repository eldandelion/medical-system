import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssessmentFlow } from './AssessmentFlow';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock matchMedia for testing environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockShowSnackbar = vi.fn();
vi.mock('../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: mockShowSnackbar })
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ session: { token: 'fake-token' } })
}));

vi.mock('../../hooks/useRecordProgress', () => ({
  useRecordProgress: vi.fn()
}));

const mockGetPosition = vi.fn().mockReturnValue({ sectionIdx: 0, questionIdx: 0 });
const mockHasSavedPosition = vi.fn().mockReturnValue(false);
const mockSavePosition = vi.fn();
const mockClearPosition = vi.fn();

vi.mock('../../hooks/useAssessmentPosition', () => ({
  useAssessmentPosition: () => ({
    getPosition: mockGetPosition,
    hasSavedPosition: mockHasSavedPosition,
    savePosition: mockSavePosition,
    clearPosition: mockClearPosition
  })
}));

describe('AssessmentFlow Validation', () => {
  const queryClient = new QueryClient();
  
  const sections: any[] = [
    {
      id: 'sec1',
      code: 's1',
      title: 'Section 1',
      subtitle: 'Sub',
      description: 'Desc',
      orderNum: 1,
      questions: [
        { id: 'q1', text: 'Question 1', orderNum: 1, options: [{ value: 1, label: 'Yes' }] },
        { id: 'q2', text: 'Question 2', orderNum: 2, options: [{ value: 1, label: 'Yes' }] }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('prevents submission when answers are incomplete and shows snackbar', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AssessmentFlow 
          isOpen={true} 
          onClose={vi.fn()} 
          assessmentTitle="Test Assessment" 
          sections={sections} 
        />
      </QueryClientProvider>
    );

    const startButton = screen.getByText('开始评估');
    fireEvent.click(startButton);

    const q2SidebarItem = screen.getByText('2. Question 2');
    fireEvent.click(q2SidebarItem);

    const finishButton = screen.getByText('完成');
    fireEvent.click(finishButton);

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      message: '请先完成所有题目后再提交',
      duration: 3000
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('renders and answers polymorphic question types (text, number with zeroOptionLabel, slider, multiple_choice, hasTextInput)', async () => {
    const polySections: any[] = [
      {
        id: 'poly_sec',
        title: '综合问卷',
        subtitle: '基本信息与生活习惯',
        description: '请如实填写',
        questions: [
          {
            id: 'q_text',
            text: '您的姓名是什么？',
            type: 'text',
            placeholder: '请输入姓名'
          },
          {
            id: 'q_date',
            text: '您的出生日期？',
            type: 'date',
            placeholder: '请选择日期'
          },
          {
            id: 'q_num',
            text: '过去一周饮酒次数？',
            type: 'number',
            min: 0,
            max: 50,
            zeroOptionLabel: '从未喝过酒'
          },
          {
            id: 'q_slider',
            text: '主观幸福感评分',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            minLabel: '非常不幸福',
            maxLabel: '非常幸福'
          },
          {
            id: 'q_multi',
            text: '您平时有哪些减压方式？',
            type: 'multiple_choice',
            options: [
              { value: 'sport', label: '运动' },
              { value: 'other', label: '其他方式', hasTextInput: true, textInputLabel: '请说明其他方式' }
            ]
          }
        ]
      }
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <AssessmentFlow
          isOpen={true}
          onClose={vi.fn()}
          assessmentTitle="综合测评"
          sections={polySections}
        />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('开始评估'));

    const clickNextQuestion = () => {
      const nextButtons = screen.getAllByText('下一题');
      fireEvent.click(nextButtons[nextButtons.length - 1]);
    };

    // 1. Text question
    const textInput = screen.getByTestId('text-input-q_text') as any;
    expect(textInput).toBeDefined();
    textInput.value = '张三';
    fireEvent(textInput, new Event('input', { bubbles: true }));

    clickNextQuestion();

    // 2. Date question
    const dateInput = screen.getByTestId('date-input-q_date') as any;
    expect(dateInput).toBeDefined();
    dateInput.value = '2004-05-12';
    fireEvent(dateInput, new Event('input', { bubbles: true }));

    clickNextQuestion();

    // 3. Number question with zeroOptionLabel
    const numInput = screen.getByTestId('number-input-q_num') as any;
    expect(numInput).toBeDefined();
    const zeroBtn = screen.getByText('从未喝过酒');
    fireEvent.click(zeroBtn);
    expect(numInput.getAttribute('value') ?? String(numInput.value)).toBe('0');

    clickNextQuestion();

    // 4. Slider question
    const sliderInput = screen.getByTestId('slider-input-q_slider') as any;
    expect(sliderInput).toBeDefined();
    sliderInput.value = 8;
    fireEvent(sliderInput, new Event('input', { bubbles: true }));
    expect(screen.getByText('8')).toBeDefined();

    clickNextQuestion();

    // 5. Multiple choice with hasTextInput
    fireEvent.click(screen.getByText('运动'));
    fireEvent.click(screen.getByText('其他方式'));

    const noteInput = screen.getByTestId('option-note-q_multi-other') as any;
    expect(noteInput).toBeDefined();
    noteInput.value = '听音乐与冥想';
    fireEvent(noteInput, new Event('input', { bubbles: true }));

    // Now all 5 questions are answered; clicking 完成 transitions to outro
    fireEvent.click(screen.getByText('完成'));
    expect(await screen.findByText('感谢您的参与')).toBeDefined();
  });
});
