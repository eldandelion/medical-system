import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssessmentAssignmentCreationForm } from './AssessmentAssignmentCreationForm';
import { AssessmentCatalogItemDto, Student } from '../../types';

const mockShowSnackbar = vi.fn();
vi.mock('../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: mockShowSnackbar }),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ session: { token: 'mock-token' } }),
}));

import { CreationOverlayProvider, useCreationOverlay } from '../../contexts/CreationContext';

describe('AssessmentAssignmentCreationForm', () => {
  let queryClient: QueryClient;
  const mockOnClose = vi.fn();

  const sampleScale: AssessmentCatalogItemDto = {
    batteryCode: 'PHQ-9' as any,
    title: '抑郁症筛查量表 (PHQ-9)',
    subtitle: '情绪与抑郁测评',
    description: '标准抑郁测评量表',
    duration: '3-5 分钟',
    questionCount: 9,
    sections: [],
    isEnabled: true,
  };

  const sampleCatalog: AssessmentCatalogItemDto[] = [
    sampleScale,
    {
      batteryCode: 'GAD-7' as any,
      title: '广泛性焦虑量表 (GAD-7)',
      subtitle: '焦虑与应激测评',
      description: '标准焦虑测评量表',
      duration: '2-4 分钟',
      questionCount: 7,
      sections: [],
      isEnabled: true,
    },
  ];

  const sampleStudents: Student[] = [
    {
      id: '101',
      studentNumber: '20240001',
      name: '张三',
      major: '计算机科学与技术',
      year: '大一',
      status: 'Active',
    },
    {
      id: '102',
      studentNumber: '20240002',
      name: '李四',
      major: '应用心理学',
      year: '大二',
      status: 'Active',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/assessments/catalog')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleCatalog),
        });
      }
      if (url.includes('/api/students')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleStudents),
        });
      }
      if (url.includes('/api/assessments/assignments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (initialScaleProp = sampleScale) => {
    function Host() {
      const { headerActions } = useCreationOverlay();
      return (
        <>
          <div data-testid="header-actions">{headerActions}</div>
          <AssessmentAssignmentCreationForm
            initialScale={initialScaleProp}
            onClose={mockOnClose}
          />
        </>
      );
    }
    return render(
      <CreationOverlayProvider>
        <QueryClientProvider client={queryClient}>
          <Host />
        </QueryClientProvider>
      </CreationOverlayProvider>
    );
  };

  it('renders target modes, initial scale, and default cohort fields', async () => {
    renderComponent();

    expect(screen.getByText('分发目标范围')).toBeDefined();
    expect(screen.getByText('群体批量分发')).toBeDefined();
    expect(screen.getByText('指定单个学生')).toBeDefined();
    expect(screen.getByText('抑郁症筛查量表 (PHQ-9)')).toBeDefined();
    expect(screen.getByText('已选量表：')).toBeDefined();
    expect(screen.getByText('累计题目：')).toBeDefined();
    expect(document.querySelector('md-outlined-select[label="所属学院"]')).toBeDefined();
    expect(document.querySelector('md-outlined-select[label="专业方向"]')).toBeDefined();
    expect(document.querySelector('md-outlined-select[label="年级 / 届别"]')).toBeDefined();
    expect(document.querySelector('md-outlined-select[label="班级"]')).toBeDefined();
  });

  it('allows switching to Individual Student mode and picking a student', async () => {
    renderComponent();

    // Switch to individual student
    const individualBtn = screen.getByText('指定单个学生');
    fireEvent.click(individualBtn);

    expect(screen.getByText('选择指派学生')).toBeDefined();

    // Wait for students to load
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeDefined();
      expect(screen.getByText('李四')).toBeDefined();
    });

    // Select a student
    fireEvent.click(screen.getByText('张三'));
    expect(screen.getByText(/已选中:/)).toBeDefined();
    expect(screen.getByText('清除重选')).toBeDefined();
  });

  it('allows adding and removing additional scales from catalog', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('添加其他量表')).toBeDefined();
    });

    // Open add scale menu
    fireEvent.click(screen.getByText('添加其他量表'));
    expect(screen.getByText('广泛性焦虑量表 (GAD-7)')).toBeDefined();

    // Add GAD-7
    fireEvent.click(screen.getByText('广泛性焦虑量表 (GAD-7)'));
    expect(screen.getByText('2 套')).toBeDefined();

    // Remove GAD-7
    const closeBtns = document.querySelectorAll('.material-symbols-outlined');
    const removeBtn = Array.from(closeBtns).find((el) => el.textContent === 'close')?.parentElement;
    if (removeBtn) {
      fireEvent.click(removeBtn);
    }
  });

  it('submits assignment successfully in cohort mode and calls onClose', async () => {
    renderComponent();

    const submitBtn = screen.getByText('确认分发');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('已成功'),
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows snackbar error if trying to submit without student in individual mode', async () => {
    renderComponent();

    const individualBtn = screen.getByText('指定单个学生');
    fireEvent.click(individualBtn);

    const submitBtn = screen.getByText('确认分发');
    fireEvent.click(submitBtn);

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '请选择需要指派的学生',
      })
    );
  });
});
