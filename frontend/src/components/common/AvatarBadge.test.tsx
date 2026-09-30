import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AvatarBadge } from './AvatarBadge';

describe('AvatarBadge Component', () => {
  it('renders initial from name', () => {
    render(<AvatarBadge name="张伟" />);
    expect(screen.getByText('张')).toBeDefined();
  });

  it('renders fallback ? when name is missing or empty', () => {
    render(<AvatarBadge name="" />);
    expect(screen.getByText('?')).toBeDefined();
  });

  it('applies default primary-container styling when unselected', () => {
    const { container } = render(<AvatarBadge name="李雷" />);
    const avatar = container.querySelector('div');
    expect(avatar?.className).toContain('bg-[var(--md-sys-color-primary-container)]');
    expect(avatar?.className).toContain('text-[var(--md-sys-color-on-primary-container)]');
  });

  it('applies elevated high-contrast primary styling and ring when isSelected is true', () => {
    const { container } = render(<AvatarBadge name="韩梅梅" isSelected={true} />);
    const avatar = container.querySelector('div');
    expect(avatar?.className).toContain('bg-[var(--md-sys-color-primary)]');
    expect(avatar?.className).toContain('text-[var(--md-sys-color-on-primary)]');
    expect(avatar?.className).toContain('ring-2');
    expect(avatar?.className).toContain('ring-[var(--md-sys-color-surface)]');
    expect(avatar?.className).toContain('shadow-xs');
  });

  it('includes group variant classes for automatic row selection styling', () => {
    const { container } = render(<AvatarBadge name="王芳" />);
    const avatar = container.querySelector('div');
    expect(avatar?.className).toContain('group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:bg-[var(--md-sys-color-primary)]');
    expect(avatar?.className).toContain('group-[.bg-\\[var\\(--md-sys-color-secondary-container\\)\\]]:ring-2');
  });

  it('renders image when avatarUrl is provided', () => {
    render(<AvatarBadge name="Admin" avatarUrl="https://example.com/avatar.jpg" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.jpg');
    expect(img.getAttribute('alt')).toBe('Admin');
  });
});
