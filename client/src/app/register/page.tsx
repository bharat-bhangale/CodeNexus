'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { registerUser } from '@/services/authApi';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser(fullName, email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">N</div>
          <span className="auth-logo-text">CodeNexus</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start building with AI-powered coding</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="auth-input"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
              autoComplete="name"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="auth-input"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              className="auth-input"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <Loader2 size={16} className="auth-loading-spinner" /> : null}
            <span>{loading ? 'Creating account...' : 'Create account'}</span>
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
