import React, { createContext, useContext } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ isCollapsed, sidebarWidth, children }: SidebarContextType & { children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={{ isCollapsed, sidebarWidth }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    // Return a default value instead of throwing to allow standalone components
    return { isCollapsed: false, sidebarWidth: 256 };
  }
  return context;
}
