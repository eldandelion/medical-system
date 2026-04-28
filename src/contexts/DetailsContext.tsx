import * as React from 'react';

interface DetailsContextType {
  isFullScreen: boolean;
}

export const DetailsContext = React.createContext<DetailsContextType>({
  isFullScreen: false,
});

export const useDetails = () => React.useContext(DetailsContext);
