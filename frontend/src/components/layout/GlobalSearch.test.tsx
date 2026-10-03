import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { GlobalSearch } from './GlobalSearch';
import { GlobalSearchContext } from '../../contexts/GlobalSearchContext';

describe('GlobalSearch Component', () => {
  const mockOpenSearch = vi.fn();
  const mockCloseSearch = vi.fn();
  const mockToggleSearch = vi.fn();
  const mockSetQuery = vi.fn();

  function renderWithContext(ui: React.ReactElement) {
    return render(
      <GlobalSearchContext.Provider
        value={{
          isOpen: false,
          query: '',
          setQuery: mockSetQuery,
          openSearch: mockOpenSearch,
          closeSearch: mockCloseSearch,
          toggleSearch: mockToggleSearch,
        }}
      >
        {ui}
      </GlobalSearchContext.Provider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders default placeholder and search icon', () => {
    renderWithContext(<GlobalSearch />);

    expect(screen.getByText('搜索学生、转诊或测评量表...')).toBeDefined();
    expect(screen.getByRole('button', { name: /全局搜索/ })).toBeDefined();
  });

  it('renders custom placeholder when provided', () => {
    renderWithContext(<GlobalSearch placeholder="自定义搜索占位符..." />);

    expect(screen.getByText('自定义搜索占位符...')).toBeDefined();
  });

  it('triggers openSearch on click', () => {
    renderWithContext(<GlobalSearch />);

    const searchButton = screen.getByRole('button', { name: /全局搜索/ });
    fireEvent.click(searchButton);

    expect(mockOpenSearch).toHaveBeenCalledTimes(1);
  });

  it('triggers openSearch on Enter and Space keys', () => {
    renderWithContext(<GlobalSearch />);

    const searchButton = screen.getByRole('button', { name: /全局搜索/ });

    fireEvent.keyDown(searchButton, { key: 'Enter' });
    expect(mockOpenSearch).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(searchButton, { key: ' ' });
    expect(mockOpenSearch).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(searchButton, { key: 'ArrowDown' });
    expect(mockOpenSearch).toHaveBeenCalledTimes(2);
  });

  it('renders platform adaptive shortcut badge (macOS vs non-macOS)', () => {
    const originalNavigator = globalThis.navigator;

    // Simulate non-macOS
    Object.defineProperty(globalThis, 'navigator', {
      value: { platform: 'Win32' },
      configurable: true,
    });

    render(
      <GlobalSearchContext.Provider
        value={{
          isOpen: false,
          query: '',
          setQuery: mockSetQuery,
          openSearch: mockOpenSearch,
          closeSearch: mockCloseSearch,
          toggleSearch: mockToggleSearch,
        }}
      >
        <GlobalSearch />
      </GlobalSearchContext.Provider>
    );

    expect(screen.getByText('Ctrl+K')).toBeDefined();

    // Restore navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });
});
