import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

/**
 * API address.
 * - If EXPO_PUBLIC_API_URL is set in mobile/.env, that is used.
 * - Otherwise, in Expo Go, we reuse the IP of the computer running `npx expo start`
 *   (the same machine runs the backend on port 4000). So no IP needs typing.
 */
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.5:8081"
  const host = hostUri ? hostUri.split(':')[0] : 'localhost';
  return `http://${host}:4000/api/v1`;
}

export const API_URL = resolveApiUrl();
const STORAGE_KEY = 'repairtrack_session';

export async function loadSession() {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSession(session) {
  try {
    if (session) await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
    else await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch {
    // ignore storage failures; user just signs in again next time
  }
}

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const session = await loadSession();
  if (session?.accessToken) config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

let onSessionExpired = () => {};
export const setOnSessionExpired = (fn) => {
  onSessionExpired = fn;
};

// Refresh the access token once on 401, then retry.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const session = await loadSession();
    const isAuthCall = original?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && session?.refreshToken && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: session.refreshToken });
        await saveSession(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        await saveSession(null);
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  },
);

export function readError(error) {
  const body = error?.response?.data?.error;
  if (body) return { message: body.message, fields: body.details?.fields || {} };
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return { message: `Cannot reach the server at ${API_URL}. Is the backend running and the phone on the same Wi-Fi?`, fields: {} };
  }
  return { message: error?.message || 'Something went wrong.', fields: {} };
}
