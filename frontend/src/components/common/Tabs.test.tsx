import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PrimaryTabs, TabItem } from './Tabs';

afterEach(() => {
  cleanup();
});

describe('Tabs Component', () => {
  const mockTabs: TabItem[] = [
    { id: 'tab1', label: 'First Tab', icon: 'home' },
    { id: 'tab2', label: 'Second Tab' }
  ];

  it('renders all tab labels', () => {
    render(<PrimaryTabs tabs={mockTabs} activeTab="tab1" onTabChange={() => {}} />);
    expect(screen.getByText('First Tab')).toBeDefined();
    expect(screen.getByText('Second Tab')).toBeDefined();
  });

  it('sets the active index correctly based on activeTab prop', () => {
    render(<PrimaryTabs tabs={mockTabs} activeTab="tab2" onTabChange={() => {}} />);
    
    // We expect the second md-primary-tab to have an active attribute assigned
    const secondTab = screen.getByText('Second Tab').closest('md-primary-tab');
    expect(secondTab?.hasAttribute('active')).toBe(true);
  });

  it('triggers onTabChange when a tab is selected', () => {
    const onTabChangeMock = vi.fn();
    render(<PrimaryTabs tabs={mockTabs} activeTab="tab1" onTabChange={onTabChangeMock} />);
    
    // Since it's a custom web component listening to a native 'change' event on md-tabs
    const mdTabsContainer = document.querySelector('md-tabs');
    if (mdTabsContainer) {
      // Simulate the internal state update of the web component
      (mdTabsContainer as any).activeTabIndex = 1;
      
      // Fire the change event manually to simulate web component emitting it
      fireEvent(
        mdTabsContainer,
        new CustomEvent('change', { bubbles: true })
      );
      
      expect(onTabChangeMock).toHaveBeenCalledWith('tab2');
    }
  });
});
