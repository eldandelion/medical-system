import * as React from 'react';

export type ViewState = 'CLOSED' | 'MINIMIZED' | 'STANDARD' | 'FULLSCREEN';

export interface OpenCreationOptions {
  initialViewState?: 'STANDARD' | 'FULLSCREEN';
  allowStandardView?: boolean;
}

interface CreationContextProps {
  viewState: ViewState;
  title: string | null;
  activePayload: React.ReactNode | null;
  headerActions: React.ReactNode | null;
  allowStandardView: boolean;
  setHeaderActions: (actions: React.ReactNode | null) => void;
  openCreation: (title: string, payload: React.ReactNode, options?: OpenCreationOptions) => void;
  minimizeCreation: () => void;
  maximizeCreation: () => void; // Restores to STANDARD or FULLSCREEN if allowStandardView is false
  expandToFullscreen: () => void;
  collapseToStandard: () => void;
  closeCreation: () => void;
  requestClose: () => void;
  setOnCloseInterceptor: React.Dispatch<React.SetStateAction<(() => boolean) | null>>;
}

const CreationContext = React.createContext<CreationContextProps | undefined>(undefined);

export function CreationOverlayProvider({ children }: { children: React.ReactNode }) {
  const [viewState, setViewState] = React.useState<ViewState>('CLOSED');
  const [title, setTitle] = React.useState<string | null>(null);
  const [activePayload, setActivePayload] = React.useState<React.ReactNode | null>(null);
  const [headerActions, setHeaderActions] = React.useState<React.ReactNode | null>(null);
  const [allowStandardView, setAllowStandardView] = React.useState<boolean>(true);
  const [onCloseInterceptor, setOnCloseInterceptor] = React.useState<(() => boolean) | null>(null);

  const openCreation = React.useCallback((newTitle: string, payload: React.ReactNode, options?: OpenCreationOptions) => {
    const isFullscreenOnly = options?.allowStandardView === false;
    const targetState = options?.initialViewState || (isFullscreenOnly ? 'FULLSCREEN' : 'STANDARD');
    setTitle(newTitle);
    setActivePayload(payload);
    setAllowStandardView(!isFullscreenOnly);
    setViewState(targetState);
  }, []);

  const minimizeCreation = React.useCallback(() => {
    if (viewState !== 'CLOSED') setViewState('MINIMIZED');
  }, [viewState]);

  const maximizeCreation = React.useCallback(() => {
    if (viewState !== 'CLOSED') {
      setViewState(allowStandardView ? 'STANDARD' : 'FULLSCREEN');
    }
  }, [viewState, allowStandardView]);

  const expandToFullscreen = React.useCallback(() => {
    if (viewState !== 'CLOSED') setViewState('FULLSCREEN');
  }, [viewState]);

  const collapseToStandard = React.useCallback(() => {
    if (viewState !== 'CLOSED' && allowStandardView) setViewState('STANDARD');
  }, [viewState, allowStandardView]);

  const closeCreation = React.useCallback(() => {
    setViewState('CLOSED');
    setAllowStandardView(true);
    // We delay clearing the payload to allow exit animations to finish smoothly
    setTimeout(() => {
      setActivePayload(null);
      setTitle(null);
      setHeaderActions(null);
      setOnCloseInterceptor(null);
    }, 400); 
  }, []);

  const requestClose = React.useCallback(() => {
    if (onCloseInterceptor) {
      const shouldClose = onCloseInterceptor();
      if (!shouldClose) return; // intercepted and prevented
    }
    closeCreation();
  }, [closeCreation, onCloseInterceptor]);

  return (
    <CreationContext.Provider
      value={{
        viewState,
        title,
        activePayload,
        headerActions,
        allowStandardView,
        setHeaderActions,
        openCreation,
        minimizeCreation,
        maximizeCreation,
        expandToFullscreen,
        collapseToStandard,
        closeCreation,
        requestClose,
        setOnCloseInterceptor,
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
