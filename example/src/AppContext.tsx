import React, { useCallback, useContext, useState } from 'react';
import type { FC } from 'react';

import { DEFAULT, type Theme } from './theme';
type ContextValue = {
  theme: Theme;
  setThemeValue: (key: keyof Theme, value: string) => void;
  setTheme: (theme: Theme) => void;
};
export const AppContext = React.createContext<ContextValue | null>(null);

export const AppContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(DEFAULT);
  const setThemeValue = useCallback(
    (key: keyof Theme, value: string) => {
      setTheme({ ...theme, [key]: value });
    },
    [theme]
  );
  return (
    <AppContext.Provider value={{ theme, setThemeValue, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw Error('Missing AppContextProvider');
  }
  return appContext;
};
