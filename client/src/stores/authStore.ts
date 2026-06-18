import { create } from 'zustand';

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  preferences: Record<string, any>;
  aiConfig: Record<string, any>;
  usage: Record<string, any>;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Hydrate from localStorage on init
  let storedToken: string | null = null;
  let storedRefresh: string | null = null;
  if (typeof window !== 'undefined') {
    storedToken = localStorage.getItem('cn_access_token');
    storedRefresh = localStorage.getItem('cn_refresh_token');
  }

  return {
    user: null,
    accessToken: storedToken,
    refreshToken: storedRefresh,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (user, accessToken, refreshToken) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cn_access_token', accessToken);
        localStorage.setItem('cn_refresh_token', refreshToken);
      }
      set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
    },

    setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

    setLoading: (loading) => set({ isLoading: loading }),

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cn_access_token');
        localStorage.removeItem('cn_refresh_token');
      }
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
    },
  };
});
