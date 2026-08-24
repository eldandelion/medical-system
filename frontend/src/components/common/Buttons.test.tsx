import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PrimaryButton, SecondaryButton, TertiaryButton, TertiaryFab, SegmentedButton, OutlinedButton, FilledTonalButton } from './Buttons';

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
    
    it('renders with icon', () => {
      render(<PrimaryButton label="Icon Btn" icon="home" />);
      expect(screen.getByText('Icon Btn')).toBeDefined();
    });
  });
  
  describe('SecondaryButton', () => {
    it('renders correctly', () => {
      render(<SecondaryButton label="Secondary" />);
      expect(screen.getByText('Secondary')).toBeDefined();
    });

    it('triggers onClick when clicked', () => {
      const onClickMock = vi.fn();
      render(<SecondaryButton label="Click Me" onClick={onClickMock} />);
      fireEvent.click(screen.getByText('Click Me'));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
    
    it('renders with icon and trailing icon support', () => {
      render(<SecondaryButton label="Icon Btn" icon="add" trailingIcon={true} />);
      expect(screen.getByText('Icon Btn')).toBeDefined();
      const btn = screen.getByText('Icon Btn').closest('md-filled-tonal-button');
      expect(btn).toBeDefined();
      expect(btn?.hasAttribute('trailing-icon')).toBe(true);
    });
  });

  describe('OutlinedButton', () => {
    it('renders md-outlined-button correctly', () => {
      render(<OutlinedButton label="Outlined Action" />);
      expect(screen.getByText('Outlined Action')).toBeDefined();
      const btn = screen.getByText('Outlined Action').closest('md-outlined-button');
      expect(btn).toBeDefined();
    });
  });

  describe('FilledTonalButton', () => {
    it('renders filled tonal button correctly', () => {
      render(<FilledTonalButton label="Tonal Action" />);
      expect(screen.getByText('Tonal Action')).toBeDefined();
      const btn = screen.getByText('Tonal Action').closest('md-filled-tonal-button');
      expect(btn).toBeDefined();
    });
  });

  describe('TertiaryButton', () => {
    it('renders correctly', () => {
      render(<TertiaryButton label="Tertiary" />);
      expect(screen.getByText('Tertiary')).toBeDefined();
    });

    it('triggers onClick when clicked', () => {
      const onClickMock = vi.fn();
      render(<TertiaryButton label="Click Me" onClick={onClickMock} />);
      fireEvent.click(screen.getByText('Click Me'));
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
    
    it('renders with icon', () => {
      render(<TertiaryButton label="Icon Btn" icon="info" />);
      expect(screen.getByText('Icon Btn')).toBeDefined();
    });
  });

  describe('TertiaryFab', () => {
    it('renders correctly', () => {
      render(<TertiaryFab label="FAB" icon="add" />);
      const fab = document.querySelector('md-fab');
      expect(fab).toBeDefined();
    });

    it('triggers onClick when clicked', () => {
      const onClickMock = vi.fn();
      render(<TertiaryFab label="Click Me" onClick={onClickMock} icon="add" />);
      const fab = document.querySelector('md-fab');
      if (fab) {
         fireEvent.click(fab);
      }
      expect(onClickMock).toHaveBeenCalledTimes(1);
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
