'use client';

import { useState } from 'react';

interface LoginGateProps {
  onAuthenticated: () => void;
}

export default function LoginGate({ onAuthenticated }: LoginGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/editors/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onAuthenticated();
      } else {
        setError('Invalid password');
        setPassword('');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#c9a84c" fillOpacity="0.1" />
            <path d="M14 16h8c3.3 0 6 2.7 6 6s-2.7 6-6 6h-8V16zm4 4v4h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4z" fill="#c9a84c" />
            <path d="M26 16h8c3.3 0 6 2.7 6 6s-2.7 6-6 6h-2l4 4h-6l-4-4V16zm4 4v4h4c1.1 0 2-.9 2-2s-.9-2-2-2h-4z" fill="#c9a84c" fillOpacity="0.5" />
          </svg>
        </div>
        <h1 className="login-title">Binary Admin</h1>
        <p className="login-subtitle">Editor Pipeline Dashboard</p>

        <div className="input-group">
          <input
            type="password"
            className="input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={loading}
            id="login-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 16 }}
          disabled={loading || !password.trim()}
          id="login-submit"
        >
          {loading ? 'Verifying...' : 'Enter Dashboard'}
        </button>

        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
}
