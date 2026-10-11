import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('typingiq_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await api.auth.getMe();
      setUser(profile);
      localStorage.setItem('typingiq_user', JSON.stringify(profile));
    } catch {
      localStorage.removeItem('typingiq_token');
      localStorage.removeItem('typingiq_user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleAuthChange = () => {
      fetchProfile();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await api.auth.login({ usernameOrEmail, password });
    localStorage.setItem('typingiq_token', res.token);
    localStorage.setItem('typingiq_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await api.auth.register({ username, email, password });
    localStorage.setItem('typingiq_token', res.token);
    localStorage.setItem('typingiq_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('typingiq_token');
    localStorage.removeItem('typingiq_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
