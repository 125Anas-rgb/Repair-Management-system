import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, loadSession, saveSession, setOnSessionExpired } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  const clear = useCallback(async () => {
    await saveSession(null);
    setSession(null);
  }, []);

  useEffect(() => {
    setOnSessionExpired(() => setSession(null));
    (async () => {
      const stored = await loadSession();
      if (!stored) return setChecking(false);
      try {
        const { data } = await api.get('/auth/me');
        const next = { ...(await loadSession()), ...data };
        await saveSession(next);
        setSession(next);
      } catch {
        await clear();
      } finally {
        setChecking(false);
      }
    })();
  }, [clear]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await saveSession(data);
    setSession(data);
  }, []);

  const logout = useCallback(async () => {
    const current = await loadSession();
    await clear();
    if (current?.refreshToken) api.post('/auth/logout', { refreshToken: current.refreshToken }).catch(() => {});
  }, [clear]);

  const value = useMemo(
    () => ({
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
