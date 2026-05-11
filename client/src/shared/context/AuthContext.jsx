import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, logout as logoutRequest } from '../../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      const currentUser = await getCurrentUser();
      if (!mounted) return;
      setUser(currentUser);
      setLoading(false);
    }

    bootstrapAuth();
    return () => {
      mounted = false;
    };
  }, []);

  function login(currentUser) {
    setUser(currentUser);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
