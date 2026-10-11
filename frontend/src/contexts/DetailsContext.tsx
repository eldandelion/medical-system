import * as React from 'react';

export interface DetailsHeaderOverride {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface DetailsTabItem {
  id: string;
  label: string;
  icon: string;
}

export interface DetailsContextType {
  isFullScreen: boolean;
  titleOverride?: string | null;
  setTitleOverride?: (title: string | null) => void;
  tabsOverride?: DetailsTabItem[] | null;
  setTabsOverride?: (tabs: DetailsTabItem[] | null) => void;
  headerOverride?: DetailsHeaderOverride | null;
  setHeaderOverride?: (header: DetailsHeaderOverride | null) => void;
}

export const DetailsContext = React.createContext<DetailsContextType>({
  isFullScreen: false,
});

export const useDetails = () => React.useContext(DetailsContext);

