import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MainContent } from './MainContent';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';

describe('MainContent Component', () => {
  let isSmallScreen = false;

  beforeEach(() => {
    isSmallScreen = false;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: isSmallScreen,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders children inside main container when side panel is closed', () => {
    render(
      <MainContent isSidePanelOpen={false}>
        <div>Main Canvas Content</div>
      </MainContent>
    );

    expect(screen.getByText('Main Canvas Content')).toBeDefined();
    expect(document.getElementById(LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID)).toBeNull();
  });

  it('renders side-by-side split layout on desktop screens (>= 1024px)', () => {
    isSmallScreen = false;

    render(
      <MainContent isSidePanelOpen={true} sidePanel={<div>Side Panel Content</div>}>
        <div>Main Canvas Content</div>
      </MainContent>
    );

    expect(screen.getByText('Main Canvas Content')).toBeDefined();
    const panelWrapper = document.getElementById(LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID);
    expect(panelWrapper).toBeDefined();
    expect(panelWrapper?.style.width).toBe('480px');
    expect(panelWrapper?.classList.contains('absolute')).toBe(false);
  });

  it('renders canvas overlay layout on narrow screens (< 1024px)', () => {
    isSmallScreen = true;

    render(
      <MainContent isSidePanelOpen={true} sidePanel={<div data-testid="panel-content">Side Panel Content</div>}>
        <div>Main Canvas Content</div>
      </MainContent>
    );

    expect(screen.getByText('Main Canvas Content')).toBeDefined();
    const panelWrapper = document.getElementById(LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID);
    expect(panelWrapper).toBeDefined();
    expect(panelWrapper?.classList.contains('absolute')).toBe(true);
    expect(panelWrapper?.classList.contains('inset-0')).toBe(true);
    expect(panelWrapper?.classList.contains('z-30')).toBe(true);
  });
});
