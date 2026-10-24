'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, getStoredUser, getToken, removeToken, setStoredUser, setToken } from './api';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'employee' | 'Admin' | 'HR' | 'Employee';
  employeeCode?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
  isTemporaryPassword?: boolean;
  mustChangePassword?: boolean;
  company?: {
    id: string;
    name: string;
    companyName?: string;
    officeHours?: {
      start: string;
      end?: string;
      graceMinutes: number;
      halfDayHours?: number;
    };
  };
  leaveBalances?: {
    annual: number;
    sick: number;
    casual: number;
  };
  salary?: {
    basic: number;
    allowances?: number;
    hra?: number;
    medical?: number;
    gross: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSetup: boolean | null;
  isConfigured: boolean | null;
  companyName: string;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkSetup: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isSetup: null,
  isConfigured: null,
  companyName: 'Saylani Enterprises',
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  checkSetup: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState<string>('Saylani Enterprises');

  const checkSetup = async (): Promise<boolean> => {
    try {
      const res = await apiFetch('/auth/setup-status');
      const configured =
        res.isConfigured !== undefined
          ? Boolean(res.isConfigured)
          : Boolean(res.isSetup);
      setIsSetup(configured);
      const compName = res.company?.companyName || res.company?.name;
      if (compName) {
        setCompanyName(compName);
      }
      return configured;
    } catch {
      setIsSetup(false);
      return false;
    }
  };

  const normalizeUser = (userData: any): User | null => {
    if (!userData) return null;
    return {
      ...userData,
      role: (String(userData.role || 'employee').toLowerCase()) as 'admin' | 'hr' | 'employee',
      employeeCode: userData.employeeCode || userData.employeeId || 'EMP-001',
      employeeId: userData.employeeId || userData.employeeCode || 'EMP-001',
    };
  };

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/auth/me');
      if (res.success && res.user) {
        const normalized = normalizeUser(res.user);
        setUser(normalized);
        setStoredUser(normalized);
        const compName = res.user?.company?.name || res.user?.company?.companyName || res.company?.name || res.company?.companyName;
        if (compName) {
          setCompanyName(compName);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh user:', err);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const setup = await checkSetup();
      const stored = getStoredUser();
      const token = getToken();

      if (token && stored) {
        const normalized = normalizeUser(stored);
        setUser(normalized);
        await refreshUser();
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (token: string, userData: User) => {
    setToken(token);
    const normalized = normalizeUser(userData)!;
    setStoredUser(normalized);
    setUser(normalized);
    const orgName = userData.company?.name || userData.company?.companyName;
    if (orgName) {
      setCompanyName(orgName);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSetup,
        isConfigured: isSetup,
        companyName,
        login,
        logout,
        refreshUser,
        checkSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
