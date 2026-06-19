import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DestructiveButton } from './DestructiveButton';

describe('DestructiveButton', () => {
  it('renders correctly with label and icon', () => {
    const handleClick = vi.fn();
    render(<DestructiveButton label="Delete Item" icon="delete" onClick={handleClick} />);

    const buttonElement = screen.getByText('Delete Item');
    expect(buttonElement).toBeDefined();

    // Verify onClick works
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
