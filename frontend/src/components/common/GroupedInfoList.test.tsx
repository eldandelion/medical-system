import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { GroupedInfoList, getGroupedItemCornerRadius, GroupedInfoItemProps } from './GroupedInfoList';

describe('GroupedInfoList & getGroupedItemCornerRadius', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('getGroupedItemCornerRadius', () => {
    it('returns fully rounded capsule for single item', () => {
      expect(getGroupedItemCornerRadius(0, 1)).toBe('rounded-[20px]');
      expect(getGroupedItemCornerRadius(0, 0)).toBe('rounded-[20px]');
    });

    it('returns top capsule for first item when multiple items', () => {
      expect(getGroupedItemCornerRadius(0, 3)).toBe('rounded-t-[20px] rounded-b-[4px]');
    });

    it('returns middle subtle radius for middle items', () => {
      expect(getGroupedItemCornerRadius(1, 3)).toBe('rounded-[4px]');
      expect(getGroupedItemCornerRadius(2, 5)).toBe('rounded-[4px]');
    });

    it('returns bottom capsule for last item when multiple items', () => {
      expect(getGroupedItemCornerRadius(2, 3)).toBe('rounded-t-[4px] rounded-b-[20px]');
      expect(getGroupedItemCornerRadius(4, 5)).toBe('rounded-t-[4px] rounded-b-[20px]');
    });
  });

  describe('GroupedInfoList Component', () => {
    const mockItems: GroupedInfoItemProps[] = [
      { id: 'gender', icon: 'wc', label: '性别', value: '男' },
      { id: 'age', icon: 'cake', label: '年龄', value: '20' },
      { id: 'major', icon: 'school', label: '就读专业', value: '计算机科学与技术' },
    ];

    it('renders all items with labels, values, and icons', () => {
      render(<GroupedInfoList items={mockItems} />);

      expect(screen.getByText('性别')).toBeDefined();
      expect(screen.getByText('男')).toBeDefined();
      expect(screen.getByText('wc')).toBeDefined();

      expect(screen.getByText('年龄')).toBeDefined();
      expect(screen.getByText('20')).toBeDefined();
      expect(screen.getByText('cake')).toBeDefined();

      expect(screen.getByText('就读专业')).toBeDefined();
      expect(screen.getByText('计算机科学与技术')).toBeDefined();
      expect(screen.getByText('school')).toBeDefined();
    });

    it('applies the adaptive corner radius to each row', () => {
      const { container } = render(<GroupedInfoList items={mockItems} />);
      const rows = container.querySelectorAll('.grouped-info-row');

      expect(rows.length).toBe(3);
      expect(rows[0].className).toContain('rounded-t-[20px] rounded-b-[4px]');
      expect(rows[1].className).toContain('rounded-[4px]');
      expect(rows[2].className).toContain('rounded-t-[4px] rounded-b-[20px]');
    });

    it('renders a fallback when value is empty or null', () => {
      const emptyItems: GroupedInfoItemProps[] = [
        { id: 'phone', label: '联系电话', value: null },
      ];
      render(<GroupedInfoList items={emptyItems} fallbackText="未登记" />);

      expect(screen.getByText('未登记')).toBeDefined();
    });

    it('handles clipboard copy when copyable is true', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const copyableItems: GroupedInfoItemProps[] = [
        { id: 'idCard', icon: 'badge', label: '身份证号', value: '110101199001011234', copyable: true },
      ];

      render(<GroupedInfoList items={copyableItems} />);

      const copyBtn = screen.getByRole('button', { name: '复制身份证号' });
      expect(copyBtn).toBeDefined();

      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith('110101199001011234');
      await waitFor(() => {
        expect(screen.getByText('已复制到剪贴板')).toBeDefined();
      });
    });

    it('gracefully handles clipboard write failure without throwing or false success', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard permission denied'));
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const copyableItems: GroupedInfoItemProps[] = [
        { id: 'phone', icon: 'phone', label: '联系电话', value: '13800000000', copyable: true },
      ];

      render(<GroupedInfoList items={copyableItems} />);

      const copyBtn = screen.getByRole('button', { name: '复制联系电话' });
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith('13800000000');
      // Snackbar should NOT appear when write fails
      expect(screen.queryByText('已复制到剪贴板')).toBeNull();
    });

    it('supports custom copyValue different from rendered value', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const copyableItems: GroupedInfoItemProps[] = [
        {
          id: 'emergency',
          icon: 'contact_emergency',
          label: '紧急联系人',
          value: '张三 (13800000000)',
          copyable: true,
          copyValue: '13800000000',
        },
      ];

      render(<GroupedInfoList items={copyableItems} />);
      const copyBtn = screen.getByRole('button', { name: '复制紧急联系人' });
      fireEvent.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith('13800000000');
    });

    it('renders custom trailing elements', () => {
      const itemsWithTrailing: GroupedInfoItemProps[] = [
        {
          id: 'status',
          label: '档案状态',
          value: '正常',
          trailing: <span data-testid="custom-trailing">已核验</span>,
        },
      ];

      render(<GroupedInfoList items={itemsWithTrailing} />);
      expect(screen.getByTestId('custom-trailing')).toBeDefined();
      expect(screen.getByText('已核验')).toBeDefined();
    });

    it('defaults to stacked layout with label on top and value underneath', () => {
      const { container } = render(<GroupedInfoList items={mockItems} />);
      const firstRow = container.querySelector('.grouped-info-row');
      expect(firstRow).toBeDefined();
      expect(firstRow?.querySelector('.text-sm')?.textContent).toBe('性别');
      expect(firstRow?.querySelector('.text-xs')?.textContent).toBe('男');
    });

    it('supports horizontal layout when layout="horizontal" is specified', () => {
      render(<GroupedInfoList items={mockItems} layout="horizontal" />);
      expect(screen.getByText('性别')).toBeDefined();
      expect(screen.getByText('男')).toBeDefined();
    });
  });
});
