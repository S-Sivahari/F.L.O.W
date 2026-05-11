import { useAuthContext } from '../context/AuthContext.jsx';

export default function useAuth() {
  const ctx = useAuthContext();
  return {
    user: ctx?.user,
    role: ctx?.role,
    isAuthenticated: ctx?.isAuthenticated,
    loading: ctx?.loading,
    login: ctx?.login,
    logout: ctx?.logout,
  };
}
