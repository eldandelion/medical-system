import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
});
