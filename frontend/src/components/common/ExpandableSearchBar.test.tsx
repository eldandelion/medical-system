import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ExpandableSearchBar } from './ExpandableSearchBar';

afterEach(() => {
  cleanup();
});

describe('ExpandableSearchBar Component', () => {
  it('renders in collapsed state by default with a search button', () => {
    render(<ExpandableSearchBar value="" onChange={() => {}} />);

    const button = screen.getByRole('button', { name: '展开搜索' });
    expect(button).toBeDefined();
    expect(screen.queryByPlaceholderText('搜索学生...')).toBeNull();
  });

  it('expands on click and auto-focuses the text input', () => {
    render(<ExpandableSearchBar value="" onChange={() => {}} placeholder="搜索全校学生..." />);

    const button = screen.getByRole('button', { name: '展开搜索' });
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('搜索全校学生...');
    expect(input).toBeDefined();
    expect(document.activeElement).toBe(input);
  });

  it('calls onChange when user types in the input', () => {
    const onChangeMock = vi.fn();
    render(<ExpandableSearchBar value="" onChange={onChangeMock} />);

    // Expand
    fireEvent.click(screen.getByRole('button', { name: '展开搜索' }));

    const input = screen.getByPlaceholderText('搜索学生...');
    fireEvent.change(input, { target: { value: '张三' } });

    expect(onChangeMock).toHaveBeenCalledWith('张三');
  });

  it('clears query when cancel button is clicked while text is present', () => {
    const onChangeMock = vi.fn();
    render(<ExpandableSearchBar value="张三" onChange={onChangeMock} />);

    // Already expanded since value is non-empty
    const clearButton = screen.getByRole('button', { name: '清除搜索' });
    fireEvent.click(clearButton);

    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('collapses search bar when cancel button is clicked while query is empty', () => {
    render(<ExpandableSearchBar value="" onChange={() => {}} />);

    // Expand first
    fireEvent.click(screen.getByRole('button', { name: '展开搜索' }));
    expect(screen.getByPlaceholderText('搜索学生...')).toBeDefined();

    // Click close/cancel button
    const closeButton = screen.getByRole('button', { name: '收起搜索' });
    fireEvent.click(closeButton);

    // Should be collapsed back
    expect(screen.queryByPlaceholderText('搜索学生...')).toBeNull();
    expect(screen.getByRole('button', { name: '展开搜索' })).toBeDefined();
  });

  it('clears text on Escape key press when query exists', () => {
    const onChangeMock = vi.fn();
    render(<ExpandableSearchBar value="李四" onChange={onChangeMock} />);

    const input = screen.getByPlaceholderText('搜索学生...');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('collapses on Escape key press when query is empty', () => {
    render(<ExpandableSearchBar value="" onChange={() => {}} />);

    // Expand
    fireEvent.click(screen.getByRole('button', { name: '展开搜索' }));
    const input = screen.getByPlaceholderText('搜索学生...');

    // Escape with empty value
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByPlaceholderText('搜索学生...')).toBeNull();
  });

  it('collapses on click outside when search query is empty', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <ExpandableSearchBar value="" onChange={() => {}} />
      </div>
    );

    // Expand
    fireEvent.click(screen.getByRole('button', { name: '展开搜索' }));
    expect(screen.getByPlaceholderText('搜索学生...')).toBeDefined();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));

    expect(screen.queryByPlaceholderText('搜索学生...')).toBeNull();
  });

  it('stays expanded on click outside when search query has content', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <ExpandableSearchBar value="王五" onChange={() => {}} />
      </div>
    );

    expect(screen.getByPlaceholderText('搜索学生...')).toBeDefined();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));

    // Still expanded to preserve query context
    expect(screen.getByPlaceholderText('搜索学生...')).toBeDefined();
  });
});
