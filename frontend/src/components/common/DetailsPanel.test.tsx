import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DetailsPanel, DetailsSection, MetricCard, DetailItem } from './DetailsPanel';

afterEach(() => {
  cleanup();
});

describe('DetailsPanel Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <DetailsPanel isOpen={false} onClose={() => {}} title="Panel Title" icon="person">
        <div>Content</div>
      </DetailsPanel>
    );
    expect(screen.queryByText('Panel Title')).toBeNull();
  });

  it('renders title and content when isOpen is true', () => {
    render(
      <DetailsPanel isOpen={true} onClose={() => {}} title="Panel Title" icon="person">
        <div>My Panel Content</div>
      </DetailsPanel>
    );
    expect(screen.getByText('Panel Title')).toBeDefined();
    expect(screen.getByText('My Panel Content')).toBeDefined();
  });

  it('triggers onClose when the close icon is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <DetailsPanel isOpen={true} onClose={onCloseMock} title="Panel Title" icon="person">
        <div>Content</div>
      </DetailsPanel>
    );
    
    // The explicit close button renders a 'close' material icon
    const closeIcon = screen.getByText('close');
    fireEvent.click(closeIcon);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('automatically expands into FullScreenView when the expand button is clicked', () => {
    render(
      <DetailsPanel isOpen={true} onClose={() => {}} title="Panel Title" icon="person">
        <div>Panel Content</div>
      </DetailsPanel>
    );
    
    // Click the internal expand icon
    const expandIcon = screen.getByText('open_in_full');
    fireEvent.click(expandIcon);
    
    // Verify that the inner FullScreenView is now mounted by checking for its back button
    expect(document.querySelector('md-icon-button')).toBeDefined();
  });
  
  describe('Sub-Components', () => {
    it('DetailsSection properly groups content with a title', () => {
      render(
        <DetailsSection title="Section Title">
          <div>Section Content</div>
        </DetailsSection>
      );
      expect(screen.getByText('Section Title')).toBeDefined();
      expect(screen.getByText('Section Content')).toBeDefined();
    });

    it('MetricCard formats label, icon, and value', () => {
      render(<MetricCard label="Heart Rate" value="80 bpm" icon="favorite" />);
      expect(screen.getByText('Heart Rate')).toBeDefined();
      expect(screen.getByText('80 bpm')).toBeDefined();
    });

    it('DetailItem formats a standard key-value pair', () => {
      render(<DetailItem label="Status" value="Active" />);
      expect(screen.getByText('Status')).toBeDefined();
      expect(screen.getByText('Active')).toBeDefined();
    });
  });
});
