import React, { useContext, useState } from 'react';
import type { FC } from 'react';

type ContextValue = [
  LucraEvent[],
  React.Dispatch<React.SetStateAction<LucraEvent[]>>,
];

export type LucraEvent = {
  type: string;
  id: string;
};

export const EventsContext = React.createContext<ContextValue | null>(null);

export const EventsContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const eventsState = useState<LucraEvent[]>([]);

  return (
    <EventsContext.Provider value={eventsState}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEventsContext = () => {
  const appContext = useContext(EventsContext);
  if (!appContext) {
    throw Error('Missing EventsContextProvider');
  }
  return appContext;
};
