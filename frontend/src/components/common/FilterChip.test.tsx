import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FilterChip, FilterChipSet } from './FilterChip';

afterEach(() => {
  cleanup();
});

describe('FilterChip Component', () => {
  it('renders the label correctly', () => {
    const { rerender } = render(<FilterChip label="Status" isOpen={false} onToggle={() => {}} />);
    expect(screen.getByText('Status')).toBeDefined();

    rerender(<FilterChip label="Status" selectedValue="Active" isOpen={false} onToggle={() => {}} />);
    expect(screen.getByText('Status: Active')).toBeDefined();
  });

  it('triggers onToggle when the button is clicked', () => {
    const onToggleMock = vi.fn();
    render(<FilterChip label="Status" isOpen={false} onToggle={onToggleMock} />);
    
    fireEvent.click(screen.getByText('Status'));
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });

  it('renders md-menu and md-menu-item when isOpen is true', () => {
    render(<FilterChip label="Status" options={['Active', 'Pending']} isOpen={true} onToggle={() => {}} />);
    
    const menu = document.querySelector('md-menu');
    expect(menu).toBeDefined();
    expect(menu?.hasAttribute('open')).toBe(true);

    // Verify all the internal options exist inside the shadow DOM / web component slots
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('Pending')).toBeDefined();
  });
  

  it('triggers onOptionSelect and onToggle when md-menu-item is clicked', () => {
    const onOptionSelectMock = vi.fn();
    const onToggleMock = vi.fn();
    render(
      <FilterChip 
        label="Status" 
        options={['Active', 'Pending']} 
        isOpen={true} 
        onToggle={onToggleMock} 
        onOptionSelect={onOptionSelectMock}
      />
    );
    
    const menuItem = screen.getByText('Active').closest('md-menu-item');
    if (menuItem) {
      fireEvent.click(menuItem);
    }
    expect(onOptionSelectMock).toHaveBeenCalledWith('Active');
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });
});

describe('FilterChipSet Component', () => {
  it('renders multiple chips and correctly manages open state between them', () => {
    const chips = [
      { label: 'Status', options: ['Active'] },
      { label: 'Priority', options: ['High'] }
    ];
    
    render(<FilterChipSet chips={chips} />);
    
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Priority')).toBeDefined();
    
    // Clicking "Status" should open its menu
    fireEvent.click(screen.getByText('Status'));
    
    const menus = document.querySelectorAll('md-menu');
    expect(menus[0].hasAttribute('open')).toBe(true);
    expect(menus[1].hasAttribute('open')).toBe(false);
  });

  it('manages filter selection and calls onFilterChange', () => {
    const chips = [{ label: 'Status', options: ['Active', 'Pending'] }];
    const onFilterChangeMock = vi.fn();
    
    render(<FilterChipSet chips={chips} onFilterChange={onFilterChangeMock} />);
    
    fireEvent.click(screen.getByText('Status'));
    
    const activeItem = screen.getByText('Active').closest('md-menu-item');
    if (activeItem) {
      fireEvent.click(activeItem);
    }
    
    expect(onFilterChangeMock).toHaveBeenCalledWith({ 'Status': 'Active' });
    
    // Deselect
    fireEvent.click(screen.getByText('Status: Active'));
    const activeItemAgain = screen.getByText('Active').closest('md-menu-item');
    if (activeItemAgain) {
      fireEvent.click(activeItemAgain);
    }
    
    expect(onFilterChangeMock).toHaveBeenCalledWith({});
  });
});
