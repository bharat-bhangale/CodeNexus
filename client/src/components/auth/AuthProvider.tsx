'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getMe } from '@/services/authApi';

/**
 * AuthProvider — Checks for stored JWT on mount and hydrates the user.
 * Wrap this around the app's children in layout.tsx.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    // Read from localStorage inside useEffect to avoid SSR hydration mismatch
    const storedToken = localStorage.getItem('cn_access_token');
    const storedRefresh = localStorage.getItem('cn_refresh_token');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Set token in store if not already there (due to SSR)
    if (!accessToken) {
      useAuthStore.setState({ accessToken: storedToken, refreshToken: storedRefresh });
    }

    // Verify the token by fetching current user
    getMe()
      .then((user) => setUser(user))
      .catch(() => logout());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
