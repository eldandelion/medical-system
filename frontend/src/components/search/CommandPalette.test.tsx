import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalSearchProvider, useGlobalSearch } from '../../contexts/GlobalSearchContext';
import { NavigationProvider } from '../../contexts/NavigationContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AuthContext, Role } from '../../contexts/AuthContext';
import { CommandPalette } from './CommandPalette';

function renderCommandPalette(role: Role = 'teacher', defaultOpen: boolean = true) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const mockAuthContext = {
    session: {
      role,
      token: `mock-${role}-token`,
      isAuthenticated: true,
    },
    setRole: vi.fn(),
    logout: vi.fn(),
  };

  function TestTrigger() {
    const { openSearch } = useGlobalSearch();
    React.useEffect(() => {
      if (defaultOpen) {
        openSearch();
      }
    }, [openSearch]);
    return null;
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext as any}>
          <NavigationProvider>
            <GlobalSearchProvider>
              <TestTrigger />
              <CommandPalette />
            </GlobalSearchProvider>
          </NavigationProvider>
        </AuthContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('CommandPalette Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders command palette when opened with input and default action sections', () => {
    renderCommandPalette('teacher', true);

    expect(screen.getByPlaceholderText(/搜索学生、转诊记录/i)).toBeDefined();
    expect(screen.getAllByText('快捷操作').length).toBeGreaterThan(0);
    expect(screen.getAllByText('系统导航').length).toBeGreaterThan(0);
  });

  it('shows "发起转诊" action for Teacher role but hides it for Student role', () => {
    renderCommandPalette('teacher', true);
    expect(screen.getByText('发起转诊')).toBeDefined();

    cleanup();
    document.body.innerHTML = '';

    renderCommandPalette('student', true);
    expect(screen.queryByText('发起转诊')).toBeNull();
    expect(screen.getByText('自我测评')).toBeDefined();
  });

  it('closes dialog when Escape key is pressed', async () => {
    renderCommandPalette('teacher', true);

    const input = screen.getByPlaceholderText(/搜索学生、转诊记录/i);
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/搜索学生、转诊记录/i)).toBeNull();
    });
  });

  it('filters actions when typing in the search box', () => {
    renderCommandPalette('teacher', true);

    const input = screen.getByPlaceholderText(/搜索学生、转诊记录/i);
    fireEvent.change(input, { target: { value: '深色' } });

    expect(screen.getByText('切换为深色模式')).toBeDefined();
    expect(screen.queryByText('切换为浅色模式')).toBeNull();
  });

  it('navigates with ArrowDown and ArrowUp keys without errors', () => {
    renderCommandPalette('teacher', true);

    const input = screen.getByPlaceholderText(/搜索学生、转诊记录/i);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input).toBeDefined();
  });

  it('selects an action item on click and triggers navigation and closing', async () => {
    renderCommandPalette('teacher', true);

    const referralAction = screen.getByText('发起转诊');
    fireEvent.click(referralAction);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/搜索学生、转诊记录/i)).toBeNull();
    });
  });

  it('closes dialog when backdrop is clicked', async () => {
    renderCommandPalette('teacher', true);

    const backdrop = document.querySelector('.bg-black\\/40');
    expect(backdrop).toBeDefined();
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/搜索学生、转诊记录/i)).toBeNull();
    });
  });

  it('renders empty search state when query has no matches', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ query: 'XYZNotFoundTarget999', students: [], referrals: [], assessments: [] }),
    } as Response);

    renderCommandPalette('teacher', true);

    const input = screen.getByPlaceholderText(/搜索学生、转诊记录/i);
    fireEvent.change(input, { target: { value: 'XYZNotFoundTarget999' } });

    await waitFor(
      () => {
        expect(screen.getByText('未找到相关结果')).toBeDefined();
        expect(screen.getByText('尝试搜索其他学生姓名、学号、转诊主题或量表代码')).toBeDefined();
      },
      { timeout: 2500 }
    );
  });

  it('selects a navigation item on click and triggers navigation and closing', async () => {
    renderCommandPalette('teacher', true);

    const navDashboard = screen.getByText('控制面板');
    fireEvent.click(navDashboard);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/搜索学生、转诊记录/i)).toBeNull();
    });
  });

  it('renders and selects search result entities (students, referrals, assessments)', async () => {
    const mockSearchResults = {
      query: '测试',
      students: [
        {
          id: 101,
          studentNumber: '2026001',
          name: '张三学生',
          majorName: '计算机科学与技术',
          collegeName: '计算机学院',
          enrollmentDate: '2026-09-01',
          riskLevel: 'HIGH' as const,
        },
      ],
      referrals: [
        {
          id: 'ref-101',
          studentId: 101,
          studentName: '张三学生',
          title: '心理情绪异常转诊',
          descriptionSnippet: '情绪低落多日',
          status: 'WAITING_FOR_APPOINTMENT' as const,
          type: 'INITIAL' as const,
          createdAt: '2026-10-01T10:00:00',
          riskLevel: 'HIGH' as const,
        },
      ],
      assessments: [
        {
          id: 'scale-phq9',
          resultType: 'CATALOG',
          batteryCode: 'phq-9',
          title: 'PHQ-9 抑郁症筛查量表',
          subtitle: '标准抑郁症测试',
          duration: '5-10 min',
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockSearchResults,
    } as Response);

    renderCommandPalette('teacher', true);

    const input = screen.getByPlaceholderText(/搜索学生、转诊记录/i);
    fireEvent.change(input, { target: { value: '测试' } });

    await waitFor(
      () => {
        expect(screen.getByText('张三学生')).toBeDefined();
        expect(screen.getByText('心理情绪异常转诊')).toBeDefined();
        expect(screen.getByText('PHQ-9 抑郁症筛查量表')).toBeDefined();
      },
      { timeout: 2000 }
    );

    // Click student entity
    const studentItem = screen.getByText('张三学生');
    fireEvent.click(studentItem);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/搜索学生、转诊记录/i)).toBeNull();
    });
  });
});
