import * as React from 'react';

export type ViewState = 'CLOSED' | 'MINIMIZED' | 'STANDARD' | 'FULLSCREEN';

interface CreationContextProps {
  viewState: ViewState;
  title: string | null;
  activePayload: React.ReactNode | null;
  headerActions: React.ReactNode | null;
  setHeaderActions: (actions: React.ReactNode | null) => void;
  openCreation: (title: string, payload: React.ReactNode) => void;
  minimizeCreation: () => void;
  maximizeCreation: () => void; // Restores to STANDARD
  expandToFullscreen: () => void;
  collapseToStandard: () => void;
  closeCreation: () => void;
}

const CreationContext = React.createContext<CreationContextProps | undefined>(undefined);

export function CreationOverlayProvider({ children }: { children: React.ReactNode }) {
  const [viewState, setViewState] = React.useState<ViewState>('CLOSED');
  const [title, setTitle] = React.useState<string | null>(null);
  const [activePayload, setActivePayload] = React.useState<React.ReactNode | null>(null);
  const [headerActions, setHeaderActions] = React.useState<React.ReactNode | null>(null);

  const openCreation = React.useCallback((newTitle: string, payload: React.ReactNode) => {
    setTitle(newTitle);
    setActivePayload(payload);
    setViewState('STANDARD');
  }, []);

  const minimizeCreation = React.useCallback(() => {
    if (viewState !== 'CLOSED') setViewState('MINIMIZED');
  }, [viewState]);

  const maximizeCreation = React.useCallback(() => {
    if (viewState !== 'CLOSED') setViewState('STANDARD');
  }, [viewState]);

  const expandToFullscreen = React.useCallback(() => {
    if (viewState !== 'CLOSED') setViewState('FULLSCREEN');
  }, [viewState]);

  const collapseToStandard = React.useCallback(() => {
    if (viewState !== 'CLOSED') setViewState('STANDARD');
  }, [viewState]);

  const closeCreation = React.useCallback(() => {
    setViewState('CLOSED');
    // We delay clearing the payload to allow exit animations to finish smoothly
    setTimeout(() => {
      setActivePayload(null);
      setTitle(null);
      setHeaderActions(null);
    }, 400); 
  }, []);

  return (
    <CreationContext.Provider
      value={{
        viewState,
        title,
        activePayload,
        headerActions,
        setHeaderActions,
        openCreation,
        minimizeCreation,
        maximizeCreation,
        expandToFullscreen,
        collapseToStandard,
        closeCreation,
      }}
    >
      {children}
    </CreationContext.Provider>
  );
}

export function useCreationOverlay() {
  const context = React.useContext(CreationContext);
  if (!context) {
    throw new Error('useCreationOverlay must be used within a CreationOverlayProvider');
  }
  return context;
}
