import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, JobApplication, NetworkContact, DailyGoal } from '../types';
import { userService, applicationService, networkService } from '../services/api';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  contacts: NetworkContact[];
  setContacts: React.Dispatch<React.SetStateAction<NetworkContact[]>>;
  dailyGoals: DailyGoal[];
  setDailyGoals: (goals: DailyGoal[]) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, appsData, contactsData] = await Promise.all([
        userService.getCurrentUser(),
        applicationService.getAll(),
        networkService.getAll(),
      ]);
      setUser(userData);
      setApplications(appsData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        loading,
        refreshData: fetchData,
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