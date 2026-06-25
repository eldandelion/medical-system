import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PrimaryButton, SegmentedButton } from './Buttons';

// Clean up the DOM after each test to prevent multiple elements from piling up
afterEach(() => {
  cleanup();
});

// Mock useSidebar hook since Buttons rely on it to determine if they should be compact
vi.mock('../../contexts/SidebarContext', () => ({
  useSidebar: () => ({ isCollapsed: false })
}));

describe('Buttons Component', () => {
  describe('PrimaryButton', () => {
    it('renders the label correctly', () => {
      render(<PrimaryButton label="Submit" />);
      expect(screen.getByText('Submit')).toBeDefined();
    });

    it('triggers onClick when clicked', () => {
      const onClickMock = vi.fn();
      render(<PrimaryButton label="Click Me" onClick={onClickMock} />);
      
      const buttonText = screen.getByText('Click Me');
      fireEvent.click(buttonText);
      
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('passes the disabled prop to the web component', () => {
      render(<PrimaryButton label="Disabled" disabled={true} />);
      const btn = screen.getByText('Disabled').closest('md-filled-button');
      
      // Check the HTML attribute directly since JSDOM doesn't map web component properties
      expect(btn?.hasAttribute('disabled')).toBe(true);
    });
  });

  describe('SegmentedButton', () => {
    it('renders all options', () => {
      const items = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ];
      render(<SegmentedButton items={items} selectedValue="1" onChange={() => {}} />);
      
      expect(screen.getByText('Option 1')).toBeDefined();
      expect(screen.getByText('Option 2')).toBeDefined();
    });

    it('calls onChange with correct value when an option is clicked', () => {
      const items = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ];
      const onChangeMock = vi.fn();
      render(<SegmentedButton items={items} selectedValue="1" onChange={onChangeMock} />);
      
      const option2 = screen.getByText('Option 2');
      fireEvent.click(option2);
      
      expect(onChangeMock).toHaveBeenCalledWith('2');
    });
  });
});
