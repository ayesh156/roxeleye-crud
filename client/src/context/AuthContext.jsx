import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(() => {
    const validated = authService.validateStorage();
    setUser(validated);
    return validated;
  }, []);

  useEffect(() => {
    if (authService.isAuthenticated()) syncUser();
    setLoading(false);
  }, [syncUser]);

  // watches for storage tampering across tabs + periodic check for dev tools
  useEffect(() => {
    function onStorageChange(e) {
      if (e.key !== 'user') return;
      const validated = syncUser();
      if (!validated && user) setUser(null);
    }

    window.addEventListener('storage', onStorageChange);
    const interval = setInterval(() => {
      if (authService.isAuthenticated()) syncUser();
    }, 2000);

    return () => {
      window.removeEventListener('storage', onStorageChange);
      clearInterval(interval);
    };
  }, [user, syncUser]);

  async function login(credentials) {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  }

  async function register(userData) {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  }

  function logout() {
    authService.logout();
    setUser(null);
  }

  const isAuthenticated = () => !!user && authService.isAuthenticated();
  const isAdmin = () => user?.role === 'ADMIN';
  const hasRole = (role) => user?.role === role;

  const permissions = {
    canViewItems: isAuthenticated,
    canCreateItem: isAuthenticated,
    canEditItem: isAdmin,
    canDeleteItem: isAdmin,
    canViewUsers: isAdmin,
    canEditUserRole: isAdmin,
    canToggleUserStatus: isAdmin,
    canDeleteUser: isAdmin,
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
      hasRole,
      permissions,
      syncUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}
