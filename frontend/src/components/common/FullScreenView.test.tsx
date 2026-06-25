import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FullScreenView } from './FullScreenView';

afterEach(() => {
  cleanup();
});

describe('FullScreenView Component', () => {
  it('does not render into the DOM when isOpen is false', () => {
    render(
      <FullScreenView isOpen={false} onClose={() => {}} title="Test Title">
        <div>Hidden Content</div>
      </FullScreenView>
    );
    expect(screen.queryByText('Test Title')).toBeNull();
  });

  it('renders title, subtitle, and content when isOpen is true', () => {
    render(
      <FullScreenView 
        isOpen={true} 
        onClose={() => {}} 
        title="Test Title" 
        subtitle="Test Subtitle"
      >
        <div>Test Content</div>
      </FullScreenView>
    );
    
    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Subtitle')).toBeDefined();
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('triggers onClose when the back button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <FullScreenView isOpen={true} onClose={onCloseMock} title="Test Title">
        <div>Content</div>
      </FullScreenView>
    );
    
    // Grab the web component icon button
    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    }
  });

  it('renders sidebar tabs and triggers onTabChange when clicked', () => {
    const tabs = [
      { id: 'tab1', label: 'Overview', icon: 'home' },
      { id: 'tab2', label: 'Details', icon: 'info' }
    ];
    const onTabChangeMock = vi.fn();
    
    render(
      <FullScreenView 
        isOpen={true} 
        onClose={() => {}} 
        title="Test Title"
        tabs={tabs}
        activeTab="tab1"
        onTabChange={onTabChangeMock}
      >
        <div>Content</div>
      </FullScreenView>
    );
    
    // Verify tabs rendered
    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Details')).toBeDefined();
    
    // Simulate user selecting the second tab
    fireEvent.click(screen.getByText('Details'));
    expect(onTabChangeMock).toHaveBeenCalledWith('tab2');
  });
});
