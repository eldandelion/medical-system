import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentDetailsView } from './StudentDetailsView';
import { Student } from '../../types';

const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

const mockOpenCreation = vi.fn();
const mockCloseCreation = vi.fn();
vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    openCreation: mockOpenCreation,
    closeCreation: mockCloseCreation
  })
}));

describe('StudentDetailsView Component', () => {
  let queryClient: QueryClient;

  const mockStudent: Student = {
    id: '1',
    studentNumber: '2021001',
    name: '张伟',
    major: '计算机科学',
    year: '大三',
    status: 'Active',
    riskLevel: 'LOW',
    demographics: {
      age: 21,
      gender: 'MALE',
      ethnicity: '汉族',
      idCardNumber: '110101200301011234',
      contactNumber: '13800138001',
      email: 'zhangwei@univ.edu.cn',
      homeAddress: '北京市海淀区中关村南大街1号',
      emergencyContactName: '张建军',
      emergencyContactPhone: '13900139001',
      school: '中南大学'
    }
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      session: {
        role: 'teacher',
        token: 'mock-teacher-token'
      }
    });

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/students/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStudent)
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders student name and studentNumber in header, avoiding N/A', async () => {
    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    // Student name
    expect(screen.getByText('张伟')).toBeDefined();

    // Student number displayed in header below name
    const studentNumberElements = screen.getAllByText('2021001');
    expect(studentNumberElements.length).toBeGreaterThanOrEqual(1);

    // Header student number should have font-mono styling
    const headerNumberElement = studentNumberElements.find(
      (el) => el.classList.contains('font-mono')
    );
    expect(headerNumberElement).toBeDefined();
    expect(headerNumberElement?.textContent).toBe('2021001');

    // Make sure 'N/A' is not rendered for student number in header
    expect(headerNumberElement?.textContent).not.toBe('N/A');
  });

  it('renders student number in the Overview tab MetricCard', async () => {
    renderWithProviders(<StudentDetailsView student={mockStudent} />);

    // Metric card for student number
    expect(screen.getByText('学号')).toBeDefined();
    const numbers = screen.getAllByText('2021001');
    expect(numbers.length).toBeGreaterThanOrEqual(2); // Header + MetricCard
  });

  it('gracefully falls back to N/A when studentNumber is empty or undefined', async () => {
    const studentWithoutNumber: Student = {
      ...mockStudent,
      studentNumber: ''
    };

    renderWithProviders(<StudentDetailsView student={studentWithoutNumber} />);

    const monoElements = document.querySelectorAll('.font-mono');
    const headerSubtitleNumber = Array.from(monoElements).find(el => el.textContent === 'N/A');
    expect(headerSubtitleNumber).toBeDefined();
  });

  it('supports tab switching when onTabChange callback is provided', async () => {
    const onTabChange = vi.fn();
    renderWithProviders(
      <StudentDetailsView student={mockStudent} onTabChange={onTabChange} />
    );

    const mdTabs = document.querySelector('md-tabs');
    expect(mdTabs).toBeDefined();
    if (mdTabs) {
      (mdTabs as any).activeTabIndex = 1;
      fireEvent(mdTabs, new CustomEvent('change', { bubbles: true }));
      expect(onTabChange).toHaveBeenCalledWith('psychometrics');
    }
  });
});
