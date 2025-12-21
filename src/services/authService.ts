import { api } from './api';
import { useState, useEffect } from 'react';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/signin', { email, password });
    if (response.success && response.token) {
      api.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    api.logout();
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!api.getToken();
  },
};

// React hook for authentication state
export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(authService.getCurrentUser());
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
