import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FC } from 'react';

import { type Theme } from './theme';
import {
  appConfigReducer,
  initialAppConfig,
  type AppConfig,
  type AppConfigAction,
} from './AppConfig';

type ContextValue = {
  state: AppConfig;
  ready: boolean;
  dispatch: React.Dispatch<AppConfigAction>;
  setThemeValue: (key: keyof Theme, value: string) => void;
};

export const AppContext = React.createContext<ContextValue | null>(null);

export const AppContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appConfigReducer, initialAppConfig);
  const [ready, setReady] = useState(false);
  const setThemeValue = useCallback(
    (key: keyof Theme, value: string) => {
      dispatch({ type: 'SET_THEME', theme: { ...state.theme, [key]: value } });
    },
    [state.theme]
  );

  useEffect(() => {
    const { dirty, ...rest } = state;
    if (dirty) {
      AsyncStorage.setItem('config', JSON.stringify(rest));
    }
  }, [state]);

  useEffect(() => {
    const loadSavedConfig = async () => {
      const savedConfig = await AsyncStorage.getItem('config');
      if (!savedConfig) {
        setReady(true);
        return;
      }
      dispatch({
        type: 'SET_CONFIG',
        config: JSON.parse(savedConfig) as AppConfig,
      });
      setReady(true);
    };
    loadSavedConfig();
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      setThemeValue,
      dispatch,
    }),
    [state, ready, setThemeValue, dispatch]
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw Error('Missing AppContextProvider');
  }
  return appContext;
};
