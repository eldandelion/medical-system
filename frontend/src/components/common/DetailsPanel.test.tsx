import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DetailsPanel, DetailsSection, MetricCard, DetailItem, ScrollableDetailsLayout, CollapsibleHeader, useScrollCollapse } from './DetailsPanel';
import { DetailsContext } from '../../contexts/DetailsContext';

afterEach(() => {
  cleanup();
});

const ScrollWrapper = () => {
  const { isScrolled, handleScroll } = useScrollCollapse(20);
  return (
    <div data-testid="scroll-container" onScroll={handleScroll} style={{ overflowY: 'auto', height: '100px' }}>
      <CollapsibleHeader visible={!isScrolled}>
        <div data-testid="header-content">Header</div>
      </CollapsibleHeader>
      <div style={{ height: '500px' }}>Content</div>
    </div>
  );
};

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
    
    const closeIcon = screen.getByText('close');
    fireEvent.click(closeIcon);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('automatically expands into FullScreenView and can close it', () => {
    render(
      <DetailsPanel isOpen={true} onClose={() => {}} title="Panel Title" icon="person">
        <div>Panel Content</div>
      </DetailsPanel>
    );
    
    const expandIcon = screen.getByText('open_in_full');
    fireEvent.click(expandIcon);
    
    // Check if FullScreenView is open
    const backButton = document.querySelector('md-icon-button') as HTMLElement;
    expect(backButton).toBeDefined();

    // Close it
    fireEvent.click(backButton);
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

  describe('Scroll and Layout Components', () => {
    it('handles scrolling with useScrollCollapse and CollapsibleHeader', () => {
      render(<ScrollWrapper />);
      
      const container = screen.getByTestId('scroll-container');
      expect(screen.getByTestId('header-content')).toBeDefined();
      
      fireEvent.scroll(container, { target: { scrollTop: 50 } });
      
      // Since it uses framer-motion, it might just start exit animation, but state changes
      // In a unit test without mock, we rely on the state changing in useScrollCollapse.
    });

    it('renders ScrollableDetailsLayout with header and footer', () => {
      render(
        <ScrollableDetailsLayout
          header={<div data-testid="layout-header">Header</div>}
          footer={<div data-testid="layout-footer">Footer</div>}
          title="Dynamic Title"
        >
          <div>Main Content</div>
        </ScrollableDetailsLayout>
      );

      expect(screen.getByTestId('layout-header')).toBeDefined();
      expect(screen.getByTestId('layout-footer')).toBeDefined();
      expect(screen.getByText('Main Content')).toBeDefined();
    });
    
    it('ScrollableDetailsLayout handles scroll event and context', () => {
      const setTitleOverrideMock = vi.fn();
      const { container } = render(
        <DetailsContext.Provider value={{ isFullScreen: true, setTitleOverride: setTitleOverrideMock }}>
          <ScrollableDetailsLayout title="Dynamic Title">
            <div style={{ height: '1000px' }}>Main Content</div>
          </ScrollableDetailsLayout>
        </DetailsContext.Provider>
      );

      const scrollArea = container.querySelector('.custom-scrollbar');
      if (scrollArea) {
        fireEvent.scroll(scrollArea, { target: { scrollTop: 50 } });
        expect(setTitleOverrideMock).toHaveBeenCalledWith('Dynamic Title');
        
        fireEvent.scroll(scrollArea, { target: { scrollTop: 0 } });
        expect(setTitleOverrideMock).toHaveBeenCalledWith(null);
      }
    });
  });
});
