import { describe, it, expect, vi, afterEach } from 'vitest';
import * as React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { GlobalSearchProvider, useGlobalSearch } from './GlobalSearchContext';

function ConsumerComponent({ initialOpenQuery }: { initialOpenQuery?: string }) {
  const { isOpen, query, setQuery, openSearch, closeSearch, toggleSearch } = useGlobalSearch();

  return (
    <div>
      <span data-testid="status">{isOpen ? 'open' : 'closed'}</span>
      <span data-testid="query">{query}</span>
      <button onClick={() => openSearch(initialOpenQuery)}>Open</button>
      <button onClick={() => closeSearch()}>Close</button>
      <button onClick={() => toggleSearch()}>Toggle</button>
      <button onClick={() => setQuery('custom-query')}>SetQuery</button>
    </div>
  );
}

describe('GlobalSearchContext', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });
  it('provides safe default fallback when consumed outside provider', () => {
    function StandaloneConsumer() {
      const { isOpen, query, setQuery, openSearch, closeSearch, toggleSearch } = useGlobalSearch();
      return (
        <div>
          <span data-testid="standalone-status">{isOpen ? 'open' : 'closed'}</span>
          <span data-testid="standalone-query">{query}</span>
          <button onClick={() => setQuery('test')}>Set</button>
          <button onClick={() => openSearch()}>Open</button>
          <button onClick={() => closeSearch()}>Close</button>
          <button onClick={() => toggleSearch()}>Toggle</button>
        </div>
      );
    }

    render(<StandaloneConsumer />);

    expect(screen.getByTestId('standalone-status').textContent).toBe('closed');
    expect(screen.getByTestId('standalone-query').textContent).toBe('');

    // Calling fallback functions shouldn't throw
    fireEvent.click(screen.getByText('Set'));
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Close'));
    fireEvent.click(screen.getByText('Toggle'));
  });

  it('manages open, close, and query state transitions', () => {
    render(
      <GlobalSearchProvider>
        <ConsumerComponent initialOpenQuery="initial" />
      </GlobalSearchProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('closed');
    expect(screen.getByTestId('query').textContent).toBe('');

    // Open with initial query
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('status').textContent).toBe('open');
    expect(screen.getByTestId('query').textContent).toBe('initial');

    // Set custom query
    fireEvent.click(screen.getByText('SetQuery'));
    expect(screen.getByTestId('query').textContent).toBe('custom-query');

    // Close resets query
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByTestId('status').textContent).toBe('closed');
    expect(screen.getByTestId('query').textContent).toBe('');

    // Toggle open and close
    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('status').textContent).toBe('open');

    fireEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('status').textContent).toBe('closed');
    expect(screen.getByTestId('query').textContent).toBe('');
  });

  it('listens for Cmd+K and Ctrl+K global keyboard shortcut', () => {
    render(
      <GlobalSearchProvider>
        <ConsumerComponent />
      </GlobalSearchProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('closed');

    // Press Cmd+K (macOS)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
          bubbles: true,
        })
      );
    });
    expect(screen.getByTestId('status').textContent).toBe('open');

    // Press Ctrl+K (Windows/Linux) to toggle closed
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'K',
          ctrlKey: true,
          bubbles: true,
        })
      );
    });
    expect(screen.getByTestId('status').textContent).toBe('closed');

    // Non-matching key combinations should not trigger
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'p',
          metaKey: true,
          bubbles: true,
        })
      );
    });
    expect(screen.getByTestId('status').textContent).toBe('closed');
  });
});
