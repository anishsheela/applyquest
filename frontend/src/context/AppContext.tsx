import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
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
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setApplications([]);
    setContacts([]);
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
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
      if (localStorage.getItem('token')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]);

  const login = async (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    await fetchData();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchData]);

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
        isAuthenticated,
        login,
        logout,
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