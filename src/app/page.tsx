'use client';

import { useState, useEffect } from 'react';
import LoginGate from '@/components/LoginGate';
import Dashboard from '@/components/Dashboard';
import { ToastProvider } from '@/components/shared/Toast';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already authenticated via cookie
    const checkAuth = async () => {
      try {
        const res = await fetch('/editors/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify' }),
        });
        if (res.ok) {
          const data = await res.json();
          setAuthenticated(data.authenticated === true);
        }
      } catch {
        // Not authenticated
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <ToastProvider>
      {authenticated ? (
        <Dashboard onLogout={() => setAuthenticated(false)} />
      ) : (
        <LoginGate onAuthenticated={() => setAuthenticated(true)} />
      )}
    </ToastProvider>
  );
}
