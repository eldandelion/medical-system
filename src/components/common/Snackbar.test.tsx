import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Snackbar } from './Snackbar';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

beforeEach(() => {
  vi.useFakeTimers();
});

describe('Snackbar Component', () => {
  it('does not render when open is false', () => {
    render(<Snackbar open={false} message="Test Message" onClose={() => {}} />);
    expect(screen.queryByText('Test Message')).toBeNull();
  });

  it('renders the message when open is true', () => {
    render(<Snackbar open={true} message="Saved successfully" onClose={() => {}} />);
    expect(screen.getByText('Saved successfully')).toBeDefined();
  });

  it('renders an action button and triggers onAction', () => {
    const onActionMock = vi.fn();
    render(
      <Snackbar 
        open={true} 
        message="Item deleted" 
        actionLabel="Undo" 
        onAction={onActionMock} 
        onClose={() => {}} 
      />
    );
    
    const actionBtn = screen.getByText('Undo');
    fireEvent.click(actionBtn);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  it('automatically triggers onClose after the set duration', () => {
    const onCloseMock = vi.fn();
    render(<Snackbar open={true} message="Timeout test" onClose={onCloseMock} duration={3000} />);
    
    expect(onCloseMock).not.toHaveBeenCalled();
    
    // Fast-forward the system time by 3000ms to simulate waiting
    vi.advanceTimersByTime(3000);
    
    // Now the automatic timeout should have triggered onClose
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
