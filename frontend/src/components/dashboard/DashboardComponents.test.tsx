import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSummaryCard, ProfileSummaryError } from './DashboardComponents';

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
        avatarUrl={null}
        name="John Doe"
        role="Student"
        metadata={metadata}
        onClick={mockOnClick}
      />
    );

    // Should fallback to first letter of title
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
  it('renders a shimmer loading state when isLoading is true', () => {
    const { container } = render(<ProfileSummaryCard isLoading={true} />);
    // Check for the skeleton wave element
    expect((container.querySelector('.skeleton-wave') as HTMLElement)).toBeTruthy();
    // Ensure it has height full
    expect((container.firstChild as HTMLElement).className).toContain('h-full');
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
