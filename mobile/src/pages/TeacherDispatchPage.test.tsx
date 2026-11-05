import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TeacherDispatchPage } from './TeacherDispatchPage';
import { intakeApi } from '../api/intakeApi';

const showSnackbarMock = vi.fn();

function simulateInput(element: Element, value: string) {
  act(() => {
    (element as any).value = value;
    fireEvent(element, new Event('input', { bubbles: true, composed: true }));
  });
}

vi.mock('../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({ showSnackbar: showSnackbarMock, hideSnackbar: vi.fn() }),
}));

vi.mock('../api/intakeApi', () => ({
  intakeApi: {
    getAssessmentCatalog: vi.fn(),
    getStaffStudents: vi.fn(),
    assignAssessment: vi.fn(),
  },
}));

describe('TeacherDispatchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (intakeApi.getAssessmentCatalog as any).mockResolvedValue([
      { batteryCode: 'phq9', title: '抑郁量表', questionCount: 9, duration: '5分钟', isEnabled: true },
      { batteryCode: 'gad7', title: '焦虑量表', questionCount: 7, duration: '3分钟', isEnabled: true },
    ]);
    (intakeApi.getStaffStudents as any).mockResolvedValue([
      { id: '101', name: '张三', studentNumber: '2023001', major: '软件工程' },
      { id: '102', name: '李四', studentNumber: '2023002', major: '计算机科学' },
    ]);
    (intakeApi.assignAssessment as any).mockResolvedValue({ id: 1 });
  });

  const renderComponent = () => render(<TeacherDispatchPage />);

  it('loads and renders catalog and students list with MD3 components', async () => {
    renderComponent();

    expect(screen.getByText('加载中…')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/抑郁量表/)).toBeDefined();
      expect(screen.getByText(/焦虑量表/)).toBeDefined();
      expect(screen.getByText(/张三/)).toBeDefined();
      expect(screen.getByText(/李四/)).toBeDefined();
    });

    const radios = document.querySelectorAll('md-radio');
    expect(radios.length).toBe(2);

    const checkboxes = document.querySelectorAll('md-checkbox');
    expect(checkboxes.length).toBe(2);
  });

  it('filters students by search input', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/张三/)).toBeDefined();
    });

    const searchField = document.querySelector('md-outlined-text-field[label="搜索学生"]');
    expect(searchField).toBeDefined();

    simulateInput(searchField!, '李四');

    await waitFor(() => {
      expect(screen.queryByText(/张三/)).toBeNull();
      expect(screen.getByText(/李四/)).toBeDefined();
    });
  });

  it('selects all filtered students when 全选 is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/张三/)).toBeDefined();
    });

    const selectAllBtn = screen.getByText('全选');
    fireEvent.click(selectAllBtn);

    await waitFor(() => {
      expect(screen.getByText('选择学生（已选 2 人）')).toBeDefined();
    });
  });

  it('dispatches assessments in parallel and reports summary', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/张三/)).toBeDefined();
    });

    // Select first student
    const studentLabel = screen.getByText(/张三/).closest('label');
    fireEvent.click(studentLabel!);

    await waitFor(() => {
      expect(screen.getByText('选择学生（已选 1 人）')).toBeDefined();
    });

    const submitBtn = screen.getByText(/发放给 1 名学生/);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(intakeApi.assignAssessment).toHaveBeenCalledWith(101, 'phq9', undefined);
      expect(showSnackbarMock).toHaveBeenCalledWith({
        message: '发放完成：成功 1 人',
      });
    });
  });

  it('handles partial failures gracefully without throwing', async () => {
    (intakeApi.assignAssessment as any).mockImplementation((studentId: number) => {
      if (studentId === 101) return Promise.resolve({ id: 1 });
      return Promise.reject(new Error('Already assigned'));
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/张三/)).toBeDefined();
    });

    fireEvent.click(screen.getByText('全选'));

    const submitBtn = await screen.findByText(/发放给 2 名学生/);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(showSnackbarMock).toHaveBeenCalledWith({
        message: '发放完成：成功 1 人，失败 1 人',
      });
    });
  });
});
