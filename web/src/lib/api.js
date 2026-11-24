import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'repairtrack.session';

// --- session storage (access + refresh token) ---------------------------
export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage blocked: the session simply lasts until the tab closes
  }
}

// --- axios client ---------------------------------------------------------
export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const session = loadSession();
  if (session?.accessToken) config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

let refreshing = null;
let onSessionExpired = () => {};
export const setOnSessionExpired = (fn) => {
  onSessionExpired = fn;
};

// When the access token expires, refresh once and retry the request.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const session = loadSession();
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (status === 401 && session?.refreshToken && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios
            .post(`${API_URL}/auth/refresh`, { refreshToken: session.refreshToken })
            .then((r) => r.data)
            .finally(() => {
              refreshing = null;
            });
        const next = await refreshing;
        saveSession(next);
        original.headers.Authorization = `Bearer ${next.accessToken}`;
        return api(original);
      } catch {
        saveSession(null);
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  },
);

// Turns any API error into a readable message plus field errors.
export function readError(error) {
  const body = error?.response?.data?.error;
  if (body) return { message: body.message, fields: body.details?.fields || {} };
  if (error?.code === 'ERR_NETWORK') {
    return { message: 'Cannot reach the server. Is the backend running?', fields: {} };
  }
  return { message: error?.message || 'Something went wrong.', fields: {} };
}
