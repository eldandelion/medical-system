import * as React from 'react';

interface DetailsContextType {
  isFullScreen: boolean;
  titleOverride?: string | null;
  setTitleOverride?: (title: string | null) => void;
}

export const DetailsContext = React.createContext<DetailsContextType>({
  isFullScreen: false,
});

export const useDetails = () => React.useContext(DetailsContext);
