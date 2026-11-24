import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, loadSession, saveSession, setOnSessionExpired } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());
  const [checking, setChecking] = useState(Boolean(loadSession()));

  const clear = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  // Confirm a stored session is still valid when the app opens.
  useEffect(() => {
    setOnSessionExpired(clear);
    if (!loadSession()) return;
    api
      .get('/auth/me')
      .then(({ data }) => {
        const next = { ...loadSession(), ...data };
        saveSession(next);
        setSession(next);
      })
      .catch(() => clear())
      .finally(() => setChecking(false));
  }, [clear]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveSession(data);
    setSession(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const current = loadSession();
    clear();
    if (current?.refreshToken) {
      api.post('/auth/logout', { refreshToken: current.refreshToken }).catch(() => {});
    }
  }, [clear]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      shop: session?.activeShop || null,
      role: session?.activeShop?.role || null,
      checking,
      login,
      logout,
    }),
    [session, checking, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
