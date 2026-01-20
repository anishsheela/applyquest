import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, JobApplication, NetworkContact, DailyGoal } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  applications: JobApplication[];
  setApplications: (applications: JobApplication[]) => void;
  contacts: NetworkContact[];
  setContacts: (contacts: NetworkContact[]) => void;
  dailyGoals: DailyGoal[];
  setDailyGoals: (goals: DailyGoal[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        applications,
        setApplications,
        contacts,
        setContacts,
        dailyGoals,
        setDailyGoals,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};