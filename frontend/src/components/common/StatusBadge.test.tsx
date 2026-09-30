import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders label and status dot', () => {
    const { container } = render(
      <StatusBadge label="已批准" dotColorClass="bg-[var(--md-sys-color-primary-container)]" />
    );

    expect(screen.getByText('已批准')).toBeDefined();
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('border');
    expect(badge?.className).toContain('bg-transparent');
    expect(badge?.className).toContain('text-[var(--md-sys-color-on-surface)]');

    const dot = container.querySelector('span > span:first-child');
    expect(dot?.className).toContain('rounded-full');
    expect(dot?.className).toContain('bg-[var(--md-sys-color-primary-container)]');
  });

  it('supports children as content', () => {
    render(
      <StatusBadge dotColorClass="bg-red-500">
        <span>Custom Content</span>
      </StatusBadge>
    );

    expect(screen.getByText('Custom Content')).toBeDefined();
  });

  it('supports title attribute', () => {
    const { container } = render(
      <StatusBadge label="待处理" dotColorClass="bg-yellow-500" title="提示信息" />
    );

    const badge = container.querySelector('span');
    expect(badge?.getAttribute('title')).toBe('提示信息');
  });
});
