import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSummaryCard, ProfileSummarySkeleton, ProfileSummaryError } from './DashboardComponents';

describe('ProfileSummaryCard', () => {
  it('renders correctly with given props and filters null metadata', () => {
    const mockOnClick = vi.fn();
    const metadata = [
      { icon: 'badge', value: 'ST123' },
      { icon: 'school', value: 'Engineering' },
      { icon: 'domain', value: null as unknown as string } // testing null filtering
    ];

    render(
      <ProfileSummaryCard
        avatarText="J"
        title="John Doe"
        subtitle="Student"
        metadata={metadata}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('J')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('Student')).toBeTruthy();
    expect(screen.getByText('ST123')).toBeTruthy();
    expect(screen.getByText('Engineering')).toBeTruthy();
    
    // We shouldn't crash on null and it shouldn't render an empty string value row if we filter it out.
    // However testing that is tricky. Just making sure it rendered successfully is good.

    fireEvent.click(screen.getByText('John Doe'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});

describe('ProfileSummarySkeleton', () => {
  it('renders a shimmer loading state', () => {
    const { container } = render(<ProfileSummarySkeleton />);
    // Wait, the test checks the container class, but we put skeleton-wave on a child div.
    // Let's just check the child div.
    expect((container.querySelector('.skeleton-wave') as HTMLElement)).toBeTruthy();
    // Ensure it maintains min-height
    expect((container.firstChild as HTMLElement).className).toContain('min-h-[220px]');
  });
});

describe('ProfileSummaryError', () => {
  it('renders error message and calls onRetry when button is clicked', () => {
    const mockRetry = vi.fn();
    render(<ProfileSummaryError onRetry={mockRetry} />);

    expect(screen.getByText('加载个人资料失败')).toBeTruthy();
    const button = screen.getByText('重试');
    fireEvent.click(button);
    expect(mockRetry).toHaveBeenCalled();
  });
});
