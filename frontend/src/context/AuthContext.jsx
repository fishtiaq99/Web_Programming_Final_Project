import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        setUser(null);
        localStorage.removeItem('ignite_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
    const res = await api.post(endpoint, { email, password });
    // Store token in localStorage for cross-domain auth
    if (res.data.token) {
      localStorage.setItem('ignite_token', res.data.token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (data) => {
    const res = await api.post('/auth/signup', data);
    if (res.data.token) {
      localStorage.setItem('ignite_token', res.data.token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('ignite_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);