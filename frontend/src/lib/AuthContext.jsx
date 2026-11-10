import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/api/client';

const AuthContext = createContext(null);

// Authentification simple : un jeton JWT stocké localement, vérifié via /api/auth/me.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkUserAuth = useCallback(async () => {
    if (!api.auth.hasToken()) {
      setUser(null);
      setIsLoadingAuth(false);
      return;
    }
    setIsLoadingAuth(true);
    try {
      setUser(await api.auth.me());
    } catch {
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const logout = () => {
    setUser(null);
    api.auth.logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), isLoadingAuth, checkUserAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};
