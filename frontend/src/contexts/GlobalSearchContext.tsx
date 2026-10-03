import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface GlobalSearchContextValue {
  isOpen: boolean;
  query: string;
  setQuery: (q: string) => void;
  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

export const GlobalSearchContext = createContext<GlobalSearchContextValue | undefined>(undefined);

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const openSearch = useCallback((initialQuery?: string) => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setQuery('');
        return false;
      }
      return true;
    });
  }, []);

  // Global keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  return (
    <GlobalSearchContext.Provider
      value={{
        isOpen,
        query,
        setQuery,
        openSearch,
        closeSearch,
        toggleSearch,
      }}
    >
      {children}
    </GlobalSearchContext.Provider>
  );
}

const defaultGlobalSearchValue: GlobalSearchContextValue = {
  isOpen: false,
  query: '',
  setQuery: () => {},
  openSearch: () => {},
  closeSearch: () => {},
  toggleSearch: () => {},
};

export function useGlobalSearch(): GlobalSearchContextValue {
  const context = useContext(GlobalSearchContext);
  return context ?? defaultGlobalSearchValue;
}
