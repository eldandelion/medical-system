import React, { createContext, useContext, useState, useCallback } from 'react';

export interface NavigationEvent {
  tab: string;
  entityId?: string | number;
  timestamp: number;
}

interface NavigationContextValue {
  lastEvent: NavigationEvent | null;
  navigateToTab: (tab: string, entityId?: string | number) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [lastEvent, setLastEvent] = useState<NavigationEvent | null>(null);

  const navigateToTab = useCallback((tab: string, entityId?: string | number) => {
    setLastEvent({
      tab,
      entityId,
      timestamp: Date.now(),
    });
  }, []);

  return (
    <NavigationContext.Provider value={{ lastEvent, navigateToTab }}>
      {children}
    </NavigationContext.Provider>
  );
}

const defaultNavigationValue: NavigationContextValue = {
  lastEvent: null,
  navigateToTab: () => {},
};

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  return context ?? defaultNavigationValue;
}
