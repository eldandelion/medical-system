import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DetailsPanel, DetailsSection, MetricCard, DetailItem, ScrollableDetailsLayout } from './DetailsPanel';
import { DetailsContext } from '../../contexts/DetailsContext';

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

  it('renders subtitle and badge side-by-side in subtitle row', () => {
    render(
      <DetailsPanel
        isOpen={true}
        onClose={() => {}}
        title="测试学生"
        subtitle="STU2026001"
        badge={<span data-testid="test-badge">高风险</span>}
        icon="person"
      >
        <div>Content</div>
      </DetailsPanel>
    );

    expect(screen.getByText('测试学生')).toBeDefined();
    expect(screen.getByText('STU2026001')).toBeDefined();
    expect(screen.getByTestId('test-badge')).toBeDefined();
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
    it('renders ScrollableDetailsLayout with header and footer', () => {
      render(
        <ScrollableDetailsLayout
          header={<div data-testid="layout-header">Header</div>}
          footer={<div data-testid="layout-footer">Footer</div>}
          title="Static Title"
        >
          <div>Main Content</div>
        </ScrollableDetailsLayout>
      );

      expect(screen.getByTestId('layout-header')).toBeDefined();
      expect(screen.getByTestId('layout-footer')).toBeDefined();
      expect(screen.getByText('Main Content')).toBeDefined();
    });
  });

  describe('DetailsPanel Header Override', () => {
    const ChildWithOverride = () => {
      const { setHeaderOverride } = React.useContext(DetailsContext);
      React.useEffect(() => {
        setHeaderOverride?.({
          avatar: <div data-testid="custom-avatar">张</div>,
          title: '张三',
          subtitle: 'STU2026001',
          badge: <span data-testid="custom-badge">高风险</span>,
        });
        return () => {
          setHeaderOverride?.(null);
        };
      }, [setHeaderOverride]);
      return <div>Child Content</div>;
    };

    it('renders headerOverride (avatar, title, subtitle, badge) when set by child via DetailsContext', () => {
      render(
        <DetailsPanel isOpen={true} onClose={() => {}} title="转诊详情" icon="description">
          <ChildWithOverride />
        </DetailsPanel>
      );

      expect(screen.getByTestId('custom-avatar')).toBeDefined();
      expect(screen.getByText('张三')).toBeDefined();
      expect(screen.getByText('STU2026001')).toBeDefined();
      expect(screen.getByTestId('custom-badge')).toBeDefined();
      // Original icon should not be rendered when avatar is provided
      expect(screen.queryByText('description')).toBeNull();
    });

    it('passes compound subtitle and avatar to FullScreenView when expanded with headerOverride', () => {
      render(
        <DetailsPanel isOpen={true} onClose={() => {}} title="转诊详情" icon="description">
          <ChildWithOverride />
        </DetailsPanel>
      );

      const expandIcon = screen.getByText('open_in_full');
      fireEvent.click(expandIcon);

      // Verify FullScreenView rendered custom avatar, title, subtitle and badge
      expect(screen.getAllByTestId('custom-avatar').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('张三').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('STU2026001').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByTestId('custom-badge').length).toBeGreaterThanOrEqual(2);
    });

    it('falls back to default props when headerOverride is cleared or null', () => {
      const ToggleOverrideChild = ({ enabled }: { enabled: boolean }) => {
        const { setHeaderOverride } = React.useContext(DetailsContext);
        React.useEffect(() => {
          if (enabled) {
            setHeaderOverride?.({
              avatar: <div data-testid="custom-avatar">李</div>,
              title: '李四',
            });
          } else {
            setHeaderOverride?.(null);
          }
        }, [enabled, setHeaderOverride]);
        return <div>Toggle Child</div>;
      };

      const { rerender } = render(
        <DetailsPanel isOpen={true} onClose={() => {}} title="默认标题" icon="person">
          <ToggleOverrideChild enabled={true} />
        </DetailsPanel>
      );

      expect(screen.getByTestId('custom-avatar')).toBeDefined();
      expect(screen.getByText('李四')).toBeDefined();

      rerender(
        <DetailsPanel isOpen={true} onClose={() => {}} title="默认标题" icon="person">
          <ToggleOverrideChild enabled={false} />
        </DetailsPanel>
      );

      expect(screen.queryByTestId('custom-avatar')).toBeNull();
      expect(screen.getByText('默认标题')).toBeDefined();
      expect(screen.getByText('person')).toBeDefined();
    });
  });
});

