import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FilterChip, FilterChipSet } from './FilterChip';

afterEach(() => {
  cleanup();
});

describe('FilterChip Component', () => {
  it('renders the label correctly', () => {
    render(<FilterChip label="Status" isOpen={false} onToggle={() => {}} />);
    expect(screen.getByText('Status')).toBeDefined();
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
});
