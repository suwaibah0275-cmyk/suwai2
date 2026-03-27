'use client';

import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [disbursements, setDisbursements] = useState([]);
  const [settings, setSettings] = useState({ systemName: 'System', schoolName: 'School', logoUrl: '' });
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <AppContext.Provider value={{ disbursements, setDisbursements, settings, setSettings, currentUser, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
