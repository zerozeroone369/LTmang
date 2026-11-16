import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export interface UserProfile {
  id: number;
  fullName: string;
  studentCode: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  school?: { id: number; code: string; name: string } | null;
  faculty?: { id: number; code: string; name: string } | null;
  major?: { id: number; code: string; name: string } | null;
  course?: { id: number; code: string; name: string } | null;
  classInfo?: { id: number; code: string; name: string } | null;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('uniconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('uniconnect_token');
  });

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('uniconnect_token', newToken);
    localStorage.setItem('uniconnect_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('uniconnect_token');
    localStorage.removeItem('uniconnect_user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get('/users/profile');
      if (res.data?.success && res.data.data) {
        setUser(res.data.data);
        localStorage.setItem('uniconnect_user', JSON.stringify(res.data.data));
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
